# Data Flow - PDF Upload to Database Persistence

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER SESSION 1                               │
└─────────────────────────────────────────────────────────────────────┘

1. REGISTER/LOGIN
   Browser → POST /api/auth/login → Backend
   Backend validates password, creates JWT token
   ← Returns: {success: true, token: "abc123...", user_id: "xyz..."}
   
   Frontend stores:
   - token in localStorage/memory
   - user info in AuthContext

2. SELECT & UPLOAD PDF
   User clicks "Select File" in Dashboard
   Browser reads file: test.pdf (user selects from computer)
   
3. FRONTEND: Call handleFileUpload()
   (Location: App.js line 170)
   
   FormData = {pdf: <file object>}
   POST /api/pdf/upload-pdf with JWT token
   └─ Headers: Authorization: Bearer {token}

4. BACKEND: Process PDF (pdf_routes.py)
   Receives file → validates it's a PDF
   Saves to: BACKEND/static/uploads/{uuid}_test.pdf
   Extracts text → counts pages and sentences
   
   Response:
   {
     success: true,
     filename: "a1b2c3d4_test.pdf",     ← UUID-prefixed filename
     original_filename: "test.pdf",     ← Original name
     pages: 5,
     total_sentences: 45,
     pdf_url: "http://localhost:5000/static/uploads/a1b2c3d4_test.pdf"
   }

5. FRONTEND: Receive Upload Response (App.js line ~175)
   ✓ Display PDF in DocumentReader
   ✓ Collect metadata from response
   ✓ Create historyData object:
   
   historyData = {
     pdf_name: "test.pdf",
     pdf_path: "a1b2c3d4_test.pdf",
     total_pages: 5,
     total_sentences: 45,
     file_size: 102400
   }

6. FRONTEND: Save to Database
   (Location: App.js line ~188-190)
   
   await addToHistory(historyData)
   └─ Calls AuthContext.addToHistory()
      POST /api/history with JWT token
      Headers: Authorization: Bearer {token}
      Body: historyData
   
   └─ Response: {success: true, history_id: "h123..."}

7. BACKEND: Store in MongoDB (history_routes.py)
   Receives POST /api/history
   Extracts user_id from JWT token
   Creates history entry:
   
   {
     _id: ObjectId(...),
     user_id: ObjectId("user_auth_id"),  ← KEY: Links to user
     pdf_name: "test.pdf",
     pdf_path: "a1b2c3d4_test.pdf",
     total_pages: 5,
     total_sentences: 45,
     file_size: 102400,
     current_page: 0,
     status: "in_progress",
     created_at: 2024-01-15T10:30:00Z,
     updated_at: 2024-01-15T10:30:00Z
   }
   
   Stores in: MongoDB > dyslexia_assistant > history collection

8. FRONTEND: Fetch Updated History
   (Location: App.js line ~191)
   
   await fetchHistory()
   └─ Calls AuthContext.fetchHistory()
      GET /api/history with JWT token
      Headers: Authorization: Bearer {token}
   
   └─ Response: {success: true, history: [...], count: 1}
      Response contains the newly added PDF!

9. FRONTEND: Display in Progress Tracking
   Component updates pdfHistory state
   ProgressTracking.jsx renders the table with:
   - PDF Name: "test.pdf"
   - Pages: 5
   - Progress: 0% (page 0 of 5)
   - Status: "in progress"
   - Last Activity: Just now

┌─────────────────────────────────────────────────────────────────────┐
│                    DATA PERSISTED IN DATABASE                       │
│              (Exists independently of browser session)              │
└─────────────────────────────────────────────────────────────────────┘

⏰ TIME PASSES...

┌─────────────────────────────────────────────────────────────────────┐
│                        USER SESSION 2                               │
│                   (Same email, new browser tab)                     │
└─────────────────────────────────────────────────────────────────────┘

10. BROWSER REFRESH / NEW SESSION
    User goes to http://localhost:3000
    App loads, no token in storage
    AuthContext starts fresh
    Frontend redirects to signin page

11. SIGNIN AGAIN
    User enters email: test@gmail.com
    Enters password
    
    Frontend: POST /api/auth/login
    Backend: Validates credentials, returns JWT token
    ← Same token as Session 1? NO - new token, but same user_id
    
    Frontend stores new token
    AuthContext updates with user info and new token

12. NAVIGATE TO PROGRESS TRACKING
    User clicks on Progress Tracking page
    Component mounts → useEffect runs
    
    Calls: fetchHistory()
    └─ GET /api/history with NEW token
       Headers: Authorization: Bearer {new_token}
       Backend extracts user_id from new token (it's the same user_id!)

13. BACKEND: Query MongoDB
    (history_routes.py line ~20)
    
    user_id = extract_from_jwt_token(new_token)
    
    Query MongoDB:
    > db.history.find({user_id: ObjectId(user_id)})
    
    MongoDB returns: [
      {
        _id: ObjectId(...),
        user_id: ObjectId(...),
        pdf_name: "test.pdf",  ← FOUND! Same PDF from Session 1
        pdf_path: "a1b2c3d4_test.pdf",
        total_pages: 5,
        total_sentences: 45,
        current_page: 0,
        status: "in_progress",
        ...
      }
    ]

14. FRONTEND: Display Persistent Data
    Response: {success: true, history: [{pdf_name: "test.pdf", ...}]}
    
    AuthContext updates pdfHistory state
    ProgressTracking.jsx re-renders with the book!
    
    ✅ USER SEES: "test.pdf" in their reading history

15. RESUME READING
    User clicks on the PDF in history
    App loads the PDF from disk
    Displays with same page count, sentence count, etc.
    User can continue reading!

```

## 🔐 Security: Why User's PDF's Don't Show for Other Users

```
User A logs in:
- Token contains user_id = "abc123"
- GET /api/history extracts user_id from token
- Query: db.history.find({user_id: "abc123"})
- Returns: Only PDFs where user_id = "abc123"

User B logs in with same email/password? 
- NOT POSSIBLE - Different users have different credentials
- Each user's password is hashed differently

User B tries to hijack User A's token?
- Token expires after 24 hours
- Token signature can't be forged (backend has secret key)
- If they somehow got token, MongoDB still filters by user_id

Result: User A sees ONLY User A's books
        User B sees ONLY User B's books
```

## 📁 File System Layout

```
BACKEND/
├── static/
│   ├── uploads/                     ← PDF files stored here
│   │   ├── a1b2c3d4_test.pdf       ← UUID prefix for uniqueness
│   │   ├── x5y6z7w8_another.pdf
│   │   └── ...
│   └── selections/
├── routes/
│   ├── pdf_routes.py               ← Handles upload
│   └── history_routes.py           ← Handles history API
├── models/
│   └── pdf_history.py              ← MongoDB queries
├── db.py                           ← MongoDB connection
└── app.py

MongoDB (Local or Atlas):
dyslexia_assistant/
├── users collection               ← User accounts
├── history collection             ← Reading history
│   ├── Document 1 (User A's PDF)
│   ├── Document 2 (User A's PDF)
│   ├── Document 3 (User B's PDF)
│   └── ...
└── admin collection
```

## 🔄 Key Variables at Each Step

| Step | Variable | Value | Purpose |
|------|----------|-------|---------|
| 1 | token | "eyJhbGci..." | JWT token for authentication |
| 1 | user_id | "507f1f7..." | MongoDB ObjectId of user |
| 3 | formData | {pdf: File} | Browser file object |
| 4 | filename | "a1b2c3d_test.pdf" | Stored filename with UUID |
| 5 | historyData | {pdf_name, pdf_path, ...} | Metadata to save |
| 7 | MongoDB doc | {_id, user_id, pdf_name, ...} | Persisted entry |
| 12 | new_token | "eyJhbGci..." | New JWT (different token, same user_id) |
| 13 | extracted_user_id | "507f1f7..." | Extracted from new_token (same as step 1!) |
| 13 | MongoDB query | {user_id: "507f1f7..."} | Finds same user's PDFs |
| 14 | history response | [{pdf_name: "test.pdf", ...}] | User's PDFs (now in Session 2!) |

## ✨ The Magic Moment

**Step 13 → Step 14 Transition**

This is where persistence happens:
```
Session 1:                          Session 2:
├─ Upload PDF                       ├─ Login again
├─ Save to MongoDB ──────────────── → (data persists here)
└─ User logs out                    ├─ Query MongoDB for user
                                    │  (finds data from Session 1)
                                    └─ Display PDF in Progress Tracking
                                       ✅ PERSISTENCE ACHIEVED!
```

The database is the "bridge" between sessions!

## 🎯 What Could Go Wrong

1. **MongoDB not running**: Database.find() fails → returns empty list
2. **Token expired**: get_jwt_identity() returns None → no user_id to query
3. **User_id mismatch**: Different user_ids for same user → can't find PDFs
4. **Frontend doesn't call addToHistory()**: PDF in memory but not saved
5. **Frontend doesn't call fetchHistory()**: Data not synced to display
6. **PDF file deleted**: Can't reload from disk (but metadata persists)

## ✅ How to Verify Each Step

```bash
# Step 1: JWT Token
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"test@gmail.com","password":"pwd"}' \
  # Look for "token" in response

# Step 7: MongoDB Entry
mongosh
> db.history.findOne({pdf_name: "test.pdf"})
# Should show document with user_id

# Step 13: Token contains correct user_id
# Decode JWT at jwt.io - check payload.sub or payload.user_id

# Step 14: History after re-login
curl -X GET http://localhost:5000/api/history \
  -H "Authorization: Bearer $NEW_TOKEN" \
  # Should see same PDF in response
```


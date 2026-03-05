# ⚡ Quick Start - PDF Persistence Testing

## 🚀 Start Services (Open 3 terminals)

### Terminal 1: MongoDB
```bash
mongod
# or
brew services start mongodb-community  # Mac
# or
mongo  # Windows (if installed)
```

**Expected output**: `[initandlisten] waiting for connections on port 27017`

### Terminal 2: Backend
```bash
cd BACKEND
python app.py
```

**Expected output**: 
```
[OK] Connected to MongoDB: dyslexia_assistant
 * Running on http://127.0.0.1:5000
```

### Terminal 3: Frontend
```bash
cd FRONTEND
npm start
```

**Expected output**: Browser opens at `http://localhost:3000`

---

## 🧪 Test Persistence (5 minutes)

### Step 1: Register
- URL: `http://localhost:3000`
- Click "Sign Up"
- Email: `test@example.com`
- Password: `Test123!@#`
- Click "Sign Up"

### Step 2: Upload PDF
- Click "Dashboard"
- Click "Select File From Your Device"
- Choose any PDF file
- Click "Process PDF"
- ✅ PDF appears in DocumentReader

### Step 3: Verify Progress Tracking
- Click hamburger menu
- Click "Progress Tracking"
- ✅ Your uploaded book should appear in the table

### Step 4: Logout
- Click hamburger menu
- Click "Logout"
- ✅ You're back at login screen

### Step 5: Login Again (Same Email)
- Email: `test@example.com`
- Password: `Test123!@#`
- Click "Sign In"

### Step 6: Check Progress Tracking
- Click hamburger menu
- Click "Progress Tracking"
- ✅ ✅ ✅ **YOUR UPLOADED BOOK SHOULD STILL APPEAR HERE!**

---

## ✅ Success = Persistence Works!

If you can see the book after logout/login:
```
🎉 Congratulations! PDF Persistence is working!
```

If book disappears:
```
❌ See troubleshooting below
```

---

## 🔍 Quick Troubleshooting

### Book disappears after logout/login
```
1. Is MongoDB running?
   mongod command should show: "waiting for connections"
   
2. Check backend console
   Should show: "[OK] Connected to MongoDB"
   
3. Open browser DevTools (F12)
   - Go to Console tab
   - Look for red error messages
   - Go to Network tab
   - Filter by "history"
   - Check POST /api/history response
   - Should be 201 with {success: true}
```

### Backend shows MongoDB error
```
1. Kill existing MongoDB: Ctrl+C
2. Start fresh: mongod
3. Restart backend: python app.py
4. Check for: "[OK] Connected to MongoDB"
```

### Frontend shows network error
```
1. Check backend is running on port 5000
2. Check CORS error in browser console
3. Verify backend shows: "Running on http://127.0.0.1:5000"
```

---

## 🔗 Check API Directly (Advanced)

### Get JWT Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'
```

Save token from response as: `TOKEN="abc123..."`

### View Uploaded Books
```bash
curl -X GET http://localhost:5000/api/history \
  -H "Authorization: Bearer $TOKEN"
```

Should return: `{"success": true, "history": [...]}`

### View MongoDB Directly
```bash
mongosh
> db.history.find()
```

Should show documents with pdf_name, user_id, etc.

---

## 📊 Expected Data in MongoDB

```json
{
  "_id": ObjectId("..."),
  "user_id": ObjectId("..."),
  "pdf_name": "YourFile.pdf",
  "pdf_path": "a1b2c3d4_YourFile.pdf",
  "total_pages": 5,
  "total_sentences": 45,
  "file_size": 102400,
  "current_page": 0,
  "status": "in_progress",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

## 🎯 What You're Testing

1. **Upload Works** ← Existing feature
2. **Database Save Works** ← NEW! We added this
3. **Database Query Works** ← NEW! We added this
4. **User Isolation Works** ← System feature
5. **Persistence Works** ← End result!

---

## 📝 Code That Makes It Work

**In App.js (line 170-191)**:
```javascript
// After upload succeeds:
const historyData = {
  pdf_name: response.data.original_filename,
  pdf_path: response.data.filename,
  total_pages: response.data.pages || 1,
  total_sentences: response.data.total_sentences || 0,
  file_size: file.size
};

// Save to database
await addToHistory(historyData);

// Refresh display
await fetchHistory();
```

This ensures:
1. PDF file is saved to disk
2. Metadata is saved to MongoDB
3. Display is updated with new book

---

## 🚨 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| MongoDB connection refused | Run `mongod` first |
| Backend error on startup | Install MongoDB first, then run `mongod` |
| Book disappears after logout | Check MongoDB is running |
| Network error | Check backend port 5000 is not blocked |
| Upload fails | Check file is valid PDF |
| History endpoint returns empty | Verify JWT token is valid |
| Can't login | Check email/password are correct |

---

## 📋 Verification Checklist

- [ ] MongoDB running (see "waiting for connections")
- [ ] Backend running (see "[OK] Connected to MongoDB")
- [ ] Frontend loading (no errors in console)
- [ ] Can register/login
- [ ] Can upload PDF
- [ ] Book appears in Progress Tracking
- [ ] Can logout without errors
- [ ] Can login again with same email
- [ ] **MAIN TEST**: Book appears in Progress Tracking after re-login
- [ ] Can click book to view details

✅ **All checked = Success!**

---

## 🎊 You're All Set!

Your app now has: **PDF Persistence**

Users can:
1. ✅ Upload books
2. ✅ Read them
3. ✅ Logout
4. ✅ Login again
5. ✅ See their books again!

**That's the feature working!**

---

## 📚 Learn More

- Full guide: `PDF_PERSISTENCE_VERIFICATION.md`
- See data flow: `DATA_FLOW_EXPLANATION.md`
- Implementation: `PERSISTENCE_IMPLEMENTATION_SUMMARY.md`
- Run test: `python test_pdf_persistence.py`


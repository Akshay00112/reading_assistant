# PDF Persistence Verification Guide

## Overview
Your uploaded PDFs should now persist in the MongoDB database across logout/login sessions. This document provides a checklist and troubleshooting guide.

## ✅ Code Changes Made

### 1. **Frontend (App.js) - handleFileUpload()**
- **What changed**: Added code to save uploaded PDFs to the database
- **Location**: `handleFileUpload()` function around line 170
- **Code added**:
  ```javascript
  // Save the uploaded PDF to history database for persistence
  const historyData = {
    pdf_name: response.data.original_filename,
    pdf_path: response.data.filename,
    total_pages: response.data.pages || 1,
    total_sentences: response.data.total_sentences || 0,
    file_size: file.size
  };
  
  await addToHistory(historyData);
  await fetchHistory();
  ```

### 2. **Frontend (AuthContext.js)**
- Already has `addToHistory()` method (no changes needed)
- Method POSTs to `/api/history` endpoint
- Automatically calls `fetchHistory()` to sync display

### 3. **Backend (history_routes.py)**
- Already has endpoints (no changes needed)
- `POST /api/history` - Saves PDF with user_id
- `GET /api/history` - Retrieves user's PDFs only

### 4. **Backend (pdf_history.py model)**
- Already has MongoDB operations (no changes needed)
- Stores user_id with each history entry
- Only returns PDFs for the authenticated user

## 🧪 Testing the Feature

### Quick Manual Test (5 minutes)
1. **Start the backend**: 
   ```bash
   cd BACKEND
   python app.py
   ```

2. **Start the frontend**:
   ```bash
   cd FRONTEND
   npm start
   ```

3. **Test the flow**:
   - Go to http://localhost:3000
   - Sign up with a new email
   - Upload a PDF from Dashboard
   - **Verify**: PDF appears in "Progress Tracking" page
   - **Logout** from the app
   - **Login again** with the same email
   - **Verify**: The uploaded PDF STILL appears in Progress Tracking

### Automated Test (Using Test Script)
Run the comprehensive test script to automate the verification:

```bash
python test_pdf_persistence.py
```

This script will:
1. Create a test user
2. Upload a test PDF
3. Logout
4. Login again
5. Verify the PDF appears in history
6. Report results with color-coded output

**Note**: The script requires `reportlab` for PDF creation:
```bash
pip install reportlab
```

## 📊 Expected Behavior

### After Upload
- PDF appears immediately in "Progress Tracking" 
- Reading history shows the new book
- User can start reading

### After Logout
- Session is cleared
- Auth token is removed
- PDF file remains on disk (in `BACKEND/static/uploads/`)

### After Re-login with Same Email
- History is automatically loaded from MongoDB
- **Previously uploaded PDFs appear in Progress Tracking**
- User can continue reading where they left off

### MongoDB Storage Structure
```json
{
  "_id": "ObjectId(...)",
  "user_id": "ObjectId(...)",
  "pdf_name": "document.pdf",
  "pdf_path": "uuid_document.pdf",
  "total_pages": 5,
  "total_sentences": 45,
  "file_size": 102400,
  "current_page": 0,
  "status": "in_progress",
  "created_at": "2024-...",
  "updated_at": "2024-..."
}
```

## ⚠️ Troubleshooting

### Problem: "PDF appears after upload, but disappears after logout/relogin"

**Issue**: Database is not saving the PDF

**Solutions**:
1. **Check MongoDB is running**:
   ```bash
   # On Windows
   mongod  # Start MongoDB
   
   # On Mac
   brew services start mongodb-community
   ```

2. **Verify backend logs** for database errors:
   - Look for connection errors in console
   - Should see: `[OK] Connected to MongoDB: dyslexia_assistant`

3. **Check browser console** for fetch errors:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for errors in red
   - Check Network tab to see if POST to `/api/history` succeeds

4. **Verify JWT token is being sent**:
   - In DevTools Network tab
   - Click on the history request
   - Go to Request Headers
   - Should see: `Authorization: Bearer <token>`

### Problem: "Upload works but history endpoint returns empty"

**Issue**: PDF saved to database but not retrieved

**Solutions**:
1. **Verify user_id matching**: The same user_id must be used for both save and retrieve
2. **Check MongoDB directly**:
   ```bash
   mongo dyslexia_assistant
   > db.history.find()  # View all history entries
   > db.history.findOne({user_id: ObjectId("...")})  # Find by user
   ```

### Problem: "Backend says 'MongoDB connection error'"

**Issue**: MongoDB service is not running

**Solutions**:
1. **Start MongoDB service**:
   - Windows: Search "Services" → find "MongoDB Server" → Start
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

2. **Check MongoDB is accessible**:
   ```bash
   mongosh  # or mongo
   > show dbs
   ```

3. **Verify connection string** in `BACKEND/db.py`:
   - Default: `mongodb://localhost:27017/dyslexia_assistant`
   - For Atlas: Use `.env` file with `MONGO_URI`

## 📋 Verification Checklist

- [ ] MongoDB is running
- [ ] Backend starts without connection errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Can register/login successfully
- [ ] Can upload PDF (appears in Progress Tracking)
- [ ] PDF shows correct page count and sentence count
- [ ] Can logout without errors
- [ ] Can login again with same email
- [ ] **KEY**: Uploaded PDF appears in Progress Tracking after re-login
- [ ] Can see PDF in history table with all metadata

## 🔧 Advanced Verification

### Check API Directly
Use curl or Postman to test the API:

```bash
# 1. Login and get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"password"}'

# Save the token from response as: TOKEN="abc123..."

# 2. Get history (requires token)
curl -X GET http://localhost:5000/api/history \
  -H "Authorization: Bearer $TOKEN"

# 3. Add to history
curl -X POST http://localhost:5000/api/history \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pdf_name": "test.pdf",
    "pdf_path": "uuid_test.pdf",
    "total_pages": 5,
    "total_sentences": 45,
    "file_size": 102400
  }'
```

### Check Database Directly
```bash
mongosh dyslexia_assistant

# View all PDFs
db.history.find({})

# View PDFs for specific user
db.history.find({user_id: ObjectId("...")})

# Count total PDFs
db.history.countDocuments()

# Check indexes
db.history.getIndexes()
```

## 📞 Support

If persistence is still not working:

1. **Collect debug info**:
   - Screenshot of browser console errors
   - Backend console output (full startup to error)
   - MongoDB connection status

2. **Run test script and share output**:
   ```bash
   python test_pdf_persistence.py > test_results.txt 2>&1
   ```

3. **Check logs**:
   - Frontend errors: Browser DevTools Console
   - Backend errors: Terminal/Console where Flask is running
   - Database: Check MongoDB logs

## 🎯 Success Indicators

✅ **Persistence is working if**:
- You can upload a book
- Logout
- Login again
- See the book in Progress Tracking
- Can click on it to continue reading
- Page count matches what was uploaded

This means your reading history is persistent across sessions!

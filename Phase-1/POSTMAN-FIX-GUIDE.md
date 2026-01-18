# 🔧 Postman Upload Fix Guide

## ❌ Your Current Problem

**Error**: `read ECONNRESET`  
**Request Body**: `file: undefined`

This means: **Postman is NOT properly attaching your file**

---

## ✅ Step-by-Step Fix (Follow EXACTLY)

### Step 1: Open Postman
- Create a **new request** or open existing one

### Step 2: Set Method & URL
```
Method: POST
URL: http://localhost:3000/upload/ingest
```
⚠️ **NO query parameters needed** (remove `?full=true` for now)

### Step 3: Headers Tab
Click **Headers** tab and add:
```
Key: x-api-key
Value: test
```
✅ Postman will show this in the list

### Step 4: Body Tab (THIS IS THE CRITICAL PART)

1. Click **Body** tab
2. **IMPORTANT**: Select the radio button **"form-data"** (NOT raw, NOT x-www-form-urlencoded)
3. You'll see a table with columns: **Key** | **Value** | **Type**

4. In the **Key** column, type exactly: `file`
   - Must be lowercase
   - Must be exactly `file` (not `File`, not `FILE`, not `file: undefined`)

5. Look at the **Type** column - there's a dropdown that says **"Text"**
   - **CLICK THE DROPDOWN** and change it to **"File"**
   - This is the MOST IMPORTANT STEP!

6. Now in the **Value** column, you'll see a button **"Select Files"**
   - Click **"Select Files"**
   - Choose your Excel (.xlsx, .xls) or CSV (.csv) file
   - The file name should appear in the Value column

### Step 5: Verify Before Sending

Your Postman should look like this:

```
┌─────────────────────────────────────────────────────────┐
│ POST │ http://localhost:3000/upload/ingest            │
├─────────────────────────────────────────────────────────┤
│ Params │ Authorization │ Headers │ Body │ Pre-request │
├─────────────────────────────────────────────────────────┤
│ Headers Tab:                                            │
│ ───────────────────────────────────────────────────────│
│ x-api-key: test                                         │
├─────────────────────────────────────────────────────────┤
│ Body Tab:                                               │
│ ○ none  ● form-data  ○ x-www-form-urlencoded  ○ raw   │
│                                                         │
│ Key          │ Value              │ Type                │
│ ─────────────┼───────────────────┼─────────────────────│
│ file         │ test-metadata.csv │ File ▼              │
│              │ [Select Files]    │                     │
└─────────────────────────────────────────────────────────┘
```

**Checklist:**
- ✅ Method is POST
- ✅ URL is correct
- ✅ Headers has `x-api-key: test`
- ✅ Body tab shows "form-data" selected
- ✅ Key is exactly `file`
- ✅ Type dropdown shows "File" (NOT "Text")
- ✅ Value shows your file name (NOT "undefined")

### Step 6: Send Request
Click **Send** button

---

## 🎯 Visual Indicators of Success

### ✅ CORRECT Setup:
```
Key: file
Value: test-metadata.csv  ← File name appears here
Type: File ▼              ← Dropdown shows "File"
```

### ❌ WRONG Setup:
```
Key: file: undefined       ← Wrong! Remove this
Value: undefined           ← Wrong! No file selected
Type: Text ▼              ← Wrong! Should be "File"
```

---

## 🔍 Troubleshooting

### Problem: Still shows "file: undefined"

**Solution:**
1. Delete the entire row in Postman Body tab
2. Add a NEW row
3. Type `file` in Key column
4. **IMMEDIATELY** change Type dropdown to "File" BEFORE selecting file
5. Then click "Select Files"

### Problem: Type dropdown doesn't show "File" option

**Solution:**
- Make sure you selected **"form-data"** radio button (not raw, not x-www-form-urlencoded)
- If you don't see "File" option, you're in the wrong body type

### Problem: "Select Files" button is grayed out

**Solution:**
- Change Type dropdown to "File" first
- Then "Select Files" will become clickable

### Problem: Connection reset error persists

**Solution:**
1. Check server is running: `npm start` in Phase-1 folder
2. Check server logs for errors
3. Try a smaller file first (test-metadata.csv)
4. Restart Postman
5. Clear Postman cache: File → Settings → Clear All

---

## 🧪 Test Endpoint

Test your Postman setup:
```
GET http://localhost:3000/upload/test
```

This will return detailed instructions.

---

## 📝 Quick Reference

| Setting | Value |
|---------|-------|
| Method | POST |
| URL | `http://localhost:3000/upload/ingest` |
| Header | `x-api-key: test` |
| Body Type | `form-data` |
| Key Name | `file` (exactly) |
| Type | `File` (dropdown) |
| Value | Your file (via "Select Files") |

---

## ✅ Success Response

When configured correctly, you'll get:
```json
{
  "success": true,
  "message": "✅ Complete! Logical and Physical models generated...",
  "data": {
    "fileId": "1234567890123",
    "artifacts": { ... }
  }
}
```

---

## 🆘 Still Not Working?

1. **Check server logs** - Look for error messages
2. **Try test endpoint**: `GET http://localhost:3000/upload/test`
3. **Verify file exists**: Make sure your file is accessible
4. **Check file size**: Max 50MB
5. **Check file type**: Only .xlsx, .xls, .csv allowed

---

## 💡 Pro Tip

**Use Postman Collection** - Save this request as a collection so you can reuse it:
1. Click "Save" button
2. Create new collection: "EY POC Upload"
3. Save request as: "Upload File"
4. Next time, just open from collection and select file!


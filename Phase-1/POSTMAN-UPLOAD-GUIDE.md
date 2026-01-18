# 📤 Postman File Upload Guide

## ✅ Correct Setup

### 1. **Request Configuration**
- **Method**: `POST`
- **URL**: `http://localhost:3000/upload/ingest?full=true`
  - ⚠️ **Important**: Use `?full=true` (NOT `?full===true`)

### 2. **Headers**
- **x-api-key**: `test` (or your API key)
- **Content-Type**: `multipart/form-data` (Postman sets this automatically)

### 3. **Body Tab**
1. Select **Body** tab
2. Choose **form-data** (NOT raw, NOT x-www-form-urlencoded)
3. Add a key:
   - **Key name**: `file` (exactly this, case-sensitive)
   - **Type**: Change from "Text" to **"File"** (dropdown on the right)
   - **Value**: Click "Select Files" and choose your Excel/CSV file

### 4. **Visual Guide**
```
┌─────────────────────────────────────┐
│ Body  │ Headers │ Params │ ...      │
├─────────────────────────────────────┤
│ ○ none  ○ form-data  ○ x-www...    │
│                                      │
│ Key          │ Value │ Type         │
│ ─────────────┼───────┼─────────────│
│ file         │ [📁]  │ File ▼       │
│              │       │ (Select File)│
└─────────────────────────────────────┘
```

## ❌ Common Mistakes

### ❌ Wrong: Field name is "file: undefined"
```
Key: file: undefined
```
**Fix**: Remove this and add a new key named exactly `file`

### ❌ Wrong: Using "Text" type instead of "File"
```
Key: file
Type: Text ▼
Value: [some text]
```
**Fix**: Change type dropdown to "File" and select actual file

### ❌ Wrong: Query parameter with triple equals
```
URL: .../ingest?full===true
```
**Fix**: Use `?full=true` (single equals)

### ❌ Wrong: Using "raw" body instead of form-data
```
Body → raw → JSON
```
**Fix**: Use Body → form-data

## 🔍 Troubleshooting

### Error: "ECONNRESET" or "Connection reset"
**Causes**:
1. Field name is wrong (should be `file`, not `file: undefined`)
2. Content-Type is not multipart/form-data
3. File type is set to "Text" instead of "File"
4. Query parameter has `===` instead of `=`

**Solution**: Follow the setup guide above exactly.

### Error: "No-File-Uploaded"
**Causes**:
1. Field name is not exactly `file`
2. File type is "Text" instead of "File"
3. No file selected

**Solution**: 
- Check Body tab → form-data
- Ensure key is named `file`
- Change type to "File"
- Select your Excel/CSV file

### Error: "Invalid File-type"
**Causes**: File is not Excel (.xlsx, .xls) or CSV (.csv)

**Solution**: Upload only Excel or CSV files

## 📝 Example cURL Command

If you prefer command line:

```bash
curl -X POST \
  http://localhost:3000/upload/ingest?full=true \
  -H "x-api-key: test" \
  -F "file=@/path/to/your/file.xlsx"
```

## ✅ Success Response

When successful, you'll get:
```json
{
  "success": true,
  "message": "✅ Complete! Logical and Physical models generated automatically...",
  "data": {
    "fileId": "1234567890123",
    "artifacts": {
      "logical": { "dbml": "...", "erd_png": "...", ... },
      "physical": { "mysql_sql": "..." },
      "executive": { "report": "...", "interactive": "..." }
    }
  }
}
```


# 💾 Metadata Storage System

## 📊 How It Works

```
┌─────────────────────────────────────────────────────────┐
│  1. User Uploads Excel/CSV                              │
│     POST /upload/ingest                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  Parse & Enhance    │
        │  - Excel/CSV Parser │
        │  - PK/FK Heuristics │
        │  - LLM Analysis     │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  Save to Disk       │
        │  artifacts/         │
        │    └── <fileId>/    │
        │        └── metadata.json  ← ALL 711 rows here!
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │  Return fileId      │
        │  to user            │
        └─────────────────────┘
```

---

## 📁 Directory Structure

```
artifacts/
├── 1768288214005/              ← fileId (timestamp)
│   ├── metadata.json           ← Source of truth!
│   ├── schema.dbml             ← (Generated later)
│   ├── postgres.sql            ← (Generated later)
│   ├── snowflake.sql           ← (Generated later)
│   ├── erd.mmd                 ← (Generated later)
│   ├── erd.png                 ← (Generated later)
│   └── erd.svg                 ← (Generated later)
└── 1768287140736/
    └── metadata.json
```

---

## 📄 metadata.json Structure

```json
{
  "fileId": "1768288214005",
  "originalName": "Test-1-EY.xlsx",
  "uploadedAt": "2026-01-13T10:30:00.000Z",
  "fileSize": 162321,
  "filePath": "uploads/1768288214005_&_Test-1-EY.xlsx",
  
  "metadata": {
    "rowCount": 711,
    "tableCount": 31,
    "tables": {
      "account": {
        "tableName": "account",
        "columns": [
          {
            "columnName": "tax_reporting_contact",
            "dataType": "VARCHAR",
            "isPrimaryKey": false,
            "isForeignKey": false,
            "nullable": true,
            "_sourceRow": 77
          },
          {
            "columnName": "account_id",
            "dataType": "VARCHAR",
            "isPrimaryKey": true,
            "isForeignKey": false,
            "_pkSource": "inferred",
            "_pkConfidence": 0.85
          }
          // ... all columns for 'account' table
        ]
      },
      "employee": {
        "tableName": "employee",
        "columns": [...]
      }
      // ... all 31 tables
    }
  },
  
  "inference": {
    "primaryKeys": { "explicit": 0, "inferred": 31 },
    "foreignKeys": { "explicit": 0, "inferred": 15 }
  },
  
  "llmStatus": {
    "initialized": false,
    "provider": "Ollama",
    "modelName": "deepseek-r1:7b"
  },
  
  "artifacts": {
    "dbml": { "generated": false },
    "sql_postgres": { "generated": false },
    "sql_snowflake": { "generated": false },
    "erd_png": { "generated": false },
    "erd_svg": { "generated": false }
  },
  
  "createdAt": "2026-01-13T10:30:00.000Z"
}
```

---

## 🔄 Complete Flow

### 1. Upload & Save

```bash
POST http://localhost:3000/upload/ingest
Content-Type: multipart/form-data

file: Test-1-EY.xlsx
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded, parsed, and metadata saved successfully!",
  "data": {
    "fileId": "1768288214005",
    "originalName": "Test-1-EY.xlsx",
    "metadata": {
      "rowCount": 711,
      "tableCount": 31,
      "tables": ["account", "employee", ...]
    },
    "artifacts": {
      "metadataPath": "artifacts/1768288214005/metadata.json",
      "available": ["dbml", "sql", "erd"]
    }
  }
}
```

**What Happened:**
✅ File uploaded to `uploads/1768288214005_&_Test-1-EY.xlsx`
✅ Parsed 711 rows, 31 tables
✅ Applied heuristics
✅ Saved to `artifacts/1768288214005/metadata.json`

---

### 2. Generate Artifacts (Module 5 - Coming Next)

```bash
POST http://localhost:3000/generate/dbml
Content-Type: application/json

{
  "fileId": "1768288214005"
}
```

**What Will Happen:**
1. Read `artifacts/1768288214005/metadata.json`
2. Generate DBML from metadata.tables
3. Save to `artifacts/1768288214005/schema.dbml`
4. Return DBML content

---

## 🎯 Why This Works

| Benefit | Explanation |
|---------|-------------|
| **Simple** | Just JSON files on disk |
| **Fast** | No database connection needed |
| **Portable** | Works anywhere |
| **Inspectable** | Open JSON in any editor |
| **Recoverable** | Copy/backup artifacts folder |
| **Demo-friendly** | Zero setup required |

---

## 📝 File Operations

### Save Metadata
```javascript
import { saveMetadata } from './storage/fileStorage.js';

await saveMetadata(fileId, data);
// Saves to: artifacts/<fileId>/metadata.json
```

### Get Metadata
```javascript
import { getMetadata } from './storage/fileStorage.js';

const data = await getMetadata(fileId);
// Reads from: artifacts/<fileId>/metadata.json
```

### Save Artifact
```javascript
import { saveArtifact } from './storage/fileStorage.js';

await saveArtifact(fileId, 'dbml', content, 'schema.dbml');
// Saves to: artifacts/<fileId>/schema.dbml
```

---

## ✅ Current Status

**Implemented:**
- ✅ File storage layer (`src/storage/fileStorage.js`)
- ✅ Save metadata on upload
- ✅ Return fileId in response
- ✅ Artifacts directory auto-created

**Next (Module 5):**
- ⏳ Generate DBML from metadata.json
- ⏳ Generate SQL DDL from metadata.json
- ⏳ Generate ERD from metadata.json

---

## 🚀 Test It

1. **Start server:**
   ```bash
   npm start
   ```

2. **Upload file:**
   ```bash
   curl -X POST http://localhost:3000/upload/ingest \
     -H "X-API-Key: dev-api-key-change-in-production" \
     -F "file=@test-files/Test-1-EY.xlsx"
   ```

3. **Check artifacts folder:**
   ```bash
   ls artifacts/
   # You'll see: 1768288214005/
   
   cat artifacts/1768288214005/metadata.json
   # All 711 rows stored here!
   ```

---

**Ready for Module 5: Artifact Generation!** 🎯


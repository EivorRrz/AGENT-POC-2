# 🚀 QUICK START GUIDE

## **What You Have Now**

✅ **Upload Excel/CSV files** with metadata  
✅ **Automatic PK/FK inference** (Heuristics + LLM)  
✅ **Generate Logical Models** (DBML)  
✅ **Generate ERD Pictures** (PNG, SVG, PDF)  
✅ **Store everything on disk** (artifacts folder)  

---

## **Start the Server**

```bash
cd Phase-1
npm start
```

Server starts on: `http://localhost:3000`

---

## **Test the Complete Flow**

### **1. Upload File**

```bash
curl -X POST http://localhost:3000/upload/ingest \
  -H "x-api-key: dev-api-key-change-in-production" \
  -F "file=@Test-1-EY.xlsx"
```

**Response:**
```json
{
  "status": "success",
  "fileId": "1768301805095",
  "artifacts": {
    "metadataPath": "artifacts/1768301805095/metadata.json"
  },
  "metadata": {
    "rowCount": 711,
    "tableCount": 31,
    "tables": ["Customer", "Order", ...]
  },
  "inference": {
    "primaryKeys": { "explicit": 4, "inferred": 27 },
    "foreignKeys": { "explicit": 12, "inferred": 45 }
  }
}
```

**Copy the `fileId` from the response!**

---

### **2. Generate Artifacts (Logical Model + Pictures)**

```bash
curl -X POST http://localhost:3000/generate/1768301805095
```

**Response:**
```json
{
  "status": "success",
  "message": "Generated 3 artifact types",
  "fileId": "1768301805095",
  "artifacts": {
    "dbml": {
      "path": "artifacts/1768301805095/schema.dbml",
      "size": 12345
    },
    "mermaid": {
      "path": "artifacts/1768301805095/erd.mmd",
      "size": 8901
    },
    "images": {
      "svg": "artifacts/1768301805095/erd.svg",
      "png": "artifacts/1768301805095/erd.png",
      "pdf": "artifacts/1768301805095/erd.pdf"
    }
  }
}
```

---

### **3. View Generated Files**

Open the folder:
```
artifacts/1768301805095/
```

You'll see:
- ✅ `metadata.json` - All processed metadata
- ✅ `schema.dbml` - Logical model (DBML format)
- ✅ `erd.mmd` - Mermaid source code
- ✅ `erd.png` - **ERD Picture (PNG)**
- ✅ `erd.svg` - **ERD Picture (Vector)**
- ✅ `erd.pdf` - **ERD Picture (PDF)**

---

## **Using Postman**

### **Import Collection**

Create a new Postman collection with these requests:

#### **1. Upload File**
- **Method**: `POST`
- **URL**: `http://localhost:3000/upload/ingest`
- **Headers**:
  - `x-api-key`: `dev-api-key-change-in-production`
- **Body**: `form-data`
  - Key: `file` (type: File)
  - Value: Select your Excel/CSV file

#### **2. Generate Artifacts**
- **Method**: `POST`
- **URL**: `http://localhost:3000/generate/{fileId}`
  - Replace `{fileId}` with the ID from step 1

#### **3. Check Status**
- **Method**: `GET`
- **URL**: `http://localhost:3000/generate/{fileId}/status`

---

## **Troubleshooting**

### **Issue: "Failed to render Mermaid diagram"**

**Solution**: Puppeteer needs to download Chromium first time:
```bash
cd Phase-1
npx puppeteer browsers install chrome
```

### **Issue: "LLM not available"**

**Solution**: This is **normal** if you don't have Ollama running. The system works fine with just heuristics!

To enable LLM:
1. Install Ollama: https://ollama.ai
2. Run: `ollama run deepseek-r1:7b`
3. Restart server

### **Issue: "API key invalid"**

**Solution**: Make sure you're sending the correct header:
```
x-api-key: dev-api-key-change-in-production
```

### **Issue: "File too large"**

**Solution**: File limit is 10MB. Split large files or increase limit in `src/middleware/upload.js`

---

## **File Structure**

```
Phase-1/
├── src/
│   ├── config/
│   │   └── index.js               # Configuration
│   ├── generators/
│   │   ├── dbmlGenerator.js       # ✅ Logical model generator
│   │   ├── erdGenerator.js        # ✅ ERD picture generator
│   │   └── index.js               # Exports
│   ├── routes/
│   │   └── generate.js            # ✅ Generation endpoints
│   ├── middleware/
│   │   └── upload.js              # Upload handler
│   ├── parsers/
│   │   ├── excelParser.js         # Excel parsing
│   │   ├── csv-parser.js          # CSV parsing
│   │   └── index.js               # Parser orchestration
│   ├── heuristics/
│   │   ├── pkFkInference.js       # PK/FK inference logic
│   │   └── index.js               # Exports
│   ├── llm/
│   │   ├── llmService.js          # Ollama integration
│   │   ├── pkfkAssist.js          # AI-powered analysis
│   │   ├── schema.js              # JSON schemas
│   │   └── index.js               # Exports
│   ├── storage/
│   │   └── fileStorage.js         # File system storage
│   ├── utils/
│   │   └── logger.js              # Pino logger
│   └── server.js                  # Main server
├── artifacts/                     # Generated artifacts
│   └── {fileId}/
│       ├── metadata.json
│       ├── schema.dbml            # ✅
│       ├── erd.mmd                # ✅
│       ├── erd.png                # ✅
│       ├── erd.svg                # ✅
│       └── erd.pdf                # ✅
├── uploads/                       # Uploaded files
├── package.json
└── .env                           # Environment variables
```

---

## **Environment Variables**

Create `.env` file:

```env
# Server
PORT=3000
NODE_ENV=development

# Security
API_KEY=dev-api-key-change-in-production

# Storage
ARTIFACTS_DIR=./artifacts
UPLOAD_DIR=./uploads

# LLM (Optional - Ollama)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:7b
```

---

## **What's Next?**

### **Completed** ✅
- Module 1: File Upload Handler
- Module 2: Excel/CSV Parser
- Module 3: PK/FK Heuristics
- Module 4: LLM Assist (Ollama)
- Module 5: Artifact Generation (Logical + Pictures)

### **Next Steps** ⏳
- **Physical Models**: SQL DDL for PostgreSQL & Snowflake
- **API Improvements**: Batch generation, caching
- **UI Dashboard**: Web interface for visualization
- **Enhanced LLM**: Better prompts, more models

---

## **Quick Commands**

```bash
# Start server
npm start

# Test upload
curl -X POST http://localhost:3000/upload/ingest \
  -H "x-api-key: dev-api-key-change-in-production" \
  -F "file=@test.xlsx"

# Test generation (replace {fileId})
curl -X POST http://localhost:3000/generate/{fileId}

# Check health
curl http://localhost:3000/health

# View logs (formatted)
npm start | pino-pretty
```

---

## **Success Indicators**

When everything is working, you'll see:

```
🚀 Server running on http://localhost:3000
📁 Upload directory: ./uploads
📦 Artifacts directory: ./artifacts
✅ Artifacts directory created
🧠 Initializing LLM...
✅ LLM initialized successfully!
```

---

**You're ready to test!** 🎉

Upload a file, generate artifacts, and check the `artifacts/{fileId}/` folder for your DBML and ERD pictures!


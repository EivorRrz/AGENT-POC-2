#  Agent-02: AI-Powered Data Model Generator

> **Intelligent metadata processing system that automatically generates logical models and ERD diagrams from Excel/CSV files using AI-assisted PK/FK inference.**

**Built by**: EY POC Team - Amit Mishra  
**Organization**: Ernst & Young  
**Repository**: https://github.com/EivorRrz/AGENT-POC-2  
**Status**: 85% Complete (Production POC)

---

##  What It Does

Upload Excel/CSV metadata files → Get instant:
- ✅ DBML logical models
- ✅ ERD diagrams (PNG, SVG, PDF)
- ✅ AI-powered PK/FK inference
- ✅ Relationship mapping

---

## ✅ Completed Modules (85%)

| Module | Status | Description |
|--------|--------|-------------|
| **Module 1** | ✅ **DONE** | File Upload Handler (Multer + API Auth) |
| **Module 2** | ✅ **DONE** | Excel/CSV Parser (Multi-sheet support) |
| **Module 3** | ✅ **DONE** | PK/FK Heuristics (70-75% accuracy) |
| **Module 4** | ✅ **DONE** | LLM Assist (Ollama + DeepSeek-R1:7B) |
| **Module 5A** | ✅ **DONE** | Logical Model Generator (DBML) |
| **Module 5B** | ✅ **DONE** | ERD Picture Generator (PNG/SVG/PDF) |
| **Module 5C** | ⏳ **TODO** | Physical Models (PostgreSQL/Snowflake DDL) |

---

## ⏳ What's Left

- [ ] **Physical Model Generation** - SQL DDL for PostgreSQL & Snowflake
- [ ] Web UI Dashboard (optional)
- [ ] Batch Processing (optional)

**Current POC covers**: Logical modeling & visualization (85% complete)

---

##  Quick Start

```bash
# Clone repository
git clone https://github.com/EivorRrz/AGENT-POC-2.git
cd AGENT-POC-2/Phase-1

# Install dependencies
npm install

# Start server
npm start
```

Server runs on: `http://localhost:3000`

---

## 📡 API Endpoints

### 1. Upload File
```http
POST /upload/ingest
Header: x-api-key: dev-api-key-change-in-production
Body: file (multipart/form-data)
```

**Response**: Returns `fileId`

---

### 2. Generate Artifacts
```http
POST /generate/{fileId}
```

**Response**:
```json
{
  "status": "success",
  "artifacts": {
    "dbml": { "path": "artifacts/{fileId}/schema.dbml" },
    "mermaid": { "path": "artifacts/{fileId}/erd.mmd" },
    "images": {
      "png": "artifacts/{fileId}/erd.png",
      "svg": "artifacts/{fileId}/erd.svg",
      "pdf": "artifacts/{fileId}/erd.pdf"
    }
  }
}
```

---

### 3. Check Status
```http
GET /generate/{fileId}/status
GET /health
```

---

## 📦 Generated Artifacts

Each upload creates:

```
artifacts/{fileId}/
├── metadata.json          ✅ Complete parsed data
├── schema.dbml            ✅ Logical model (DBML)
├── erd.mmd                ✅ Mermaid ERD source
├── erd.png                ✅ ERD diagram (PNG)
├── erd.svg                ✅ ERD diagram (SVG)
└── erd.pdf                ✅ ERD diagram (PDF)
```

---

## ⚙️ Configuration

**File**: `.env`

```env
PORT=3000
API_KEY=dev-api-key-change-in-production
ARTIFACTS_DIR=./artifacts
UPLOAD_DIR=./uploads

# LLM (Optional - Ollama)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:7b

# ERD Display
ERD_COLUMN_LIMIT=9999  # Show all columns

# Puppeteer (MS Edge)
PUPPETEER_EXECUTABLE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
```

---

## 📊 Performance

| File Type | Size | Tables | Columns | Processing Time |
|-----------|------|--------|---------|----------------|
| Small | 2 KB | 4 | 14 | ~10s |
| Medium | 50 KB | 31 | 712 | ~35s |
| Large | 500 KB | 100 | 2000 | ~75s |

**Limits**:
- Max file size: 10 MB (configurable)
- Supports 100+ tables
- Tested with 5000+ columns

---

## 💼 Use Cases

1. **Database Design** - Generate logical models from Excel specs
2. **Legacy System Analysis** - Document existing schemas
3. **Data Migration** - Analyze source metadata
4. **Compliance** - Generate audit-ready diagrams

---

## 🧪 Testing with Postman

**1. Upload File**
```
POST http://localhost:3000/upload/ingest
Header: x-api-key: dev-api-key-change-in-production
Body: file = your-file.xlsx
```

**2. Generate Artifacts**
```
POST http://localhost:3000/generate/{fileId}
```
(Use `fileId` from step 1 response)

**3. View Results**
```
Check folder: artifacts/{fileId}/
```

---

## 📚 Additional Documentation

| Document | Description |
|----------|-------------|
| [GENERATION-FLOW.md](GENERATION-FLOW.md) | Complete flow with diagrams |
| [EDGE-SETUP-COMPLETE.md](EDGE-SETUP-COMPLETE.md) | MS Edge configuration |
| [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md) | Storage layer details |
| [install.ps1](install.ps1) | Installation script |

---

## 📸 Example Output

**DBML Logical Model**:
```dbml
Table customer {
  id INTEGER [pk]
  name VARCHAR [not null]
  email VARCHAR
}

Table order {
  id INTEGER [pk]
  customer_id INTEGER
  order_date DATE
}

// Relationships
Ref: order.customer_id > customer.id
```

**ERD Diagram**: Shows all tables, columns, PKs, FKs, and relationships in PNG/SVG/PDF formats.

---

## 👥 Team & Support

**Developer**: Amit Mishra  
**Team**: EY POC Innovation Team  
**Organization**: Ernst & Young  

**Repository**: https://github.com/EivorRrz/AGENT-POC-2  
**Issues**: https://github.com/EivorRrz/AGENT-POC-2/issues

<div align="center">

[⬆ Back to Top](#-agent-02-ai-powered-data-model-generator)

</div>

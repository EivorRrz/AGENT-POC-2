#  Agent-02: AI-Powered Data Model Generator

> **Intelligent metadata processing system that automatically generates logical models and ERD diagrams from Excel/CSV files using AI-assisted PK/FK inference.**

**Built by**: EY POC Team - Amit Mishra  
**Organization**: Ernst & Young  
**Repository**: https://github.com/EivorRrz/AGENT-POC-2  
**Status**: 100% Complete (Production POC with Logical + Physical + AI Q&A)

---

##  What It Does

Upload Excel/CSV metadata files → Get instant:
- ✅ DBML logical models
- ✅ ERD diagrams (PNG, SVG, PDF)
- ✅ AI-powered PK/FK inference
- ✅ Relationship mapping

---

## ✅ Completed Modules (100%)

| Module | Status | Description |
|--------|--------|-------------|
| **Module 1** | ✅ **DONE** | File Upload Handler (Multer + API Auth) |
| **Module 2** | ✅ **DONE** | Excel/CSV Parser (Multi-sheet support) |
| **Module 3** | ✅ **DONE** | PK/FK Heuristics (70-75% accuracy) |
| **Module 4** | ✅ **DONE** | LLM Assist (Ollama + DeepSeek-R1:7B) |
| **Module 5A** | ✅ **DONE** | Logical Model Generator (DBML) |
| **Module 5B** | ✅ **DONE** | ERD Picture Generator (PNG/SVG/PDF) |
| **Module 5C** | ✅ **DONE**| Physical Models (PostgreSQL/Snowflake DDL) |

---


**Current POC covers**: Logical & Physical modeling + AI Q&A (100% complete for MySQL)

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
**Repository**: https://github.com/EivorRrz/AGENT-POC-2  
**Issues**: https://github.com/EivorRrz/AGENT-POC-2/issues

---

## 🔧 End‑to‑End Flow (Logical + Physical + AI Q&A)

### 1. Ingest & Logical Model (Phase‑1)

```bash
cd Phase-1

# Install dependencies
npm install

# Start API server (upload + generate)
npm start
```

Main API endpoints (default: `http://localhost:3000`):

- **Upload file**  
  `POST /upload/ingest` (multipart `file`, header `x-api-key`)

- **Generate all artifacts (logical + ERDs + physical via Phase‑2)**  
  `POST /generate/{fileId}`

- **Generate logical only (strict LDM)**  
  `POST /generate/logical/{fileId}`  
  or CLI:  
  ```bash
  node generate-logical.js {fileId}
  ```

Artifacts layout:

```text
Phase-1/artifacts/{fileId}/
  ├── json/metadata.json              # Parsed source metadata
  ├── logical/                        # Logical model (LDM)
  │   ├── logical.dbml
  │   ├── erd.png / erd.svg
  │   └── logical.json
  ├── physical/                       # Physical model (PDM)
  │   ├── mysql.sql
  │   ├── erd.png / erd.svg
  │   ├── physical_lineage.json
  │   ├── physical_impact.json
  │   └── physical_graph_insights.json
  └── executive/
      ├── EXECUTIVE_REPORT.html
      └── erd_INTERACTIVE.html
```

---

### 2. Physical Model & Executive Outputs (Phase‑2)

```bash
cd Phase-2

# Install dependencies
npm install

# Generate full physical model + ERDs + executive + analysis
node generate-complete.js {fileId}
```

This produces for each `{fileId}`:

- `mysql.sql` – production‑grade MySQL DDL (PK/FK, CHECK, DEFAULT, indexes, timestamps)
- Physical ERD – `erd.png`, `erd.svg`
- Executive dashboard – `EXECUTIVE_REPORT.html`, `erd_INTERACTIVE.html`
- Graph analysis:
  - `physical_lineage.json` – **Data Lineage** (“where each column came from”)
  - `physical_impact.json` – **Impact Analysis** (“what breaks if we change/drop”)
  - `physical_graph_insights.json` – **Graph Insights** (health/risk checks)

---

### 3. Leader/Manager Q&A CLI (AI Communication Layer)

```bash
cd Phase-2
node cli-qa.js {fileId}
```

Then ask questions at the prompt:

```text
Q> Where did order.customer_id come from?
Q> What happens if we drop the order table?
Q> Is this schema safe for production?
```

The CLI:

- Loads only the precomputed JSON artifacts:
  - `physical_lineage.json`
  - `physical_impact.json`
  - `physical_graph_insights.json`
- Sends them to the local LLM (DeepSeek via Ollama).
- Returns a **short, plain‑English answer** for leaders.

**Important:**  
The LLM is **only a communication layer**:
- ✅ It explains lineage, impact, and risks in simple English.  
- ❌ It does **not** generate or change SQL / ERDs.  
- ❌ It does **not** decide correctness; all facts come from the JSON artifacts.

---

## ✅ Current POC Status (AI Agent)-Completed..!

- Logical model generation (LDM) – **complete**
- Physical model generation (PDM, MySQL) – **complete**
- Physical ERD diagrams – **complete**
- Executive HTML dashboard – **complete**
- Data Lineage JSON – **complete**
- Impact Analysis JSON – **complete**
- AI‑driven Graph Insights JSON – **complete**
- CLI Q&A (leader‑friendly AI agent) – **complete**


“Upload → Generate → View dashboards/ERDs → Ask the model questions in plain English.”

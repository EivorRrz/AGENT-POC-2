# Agent-02: Data Model Generator(Phase-1)

Generate database models (ERD, DBML, SQL) from Excel/CSV files using local LLM.

## Features

-  Parse Excel/CSV files and generate database schemas
-  Powered by DeepSeek-R1 (local LLM via Ollama)
-  API key protection for secure access
-  Generates ERD diagrams, DBML, and SQL scripts
-  Express server with health checks and logging

## Prerequisites

- **Node.js** (v18 or higher)
- **Ollama** with DeepSeek-R1:7b model

## Quick Setup

### 1. Install Ollama & Model

Download Ollama from [ollama.ai](https://ollama.ai), then:

```bash
ollama pull deepseek-r1:7b
```

### 2. Install Dependencies

```bash
cd Phase-1
$env:PUPPETEER_SKIP_DOWNLOAD="true"
npm install
```

### 3. Configure Environment

Create a `.env` file in the `Phase-1` folder:

```env
PORT=3000
API_KEY=your-secure-api-key-here
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:7b
NODE_ENV=development
```

### 4. Start the Server

```bash
npm start
```

Server runs at `http://localhost:3000`

## How It Works

```
1. Upload File (Excel/CSV)
   ↓
2. Parse Data (711 rows → 31 tables)
   ↓
3. Detect Data Types (VARCHAR, INT, DATE, etc.)
   ↓
4. Infer PK/FK (Heuristics + LLM)
   ↓
5. Save metadata.json (Complete data model)
   ↓
6. Generate Artifacts (DBML, SQL, ERD)
   ↓
7. Return Results
```

## Usage

### Health Check
```bash
curl http://localhost:3000/health
```

### Upload & Generate Models
```bash
curl -X POST http://localhost:3000/api/generate ^
  -H "x-api-key: your-secure-api-key-here" ^
  -F "file=@path/to/your/data.xlsx"
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded, parsed, and metadata saved successfully!",
  "data": {
    "fileId": "1768301805095",
    "originalName": "Test-1-EY.xlsx",
    "metadata": {
      "rowCount": 711,
      "tableCount": 31,
      "tables": ["account", "employee", "transaction", ...]
    },
    "artifacts": {
      "metadataPath": "artifacts/1768301805095/metadata.json",
      "available": ["dbml", "sql", "erd"]
    }
  }
}
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/generate` | POST | Upload file & generate models |

## Tech Stack

- **Backend**: Express.js, Multer
- **Parser**: SheetJS (XLSX), csv-parse
- **LLM**: Ollama + DeepSeek-R1
- **Generators**: DBML CLI, Mermaid CLI
- **Logging**: Pino

## Project Structure

```
Phase-1/
├── src/
│   ├── server.js           # Main server
│   ├── routes/             # API routes
│   ├── parsers/            # Excel/CSV parsers
│   ├── llm/                # LLM service
│   ├── generators/         # DBML/ERD/SQL generators
│   ├── heuristics/         # PK/FK inference
│   ├── storage/            # File storage layer
│   └── artifacts/          # Generated outputs
├── artifacts/              # Persistent storage
│   └── <fileId>/
│       └── metadata.json   # Source of truth
└── test-files/             # Sample data files
```

## Implementation Status

### Currently Working

| Feature | Status | Description |
|---------|--------|-------------|
| File Upload | Done | Excel/CSV files up to 10MB |
| Excel Parsing | Done | SheetJS (XLSX) parser |
| CSV Parsing | Done | csv-parse library |
| Data Type Detection | Done | Automatic type inference |
| PK/FK Inference | Done | Heuristics-based detection |
| LLM Integration | Done | DeepSeek-R1 via Ollama |
| Storage Layer | Done | JSON-based file storage |
| API Security | Done | API key protection |
| Health Check | Done | Server status endpoint |
| Logging | Done | Pino with pretty format |

### Storage System

When you upload a file, it creates:

```
artifacts/
└── 1768301805095/              <- Unique fileId (timestamp)
    └── metadata.json           <- All parsed data stored here
```

**metadata.json** contains:
- Original file info (name, size, upload time)
- All tables and columns (complete schema)
- Detected data types (VARCHAR, INT, DATE, etc.)
- Inferred primary keys & foreign keys
- Confidence scores (0.0 - 1.0)
  - **0.85+** High confidence (strong pattern match)
  - **0.60-0.84** Medium confidence (partial match)
  - **< 0.60** Low confidence (weak signals)
- Ready for artifact generation

### Coming Next (Pending)

| Feature | Status | Module |
|---------|--------|--------|
| DBML Generation | Pending | Module 5 |
| SQL DDL Generation | Pending | Module 5 |
| ERD Diagram (PNG) | Pending | Module 5 |
| ERD Diagram (SVG) | Pending | Module 5 |
| Data Lineage | Pending | Phase 3 |
| Impact Analysis | Pending | Phase 3 |

### Output Files (After Generation)

Once artifact generation is complete, each upload will have:

```
artifacts/<fileId>/
├── metadata.json        <- Source data
├── schema.dbml          <- Logical model
├── postgres.sql         <- PostgreSQL DDL
├── snowflake.sql        <- Snowflake DDL
├── erd.mmd              <- Mermaid diagram
├── erd.png              <- ERD image
└── erd.svg              <- ERD vector
```

## Troubleshooting

### Ollama Connection Issues

**Error:** "LLM service unavailable"

**Solution:**
```bash
# Check if Ollama is running
ollama list

# Start Ollama service (if not running)
ollama serve

# Verify model is downloaded
ollama pull deepseek-r1:7b
```

### Port Already in Use

**Error:** "Port 3000 already in use"

**Solution:**
Change port in `.env` file:
```env
PORT=3001
```

### API Key Rejected

**Error:** "Invalid or missing API key"

**Solution:**
- Check `.env` file has `API_KEY` set
- Use same key in request header: `x-api-key`
- Default dev key: `dev-api-key-change-in-production`

### File Upload Fails

**Possible Issues:**
- File too large (max 10 MB)
- Wrong format (only .xlsx, .csv)
- Missing API key in header

## Testing

Test with provided sample file:

```bash
curl -X POST http://localhost:3000/api/generate ^
  -H "x-api-key: dev-api-key-change-in-production" ^
  -F "file=@test-files/Test-1-EY.xlsx"
```

Expected: 711 rows parsed into 31 tables

## Roadmap

### Phase 1: Data Ingestion & Parsing (Current)
- [x] Express server with health checks
- [x] File upload with Multer
- [x] Excel/CSV parsing
- [x] Data type detection
- [x] PK/FK inference (heuristics)
- [x] LLM integration (DeepSeek-R1)
- [x] Storage layer (JSON files)
- [ ] DBML generation (Coming soon)
- [ ] SQL DDL generation (Coming soon)
- [ ] ERD diagram generation (Coming soon)

### Phase 2: Artifact Generation (Next)
- [ ] DBML logical model output
- [ ] PostgreSQL DDL
- [ ] Snowflake DDL
- [ ] Mermaid ERD diagrams
- [ ] PNG/SVG/PDF exports

### Phase 3: Advanced Features (Future)
- [ ] Data lineage tracking
- [ ] Impact analysis
- [ ] Graph-based insights
- [ ] Multiple database support
- [ ] Schema versioning

## Notes

- Max file size: **10 MB**
- Supported formats: **Excel (.xlsx), CSV (.csv)**
- All generated artifacts saved in `artifacts/<fileId>/`
- Logs formatted with pino-pretty in development
- Metadata persists across server restarts

---


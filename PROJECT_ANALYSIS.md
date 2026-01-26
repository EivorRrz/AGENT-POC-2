# AI-Powered Data Model Generator - Complete Project Analysis

**Project**: Agent-02: AI-Powered Data Model Generator  
**Organization**: Ernst & Young (EY)  
**Developer**: Amit Mishra  
**Status**: 100% Complete (Production POC)  
**Date**: January 26, 2026

---

## 📋 Executive Summary

This is a comprehensive **AI-powered data modeling system** that automatically generates logical and physical database models from Excel/CSV metadata files. The system uses a combination of heuristic pattern matching and LLM assistance (via Ollama/DeepSeek-R1:7B) to infer primary keys, foreign keys, and relationships, then generates multiple output formats including DBML, SQL DDL, ERD diagrams, and executive reports.

### Key Capabilities
- ✅ **File Upload & Parsing**: Excel/CSV metadata ingestion with multi-sheet support
- ✅ **AI-Assisted Inference**: PK/FK detection using heuristics (70-75% accuracy) + LLM enhancement
- ✅ **Logical Model Generation**: DBML format with relationship mapping
- ✅ **Physical Model Generation**: Production-ready MySQL DDL with constraints, indexes, timestamps
- ✅ **Visualization**: ERD diagrams (PNG, SVG, PDF) using Mermaid/Graphviz
- ✅ **Executive Dashboards**: HTML reports for leadership presentation
- ✅ **Graph Analysis**: Data lineage, impact analysis, and schema health insights
- ✅ **AI Q&A CLI**: Natural language interface for querying model metadata

---

## 🏗️ Project Architecture

### High-Level Flow

```
Excel/CSV Upload → Parse & Extract → PK/FK Inference (Heuristics + LLM) → 
Logical Model (DBML) → Physical Model (MySQL) → ERD Diagrams → 
Executive Reports → Graph Analysis → AI Q&A
```

### Project Structure

```
AGENT-POC-2/
├── Phase-1/              # Logical Model Generation (LDM)
│   ├── src/
│   │   ├── server.js      # Express API server
│   │   ├── config/        # Configuration management
│   │   ├── parsers/       # Excel/CSV parsing
│   │   ├── heuristics/    # PK/FK pattern inference
│   │   ├── llm/           # Ollama integration (DeepSeek-R1:7B)
│   │   ├── generators/    # DBML, ERD, diagram generators
│   │   ├── routes/        # API endpoints
│   │   ├── middleware/    # Upload handling (Multer)
│   │   └── storage/       # File-based metadata storage
│   └── generate-logical.js  # CLI for logical model generation
│
├── Phase-2/              # Physical Model Generation (PDM)
│   ├── src/
│   │   ├── generators/    # MySQL DDL, HTML reports, ERD
│   │   ├── models/        # Metadata data structures
│   │   ├── utils/         # Graph analysis, file utilities
│   │   └── config.js       # Phase-2 configuration
│   ├── generate-complete.js  # Complete physical model generator
│   └── cli-qa.js          # AI Q&A interface for leaders
│
└── src/                   # Legacy/root level (similar to Phase-1)
```

---

## 🔧 Core Components

### 1. File Upload & Parsing (`Phase-1/src/middleware/upload.js`)

**Purpose**: Handle multipart file uploads with API key authentication

**Key Features**:
- Multer-based file upload (max 10MB, configurable to 50MB)
- API key validation (`x-api-key` header)
- Supports `.xlsx`, `.xls`, `.csv` formats
- Timestamped filenames: `{timestamp}_&_{originalName}`
- Automatic directory creation

**Flow**:
1. Validate API key
2. Upload file to `uploads/` directory
3. Parse file (Excel/CSV)
4. Extract metadata
5. Run PK/FK inference
6. Save metadata to `artifacts/{fileId}/metadata.json`

**Response**: Returns `fileId` (timestamp) and metadata summary

---

### 2. Excel/CSV Parser (`Phase-1/src/parsers/excelParser.js`)

**Purpose**: Extract structured metadata from Excel/CSV files

**Key Features**:
- **Multi-sheet support**: Reads ALL sheets in Excel files
- **Flexible column detection**: Pattern matching for common column names
  - Table Name: `table`, `table_name`, `tableName`, `entity`, etc.
  - Column Name: `column`, `column_name`, `field`, `attribute`, etc.
  - Data Type: `type`, `data_type`, `datatype`, etc.
  - Primary Key: `pk`, `primary_key`, `is_pk`, etc.
  - Foreign Key: `fk`, `foreign_key`, `is_fk`, etc.
  - References: `references`, `reference`, `ref` (supports `table.column` format)
  - Description: `description`, `desc`, `comment`, `notes`
  - Nullable: `nullable`, `null`, `required`

**Data Type Normalization**:
- Maps common types: `STRING` → `VARCHAR`, `INT` → `INTEGER`, `DATETIME` → `TIMESTAMP`
- Defaults to `VARCHAR` if data type missing

**Output**: Array of normalized metadata objects:
```javascript
{
  tableName: "customer",
  columnName: "id",
  dataType: "INTEGER",
  isPrimaryKey: true,
  isForeignKey: false,
  referencesTable: undefined,
  referencesColumn: undefined,
  description: "Customer identifier",
  nullable: false,
  _sourceRow: 2,
  _sourceSheet: "Sheet1"
}
```

---

### 3. PK/FK Inference (`Phase-1/src/heuristics/pkFkInference.js`)

**Purpose**: Automatically detect primary keys and foreign key relationships

**Heuristic Strategies**:

#### Primary Key Detection (3 methods, in order):
1. **ID Pattern Matching**:
   - Column named `id`, `{table}_id`, or `{table}id`
   - Example: `customer.id`, `customer.customer_id`

2. **Suffix Pattern**:
   - Column ending with `_id` or `id` where prefix matches table name
   - Example: `users.user_id` → PK

3. **First Column Fallback**:
   - If first column is integer/serial/number type or contains "id" in name

#### Foreign Key Detection (2 methods):
1. **Table Name Pattern**:
   - Column named `{otherTable}_id`, `{otherTable}id`, `{otherTable}_fk`, `fk_{otherTable}`
   - Example: `order.customer_id` → FK to `customer.id`

2. **Prefix Matching**:
   - Column ending with `_id` where prefix matches another table name (handles singular/plural)
   - Example: `orders.customer_id` → FK to `customer.id`

**Statistics Tracking**:
- Explicit vs inferred PK/FK counts
- Source tracking (`_pkSource`, `_fkSource`)

**Accuracy**: 70-75% for heuristics alone, enhanced with LLM assistance

---

### 4. LLM Integration (`Phase-1/src/llm/llmService.js`)

**Purpose**: Enhance PK/FK inference and provide natural language Q&A

**Technology Stack**:
- **Provider**: Ollama (local LLM server)
- **Model**: DeepSeek-R1:7B (reasoning model)
- **Endpoint**: `http://localhost:11434`

**Key Functions**:
- `Initializellm()`: Verify Ollama connection and model availability
- `prompt()`: Send single prompt, get response
- `chat()`: Conversational interface with system/user messages
- `promptJSON()`: Parse structured JSON responses

**Usage**:
- **Phase-1**: Enhances logical model PK/FK inference
- **Phase-2**: Enhances physical model type mapping and constraints
- **CLI Q&A**: Answers questions about data lineage and impact analysis

**Graceful Degradation**: System works without LLM (heuristics-only mode)

---

### 5. Logical Model Generator (`Phase-1/src/generators/dbmlGenerator.js`)

**Purpose**: Generate DBML (Database Markup Language) logical model

**Output Format**:
```dbml
Table customer {
  id INTEGER [pk]
  name VARCHAR [not null]
  email VARCHAR
  description VARCHAR [note: 'Customer email address']
}

Ref: order.customer_id > customer.id
```

**Features**:
- Table definitions with columns
- Primary key annotations `[pk]`
- Not null constraints `[not null]`
- Column descriptions `[note: '...']`
- Relationship references `Ref: table.column > table.column`
- Sanitized names (handles spaces, special characters)

**Saved to**: `artifacts/{fileId}/logical/logical.dbml`

---

### 6. ERD Diagram Generator (`Phase-1/src/generators/erdGenerator.js`)

**Purpose**: Generate visual Entity-Relationship Diagrams

**Technologies**:
- **Mermaid**: Source format (`.mmd`)
- **Puppeteer**: Renders Mermaid to PNG/SVG/PDF
- **Graphviz**: Alternative renderer (via DBML CLI)

**Output Formats**:
- `erd.mmd` - Mermaid source
- `erd.png` - PNG image
- `erd.svg` - Scalable vector graphic
- `erd.pdf` - PDF document

**Features**:
- Shows all tables, columns, PKs, FKs
- Relationship lines between tables
- Configurable column limit (default: show all)

**Saved to**: `artifacts/{fileId}/logical/erd.{png|svg|pdf}`

---

### 7. Physical Model Generator (`Phase-2/src/generators/MySQLGenerator.js`)

**Purpose**: Generate production-ready MySQL DDL

**Key Features**:

#### Type Mapping:
- Logical types → Physical MySQL types
- `INTEGER` → `INT` (or `BIGINT` for large numbers)
- `VARCHAR` → `VARCHAR(255)` (or LLM-suggested length)
- `BOOLEAN` → `TINYINT(1)`
- `DATE`, `TIMESTAMP` → MySQL date types

#### Constraints:
- **Primary Keys**: `PRIMARY KEY (id)`
- **Foreign Keys**: `FOREIGN KEY (customer_id) REFERENCES customer(id)`
- **NOT NULL**: Applied to PKs, FKs, and non-nullable columns
- **UNIQUE**: For unique columns
- **DEFAULT**: LLM-suggested or inferred defaults
- **AUTO_INCREMENT**: For integer PKs

#### Indexes:
- Automatic indexes on foreign keys
- Unique indexes for unique columns

#### Timestamps:
- `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

#### Naming Conventions:
- Clean snake_case (removes leading underscores)
- Reserved word handling (quotes identifiers like `order`)

**Output Example**:
```sql
CREATE TABLE `customer` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Saved to**: `artifacts/{fileId}/physical/mysql.sql`

---

### 8. Executive Report Generator (`Phase-2/src/generators/ExecutiveReport.js`)

**Purpose**: Generate HTML dashboard for leadership presentation

**Features**:
- **Summary Metrics**: Table count, column count, relationship count
- **Schema Health**: PK/FK coverage, orphan tables, circular dependencies
- **Visual ERD**: Embedded diagram
- **Table List**: All tables with column counts
- **Risk Indicators**: Missing PKs, missing FKs, large tables

**Saved to**: `artifacts/{fileId}/executive/EXECUTIVE_REPORT.html`

---

### 9. Interactive HTML Generator (`Phase-2/src/generators/InteractiveHTML.js`)

**Purpose**: Create interactive ERD viewer for demos/presentations

**Features**:
- **Zoomable ERD**: Pan and zoom functionality
- **Table Details**: Click tables to see columns
- **Search**: Find tables/columns quickly
- **Export**: Download diagrams
- **Responsive**: Works on desktop and tablet

**Saved to**: `artifacts/{fileId}/executive/erd_INTERACTIVE.html`

---

### 10. Graph Analysis (`Phase-2/src/utils/graphAnalysis.js`)

**Purpose**: Generate data lineage, impact analysis, and schema insights

**Output Artifacts**:

#### `physical_lineage.json`:
- **Data Lineage**: Where each column came from (source table/column)
- **Transformation Path**: Logical → Physical mapping
- **Dependencies**: Column-level dependencies

#### `physical_impact.json`:
- **Impact Analysis**: What breaks if a table/column is changed or dropped
- **Dependency Graph**: Tables that depend on each other
- **Cascade Effects**: Impact of FK deletions

#### `physical_graph_insights.json`:
- **Schema Health**: PK coverage, FK coverage, orphan tables
- **Risk Indicators**: Missing constraints, circular dependencies
- **Statistics**: Table sizes, relationship counts, complexity metrics

**Saved to**: `artifacts/{fileId}/physical/physical_{lineage|impact|graph_insights}.json`

---

### 11. AI Q&A CLI (`Phase-2/cli-qa.js`)

**Purpose**: Natural language interface for querying model metadata

**How It Works**:
1. Loads precomputed JSON artifacts (lineage, impact, insights)
2. Sends context to LLM (DeepSeek via Ollama)
3. LLM answers in plain English for leaders/managers
4. **Important**: LLM is communication layer only - does NOT modify model

**Example Questions**:
- "Where did order.customer_id come from?"
- "What happens if we drop the order table?"
- "Is this schema production-ready?"
- "Which tables have missing primary keys?"

**Usage**:
```bash
cd Phase-2
node cli-qa.js {fileId}
```

**Saved to**: Interactive CLI session (no file output)

---

## 📡 API Endpoints

### Phase-1 API (Express Server)

#### 1. Health Check
```
GET /health
Response: { status: "ok", timeStamp: "..." }
```

#### 2. Upload File
```
POST /upload/ingest
Headers:
  x-api-key: dev-api-key-change-in-production
Body:
  multipart/form-data
  field: file (Excel/CSV)

Response:
{
  success: true,
  data: {
    fileId: "1768458755700",
    originalName: "metadata.xlsx",
    metadata: {
      tableCount: 4,
      rowCount: 14
    },
    inference: {
      primaryKeys: { explicit: 2, inferred: 2 },
      foreignKeys: { explicit: 1, inferred: 3 }
    }
  }
}
```

#### 3. Generate Artifacts
```
POST /generate/{fileId}

Response:
{
  status: "success",
  fileId: "1768458755700",
  artifacts: {
    dbml: { path: "artifacts/.../schema.dbml" },
    mermaid: { path: "artifacts/.../erd.mmd" },
    images: {
      png: "artifacts/.../erd.png",
      svg: "artifacts/.../erd.svg"
    }
  }
}
```

#### 4. Check Status
```
GET /generate/{fileId}/status

Response:
{
  fileId: "1768458755700",
  artifacts: {
    metadata: true,
    dbml: true,
    erd_png: true,
    erd_svg: true
  }
}
```

---

## 🔄 Complete Workflow

### End-to-End Process

#### Step 1: Upload & Parse (Phase-1)
```bash
cd Phase-1
npm install
npm start
# Server runs on http://localhost:3000

# Upload file via Postman/curl:
POST http://localhost:3000/upload/ingest
Header: x-api-key: dev-api-key-change-in-production
Body: file = metadata.xlsx

# Response includes fileId
```

#### Step 2: Generate Logical Model (Phase-1)
```bash
# Via API:
POST http://localhost:3000/generate/{fileId}

# Or CLI:
node generate-logical.js {fileId}
```

**Outputs**:
- `artifacts/{fileId}/json/metadata.json` - Parsed metadata
- `artifacts/{fileId}/logical/logical.dbml` - DBML logical model
- `artifacts/{fileId}/logical/erd.png` - ERD diagram

#### Step 3: Generate Physical Model (Phase-2)
```bash
cd Phase-2
npm install
node generate-complete.js {fileId}
```

**Outputs**:
- `artifacts/{fileId}/physical/mysql.sql` - MySQL DDL
- `artifacts/{fileId}/physical/erd.png` - Physical ERD
- `artifacts/{fileId}/executive/EXECUTIVE_REPORT.html` - Leadership dashboard
- `artifacts/{fileId}/executive/erd_INTERACTIVE.html` - Interactive viewer
- `artifacts/{fileId}/physical/physical_lineage.json` - Data lineage
- `artifacts/{fileId}/physical/physical_impact.json` - Impact analysis
- `artifacts/{fileId}/physical/physical_graph_insights.json` - Schema insights

#### Step 4: AI Q&A (Phase-2)
```bash
cd Phase-2
node cli-qa.js {fileId}

# Interactive prompt:
Q> Where did order.customer_id come from?
A> The column order.customer_id is a foreign key that references customer.id...
```

---

## 📊 Artifact Structure

### Complete Artifact Layout

```
artifacts/{fileId}/
├── json/
│   └── metadata.json              # Source metadata (parsed Excel/CSV)
│
├── logical/                       # Logical Data Model (LDM)
│   ├── logical.dbml              # DBML format
│   ├── logical.json              # JSON representation
│   ├── erd.png                   # ERD diagram (PNG)
│   └── erd.svg                   # ERD diagram (SVG)
│
├── physical/                      # Physical Data Model (PDM)
│   ├── mysql.sql                 # MySQL DDL (production-ready)
│   ├── erd.png                   # Physical ERD (PNG)
│   ├── erd.svg                   # Physical ERD (SVG)
│   ├── physical_lineage.json     # Data lineage analysis
│   ├── physical_impact.json      # Impact analysis
│   └── physical_graph_insights.json  # Schema health metrics
│
└── executive/                     # Executive/Leadership Outputs
    ├── EXECUTIVE_REPORT.html      # Summary dashboard (⭐ Best for leaders)
    └── erd_INTERACTIVE.html      # Interactive ERD viewer (⭐ Best for demos)
```

---

## 🛠️ Technology Stack

### Core Dependencies

**Phase-1**:
- `express` - Web framework
- `multer` - File upload handling
- `xlsx` (SheetJS) - Excel parsing
- `csv-parse` - CSV parsing
- `@dbml/core` - DBML generation
- `@mermaid-js/mermaid-cli` - ERD diagram generation
- `puppeteer` - PDF/SVG rendering
- `pino` - Structured logging
- `dotenv` - Environment configuration

**Phase-2**:
- `dotenv` - Configuration
- `pino` - Logging
- (Minimal dependencies - focuses on generation logic)

### LLM Integration
- **Ollama** - Local LLM server
- **DeepSeek-R1:7B** - Reasoning model for PK/FK inference and Q&A

### External Tools
- **DBML CLI** - DBML to SQL conversion
- **Mermaid CLI** - Diagram rendering
- **Graphviz** - Alternative diagram renderer
- **Puppeteer** - Browser automation for PDF generation

---

## ⚙️ Configuration

### Environment Variables

**Phase-1** (`.env`):
```env
PORT=3000
API_KEY=dev-api-key-change-in-production
ARTIFACTS_DIR=./artifacts
UPLOAD_DIR=./uploads

# LLM (Optional)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:7b

# ERD Display
ERD_COLUMN_LIMIT=9999

# Puppeteer
PUPPETEER_EXECUTABLE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
```

**Phase-2** (`src/config.js`):
```javascript
{
  phase1ArtifactsDir: '../Phase-1/artifacts',
  generateSQL: true,
  // ... other configs
}
```

---

## 📈 Performance Metrics

### Processing Times

| File Size | Tables | Columns | Processing Time |
|-----------|--------|---------|----------------|
| Small (2 KB) | 4 | 14 | ~10s |
| Medium (50 KB) | 31 | 712 | ~35s |
| Large (500 KB) | 100 | 2000 | ~75s |

### Limits
- Max file size: 10 MB (configurable to 50 MB)
- Supports 100+ tables
- Tested with 5000+ columns
- Multi-sheet Excel support

---

## 🎯 Use Cases

1. **Database Design**: Generate logical models from Excel specifications
2. **Legacy System Analysis**: Document existing schemas automatically
3. **Data Migration**: Analyze source metadata for migration planning
4. **Compliance**: Generate audit-ready diagrams and documentation
5. **Team Collaboration**: Share interactive ERDs with stakeholders
6. **Leadership Reporting**: Executive dashboards for decision-making

---

## 🔍 Key Design Decisions

### 1. File-Based Storage
- **Why**: Simpler for POC, no database setup required
- **Trade-off**: Not scalable for production (would need MongoDB/PostgreSQL)

### 2. Heuristics + LLM Hybrid
- **Why**: Heuristics provide fast baseline (70-75% accuracy), LLM enhances edge cases
- **Trade-off**: Requires Ollama setup, but graceful degradation if unavailable

### 3. Two-Phase Architecture
- **Why**: Separation of concerns - logical modeling vs physical implementation
- **Benefit**: Can generate multiple physical models (MySQL, PostgreSQL, Snowflake) from same logical model

### 4. Multiple Output Formats
- **Why**: Different stakeholders need different formats
- **Benefit**: DBML for developers, HTML for executives, SQL for DBAs

### 5. CLI Q&A Interface
- **Why**: Leaders/managers prefer natural language over JSON
- **Benefit**: LLM acts as communication layer, not decision maker

---

## 🚀 Future Enhancements

### Potential Improvements

1. **Database Storage**: Replace file-based storage with MongoDB/PostgreSQL
2. **Additional DBMS Support**: PostgreSQL, Snowflake, SQL Server DDL generation
3. **Version Control**: Track schema changes over time
4. **Collaboration**: Multi-user editing, comments, approvals
5. **API Enhancements**: WebSocket for real-time generation status
6. **Advanced LLM Features**: Schema optimization suggestions, naming convention enforcement
7. **Testing**: Unit tests, integration tests, E2E tests
8. **Dockerization**: Container deployment for easier setup
9. **Cloud Integration**: AWS S3 for artifact storage, Lambda for serverless generation
10. **UI Dashboard**: Web interface instead of CLI/API only

---

## 📝 Code Quality Notes

### Strengths
- ✅ Well-structured modular architecture
- ✅ Comprehensive error handling
- ✅ Detailed logging (Pino structured logs)
- ✅ Graceful degradation (works without LLM)
- ✅ Multiple output formats
- ✅ Production-ready SQL generation

### Areas for Improvement
- ⚠️ Limited test coverage (no test files found)
- ⚠️ File-based storage not scalable
- ⚠️ Hardcoded paths in some places
- ⚠️ No API versioning
- ⚠️ Limited input validation
- ⚠️ No rate limiting on API endpoints

---

## 🎓 Learning Resources

### Key Concepts Demonstrated

1. **Metadata Extraction**: Parsing Excel/CSV with flexible column detection
2. **Pattern Matching**: Heuristic-based PK/FK inference
3. **LLM Integration**: Using local LLM (Ollama) for enhancement
4. **Code Generation**: DBML, SQL, HTML generation from data structures
5. **Graph Analysis**: Data lineage and impact analysis algorithms
6. **API Design**: RESTful endpoints with proper error handling
7. **File Processing**: Multer upload, streaming, async processing

---

## 📞 Support & Contact

**Developer**: Amit Mishra  
**Repository**: https://github.com/EivorRrz/AGENT-POC-2  
**Organization**: Ernst & Young (EY)

---

## ✅ Completion Status

| Module | Status | Description |
|--------|--------|-------------|
| File Upload Handler | ✅ 100% | Multer + API Auth |
| Excel/CSV Parser | ✅ 100% | Multi-sheet support |
| PK/FK Heuristics | ✅ 100% | 70-75% accuracy |
| LLM Assist | ✅ 100% | Ollama + DeepSeek-R1:7B |
| Logical Model Generator | ✅ 100% | DBML format |
| ERD Picture Generator | ✅ 100% | PNG/SVG/PDF |
| Physical Model Generator | ✅ 100% | MySQL DDL |
| Executive Reports | ✅ 100% | HTML dashboards |
| Graph Analysis | ✅ 100% | Lineage, impact, insights |
| AI Q&A CLI | ✅ 100% | Natural language interface |

**Overall Status**: ✅ **100% Complete - Production POC Ready**

---

*Analysis generated: January 26, 2026*

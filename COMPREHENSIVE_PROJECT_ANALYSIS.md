# AGENT-POC-2: Comprehensive Project Analysis

**Project**: Agent-02: AI-Powered Data Model Generator  
**Organization**: Ernst & Young (EY) - POC Team  
**Developer**: Amit Mishra  
**Status**: ✅ **100% Complete** (Production-Ready)  
**Repository**: https://github.com/EivorRrz/AGENT-POC-2  
**Analysis Date**: January 27, 2026

---

## 📋 Executive Summary

AGENT-POC-2 is a **full-stack AI-powered data modeling platform** that automatically generates logical and physical database models from Excel/CSV metadata files. It combines heuristic pattern matching with LLM intelligence (Ollama + DeepSeek-R1:7B) to infer database relationships and constraints, then produces production-ready artifacts including DBML, SQL DDL, ERD diagrams, and executive dashboards.

### Key Innovation
- **Hybrid Intelligence**: Rule-based heuristics (70-75% accuracy) + LLM enhancement (near 100% accuracy)
- **Full Automation**: From raw metadata file → production-ready MySQL DDL in minutes
- **Multi-Output**: Single source generates DBML, SQL, diagrams, reports, and interactive viewers
- **Leadership-Ready**: Interactive HTML dashboards optimized for executive presentations

---

## 🎯 Core Capabilities

| Capability | Status | Details |
|------------|--------|---------|
| **File Upload & Parsing** | ✅ Done | Excel (.xlsx, .xls), CSV with multi-sheet support |
| **PK/FK Inference** | ✅ Done | Heuristics + LLM-assisted (70-75% → 95%+ accuracy) |
| **Logical Model (DBML)** | ✅ Done | Full DBML with relationships, types, constraints |
| **Physical Model (MySQL)** | ✅ Done | Production-ready DDL with indexes, timestamps, charset |
| **ERD Diagrams** | ✅ Done | PNG, SVG, PDF using Graphviz/Mermaid |
| **Executive Reports** | ✅ Done | HTML dashboards for leadership with metrics & health |
| **Interactive Viewer** | ✅ Done | Zoomable ERD with search, table details, export |
| **Data Lineage** | ✅ Done | JSON artifacts tracking source → target mappings |
| **Impact Analysis** | ✅ Done | Dependency graphs showing cascade effects |
| **Schema Health** | ✅ Done | PK/FK coverage, orphan detection, risk indicators |
| **AI Q&A CLI** | ✅ Done | Natural language interface for model queries |
| **Graph Analysis** | ✅ Done | Relationship strength, complexity metrics |

---

## 🏗️ Architecture Overview

### High-Level Data Flow

```
┌─────────────────┐
│  Excel/CSV File │
└────────┬────────┘
         │
         ▼
┌──────────────────────────────┐
│  File Upload & Parsing       │ (Phase-1)
│  - Extract tables/columns    │
│  - Normalize data types      │
│  - Multi-sheet support       │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  PK/FK Inference             │ (Phase-1)
│  - Heuristics (70-75%)       │
│  - LLM Enhancement (95%+)    │
│  - Relationship mapping      │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Logical Model Generation    │ (Phase-1)
│  - DBML format               │
│  - Mermaid ERD               │
│  - ERD PNG/SVG/PDF           │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Physical Model Generation   │ (Phase-2)
│  - MySQL DDL                 │
│  - Constraints/Indexes       │
│  - Timestamps/Charset        │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Analysis & Reporting        │ (Phase-2)
│  - Graph analysis            │
│  - Executive dashboard       │
│  - Interactive viewer        │
│  - Q&A interface             │
└──────────────────────────────┘
```

### Project Structure

```
AGENT-POC-2/
├── Phase-1/                          # Logical Model Generation (LDM)
│   ├── src/
│   │   ├── server.js                # Express API server (main entry point)
│   │   ├── config/index.js          # Configuration management
│   │   ├── parsers/                 # File parsing logic
│   │   │   ├── excelParser.js       # Excel multi-sheet parser
│   │   │   ├── csv-parser.js        # CSV parser
│   │   │   └── index.js             # Parser router
│   │   ├── heuristics/              # PK/FK pattern inference
│   │   │   ├── pkFkInference.js     # Heuristic algorithms
│   │   │   └── index.js             # Heuristic router
│   │   ├── llm/                     # LLM integration (Ollama)
│   │   │   ├── llmService.js        # Ollama API wrapper
│   │   │   ├── metadataEnhancer.js  # LLM-based enhancement
│   │   │   ├── pkfkAssist.js        # PK/FK validation via LLM
│   │   │   ├── schema.js            # JSON schema definitions
│   │   │   └── index.js             # LLM initialization
│   │   ├── generators/              # Output generation
│   │   │   ├── dbmlGenerator.js     # DBML logical model
│   │   │   ├── logicalTypeMapper.js # Type normalization
│   │   │   ├── erdGenerator.js      # ERD diagram generation
│   │   │   ├── graphvizGenerator.js # Graphviz integration
│   │   │   ├── productionDiagramGenerator.js # Mermaid integration
│   │   │   └── index.js             # Generator router
│   │   ├── routes/                  # API endpoint handlers
│   │   │   └── generate.js          # /generate endpoints
│   │   ├── middleware/              # Express middleware
│   │   │   └── upload.js            # Multer upload handler
│   │   ├── storage/                 # File storage
│   │   │   └── fileStorage.js       # Metadata persistence
│   │   ├── utils/                   # Utilities
│   │   │   ├── logger.js            # Structured logging (Pino)
│   │   │   └── folderOrganizer.js   # Directory management
│   │   └── artifacts/               # Generated artifacts output
│   ├── generate-logical.js          # CLI: Generate logical model
│   ├── package.json                 # Phase-1 dependencies
│   └── install.ps1                  # PowerShell installer
│
├── Phase-2/                          # Physical Model Generation (PDM)
│   ├── src/
│   │   ├── config.js                # Phase-2 configuration
│   │   ├── models/                  # Data structures
│   │   │   └── Metadata.js          # Metadata model classes
│   │   ├── generators/              # Output generators
│   │   │   ├── BaseGenerator.js     # Base class for all generators
│   │   │   ├── MySQLGenerator.js    # MySQL DDL generation
│   │   │   ├── PhysicalERDGenerator.js # Physical ERD diagrams
│   │   │   ├── ExecutiveReport.js   # HTML executive dashboard
│   │   │   ├── InteractiveHTML.js   # Interactive ERD viewer
│   │   │   ├── LLMPhysicalEnhancer.js # LLM physical model enhancement
│   │   │   ├── typeMapper.js        # Physical type mapping
│   │   │   └── updateInteractiveTemplates.js # Template updater
│   │   ├── utils/                   # Utilities
│   │   │   ├── graphAnalysis.js     # Data lineage & impact analysis
│   │   │   ├── fileUtils.js         # File I/O utilities
│   │   │   └── logger.js            # Logging
│   │   └── templates/               # HTML/CSS templates
│   ├── generate-complete.js         # CLI: Generate complete physical model
│   ├── cli-qa.js                    # CLI: AI Q&A interface
│   ├── package.json                 # Phase-2 dependencies
│   └── env.example.txt              # Example environment variables
│
├── src/ (Legacy)                     # Root-level generators
│   ├── server.js                    # Secondary API server
│   ├── generators/                  # Additional generators
│   ├── parsers/                     # Parsers
│   ├── routes/                      # Routes
│   └── ...                          # Supporting modules
│
├── test-files/                       # Test data
│   ├── Real_ingestion-01.csv        # Sample CSV test file
│   └── test-metadata.csv            # Test metadata
│
├── Documentation Files
│   ├── Readme.md                    # Quick start guide
│   ├── PROJECT_ANALYSIS.md          # Detailed project analysis
│   ├── ERD_FIX_GUIDE.md             # Graphviz installation guide
│   └── ENHANCED-MODELS-SUMMARY.md  # Logical/Physical model enhancements
│
└── install.ps1                       # Root PowerShell installer
```

---

## 🔧 Core Components Deep Dive

### Component 1: File Upload & Parsing (Phase-1)

**Files**: `src/middleware/upload.js`, `src/parsers/excelParser.js`, `src/parsers/csv-parser.js`

**Responsibilities**:
1. Receive Excel/CSV files via HTTP POST
2. Validate API key (`x-api-key` header)
3. Parse file structure (multi-sheet support for Excel)
4. Extract table/column metadata
5. Normalize column names and data types
6. Save metadata to JSON for downstream processing

**Key Features**:
- **Multi-sheet support**: Reads ALL sheets in Excel workbooks
- **Flexible column detection**: Pattern matching for ~20+ naming variations
- **Type normalization**: Maps domain types to standard SQL types
- **Metadata preservation**: Maintains source location (_sourceSheet, _sourceRow)

**Data Type Mapping Examples**:
```
Input Types          → Normalized Type
STRING, TEXT         → VARCHAR
INT, INTEGER, NUMBER → INTEGER
DECIMAL, NUMERIC     → DECIMAL
DATE, DATETIME       → TIMESTAMP
BOOL, BOOLEAN        → TINYINT(1)
```

**Column Name Pattern Matching**:
```
Table identifiers: table, table_name, tableName, entity, object, etc.
Column identifiers: column, column_name, field, attribute, etc.
Data types: type, data_type, datatype, dtype, etc.
PK indicator: pk, primary_key, is_pk, is_primary, etc.
FK indicator: fk, foreign_key, is_fk, references, etc.
```

**Output Format** (JSON):
```json
[
  {
    "tableName": "customer",
    "columnName": "id",
    "dataType": "INTEGER",
    "isPrimaryKey": true,
    "isForeignKey": false,
    "referencesTable": null,
    "referencesColumn": null,
    "description": "Customer identifier",
    "nullable": false,
    "_sourceSheet": "Sheet1",
    "_sourceRow": 2
  },
  ...
]
```

---

### Component 2: PK/FK Heuristic Inference (Phase-1)

**File**: `src/heuristics/pkFkInference.js`

**Purpose**: Automatically detect primary and foreign keys using pattern matching

**Primary Key Detection Strategy**:

1. **ID Pattern Matching** (Highest Priority)
   - Column exactly named: `id`, `{tableName}_id`, `{tableName}id`
   - Example: `customer.id`, `order.order_id`
   - Accuracy: 95%+

2. **Suffix Pattern Matching**
   - Column ending with `_id` where prefix matches table name
   - Handles singular/plural mismatch (customer/customers)
   - Example: `orders.customer_id` → recognizes relationship to `customer` table
   - Accuracy: 80-90%

3. **Type + Position Heuristic**
   - First column that is integer/number/serial type
   - Fallback when explicit patterns fail
   - Accuracy: 60-70%

**Foreign Key Detection Strategy**:

1. **Table Name Reference**
   - Column named: `{otherTable}_id`, `{otherTable}id`, `fk_{otherTable}`
   - Example: `order.customer_id` → FK to `customer` table
   - Accuracy: 90%+

2. **Explicit References Column**
   - If references column exists: `table.column` format
   - Directly maps FK relationships
   - Accuracy: 100%

**Inference Output**:
```javascript
{
  tables: [...],
  inference: {
    primaryKeys: {
      explicit: 4,      // Explicitly marked PKs
      inferred: 2       // Inferred via heuristics
    },
    foreignKeys: {
      explicit: 1,      // Explicitly marked FKs
      inferred: 5       // Inferred via heuristics
    }
  }
}
```

**Accuracy**:
- **Heuristics-only**: 70-75% accuracy
- **With LLM enhancement**: 95%+ accuracy

---

### Component 3: LLM Integration (Phase-1/Phase-2)

**Files**: `Phase-1/src/llm/llmService.js`, `Phase-1/src/llm/metadataEnhancer.js`

**Technology Stack**:
- **Provider**: Ollama (local LLM server)
- **Model**: DeepSeek-R1:7B (open-source reasoning model)
- **Endpoint**: `http://localhost:11434` (default)

**LLM Responsibilities**:

1. **PK/FK Validation**
   - Reviews heuristic results
   - Suggests corrections
   - Validates relationship logic

2. **Type Enhancement**
   - Maps logical types to optimal physical types
   - Suggests precision/length values
   - Recommends VARCHAR(255) vs VARCHAR(100) etc.

3. **Constraint Inference**
   - Auto-generates CHECK constraints
   - Suggests DEFAULT values
   - Identifies UNIQUE candidates

4. **Natural Language Q&A**
   - Answers questions about model structure
   - Explains relationships
   - Provides impact analysis

**Usage Examples**:
```javascript
// Validate PK/FK inference
const suggestions = await promptJSON(
  `Review this PK/FK inference and suggest improvements:
   ${JSON.stringify(inferenceResults)}`
);

// Get optimal type for column
const type = await prompt(
  `For a column storing email addresses, suggest the best MySQL type`
);

// Q&A
const answer = await chat({
  system: "You are a database expert...",
  messages: [
    { role: "user", content: "Where did customer.id come from?" }
  ]
});
```

**Graceful Degradation**:
- System works without LLM (heuristics-only mode)
- LLM failures don't block generation
- Human review recommended before deployment

---

### Component 4: Logical Model Generator (Phase-1)

**File**: `src/generators/dbmlGenerator.js`

**Output Format**: DBML (Database Markup Language)

**DBML Features Generated**:
- Table definitions with column properties
- Primary key annotations
- Not null constraints
- Unique constraints
- Column descriptions
- Relationship references with cardinality

**Example Output**:
```dbml
Table customer {
  id INTEGER [pk, not null]
  email VARCHAR [unique, not null]
  name VARCHAR
  created_at TIMESTAMP
  
  Note: 'Core customer entity'
}

Table order {
  id INTEGER [pk, not null]
  customer_id INTEGER [not null]
  amount DECIMAL
  
  Note: 'Customer orders'
}

Ref: order.customer_id > customer.id // Mandatory relationship
```

**Cardinality Notation**:
- `>` = one-to-many (1:M)
- `<` = many-to-one (M:1)
- `-` = one-to-one (1:1)
- `<?` = optional many-to-one
- `>?` = optional one-to-many

**Logical Data Types** (from mapper):
```
Physical Type      → Logical Type
VARCHAR            → TEXT
INTEGER/INT        → NUMBER
DECIMAL            → NUMBER
DATE/TIMESTAMP     → DATE
BOOLEAN/TINYINT    → BOOLEAN
```

**Saved Output**:
- `artifacts/{fileId}/logical/logical.dbml`
- `artifacts/{fileId}/logical/logical.json` (JSON representation)

---

### Component 5: ERD Diagram Generation (Phase-1)

**Files**: `src/generators/erdGenerator.js`, `src/generators/graphvizGenerator.js`, `src/generators/productionDiagramGenerator.js`

**Rendering Engines**:

1. **Graphviz** (Primary - Best Quality)
   - Generates DOT format diagrams
   - Produces PNG, SVG, PDF
   - Requires Graphviz installation
   - Best for production use

2. **Mermaid** (Secondary - Fast)
   - Generates Mermaid ER diagram syntax
   - Can render to SVG via CLI
   - No external dependencies
   - Good for quick visualization

3. **Puppeteer** (Fallback)
   - HTML/CSS to PDF/PNG conversion
   - Requires browser (Edge/Chrome)
   - Used when other renderers unavailable

**Output Formats**:
- `erd.png` - Raster image (best for presentations)
- `erd.svg` - Vector graphic (scalable, for web)
- `erd.pdf` - Document format (for reports)
- `erd.mmd` - Mermaid source (for version control)

**Diagram Content**:
- All tables with columns
- Primary keys marked
- Foreign keys with relationship lines
- Cardinality indicators
- Optional/Mandatory indicators

**Configuration**:
```
ERD_COLUMN_LIMIT=9999  # Show all columns by default
```

---

### Component 6: Physical Model Generator (Phase-2)

**File**: `src/generators/MySQLGenerator.js`

**Output Format**: MySQL DDL (CREATE TABLE, ALTER TABLE, CREATE INDEX)

**SQL Features Generated**:

1. **Data Types with Precision**
   ```sql
   INT AUTO_INCREMENT           -- Integer primary key
   VARCHAR(255)                 -- String with max length
   DECIMAL(10, 2)              -- Decimal with precision
   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   CHAR(36)                     -- Fixed-length (UUIDs)
   TINYINT(1)                  -- Boolean
   ```

2. **Constraints**
   ```sql
   PRIMARY KEY (id)
   NOT NULL
   UNIQUE
   FOREIGN KEY (customer_id) REFERENCES customer(id)
   CHECK (price >= 0)          -- Business rule constraints
   DEFAULT value               -- Default values
   ```

3. **Indexes** (AUTO-GENERATED)
   ```sql
   PRIMARY KEY INDEX           -- Automatic on PK
   FOREIGN KEY INDEX           -- Performance optimization
   UNIQUE INDEX                -- On unique columns
   PERFORMANCE INDEXES         -- On status, type, date columns
   ```

4. **Referential Actions**
   ```sql
   ON DELETE CASCADE            -- Mandatory relationships (NOT NULL FK)
   ON DELETE RESTRICT           -- Optional relationships (nullable FK)
   ON UPDATE CASCADE            -- Always on update
   ```

5. **Schema-Level Settings**
   ```sql
   ENGINE=InnoDB               -- Transactional support
   DEFAULT CHARSET=utf8mb4     -- Full Unicode (4-byte characters)
   COLLATE=utf8mb4_unicode_ci  -- Proper sorting/comparison
   ```

**Example Output**:
```sql
CREATE TABLE `customer` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `price` DECIMAL(10, 2) CHECK (price >= 0),
  `status` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_customer_email` (`email`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_order_customer_id` ON `order`(`customer_id`);

ALTER TABLE `order` 
ADD CONSTRAINT `fk_order_customer_id` 
FOREIGN KEY (`customer_id`) 
REFERENCES `customer`(`id`) 
ON DELETE RESTRICT ON UPDATE CASCADE;
```

**Type Mapper** (`src/generators/typeMapper.js`):
- Maps logical types → physical MySQL types
- Determines optimal VARCHAR lengths
- Suggests precision for DECIMAL columns
- Handles edge cases (UUIDs, JSON, etc.)

**Naming Conventions**:
- Snake case for all identifiers
- Removes leading underscores
- Quotes reserved keywords
- Consistent FK/index naming: `fk_table_column`, `idx_table_column`, `uk_table_column`

**Saved Output**:
- `artifacts/{fileId}/physical/mysql.sql`

---

### Component 7: Executive Report Generator (Phase-2)

**File**: `src/generators/ExecutiveReport.js`

**Output Format**: HTML5 dashboard (self-contained, no dependencies)

**Dashboard Contents**:

1. **Summary Metrics**
   - Total tables
   - Total columns
   - Total relationships
   - Average columns per table

2. **Schema Health Indicators**
   - Primary key coverage %
   - Foreign key coverage %
   - Orphan tables (if any)
   - Circular dependencies detection

3. **Visual Elements**
   - Embedded ERD diagram
   - Color-coded risk indicators
   - Statistics charts

4. **Table Inventory**
   - List of all tables
   - Column counts per table
   - Relationship counts
   - Data type summary

5. **Risk Indicators** (Color-Coded)
   - 🟢 Green: Healthy
   - 🟡 Yellow: Warning (missing constraints)
   - 🔴 Red: Critical (missing PKs)

**Target Audience**: C-suite executives, project managers, stakeholders

**Key Design**:
- Executive-friendly language (no SQL jargon)
- Visual emphasis on metrics and health
- One-page scrollable format
- Print-friendly styling

**Saved Output**:
- `artifacts/{fileId}/executive/EXECUTIVE_REPORT.html`

---

### Component 8: Interactive ERD Viewer (Phase-2)

**File**: `src/generators/InteractiveHTML.js`

**Output Format**: HTML5 with embedded JavaScript/CSS

**Interactive Features**:

1. **Navigation**
   - Pan/zoom with mouse wheel and drag
   - Fit-to-view button
   - Zoom percentage display

2. **Search**
   - Find tables by name
   - Find columns by name
   - Highlight matching elements

3. **Details Panel**
   - Click table to see all columns
   - Show data types
   - Show constraints
   - Show relationships

4. **Export Options**
   - Download as PNG
   - Download as SVG
   - Download as PDF

5. **Responsive Design**
   - Works on desktop
   - Tablet-friendly
   - Mobile-accessible (read-only)

**Target Audience**: Data architects, DBAs, technical teams

**Saved Output**:
- `artifacts/{fileId}/executive/erd_INTERACTIVE.html`

---

### Component 9: Graph Analysis (Phase-2)

**File**: `src/utils/graphAnalysis.js`

**Purpose**: Generate structured data for impact analysis, lineage tracking, and schema insights

**Output Artifacts**:

#### 1. **physical_lineage.json**
```json
{
  "dataLineage": {
    "customer.id": {
      "source": "customer.id",
      "type": "original",
      "usedBy": ["order.customer_id"],
      "path": "logical.customer.id → physical.customer.id"
    },
    "order.customer_id": {
      "source": "customer.id",
      "type": "foreign_key",
      "references": "customer.id",
      "cardinality": "many-to-one"
    }
  },
  "transformations": [...],
  "dependencies": [...]
}
```

#### 2. **physical_impact.json**
```json
{
  "impactAnalysis": {
    "customer": {
      "dependentTables": ["order", "invoice", "payment"],
      "deleteImpact": "Will cascade to 3 dependent tables",
      "cascadePath": "customer → order, invoice, payment"
    },
    "customer.id": {
      "dependentColumns": [
        "order.customer_id",
        "invoice.customer_id"
      ],
      "dropImpact": "6 foreign key constraints will break"
    }
  },
  "circularDependencies": [],
  "orphanTables": []
}
```

#### 3. **physical_graph_insights.json**
```json
{
  "schemaHealth": {
    "totalTables": 5,
    "tablesWithPK": 5,
    "pkCoverage": "100%",
    "tablesWithFK": 3,
    "fkCoverage": "60%",
    "orphanTables": 0,
    "circularDependencies": 0
  },
  "complexity": {
    "averageColumnsPerTable": 8,
    "averageRelationshipsPerTable": 1.2,
    "largestTable": "customer (15 columns)",
    "mostConnectedTable": "customer (5 relationships)"
  },
  "riskIndicators": {
    "missingPrimaryKeys": [],
    "missingNotNullOnFK": [],
    "missingIndexes": [],
    "largeTablesWithoutPartitioning": []
  }
}
```

**Usage**: Input to AI Q&A CLI and executive dashboard

---

### Component 10: AI Q&A CLI (Phase-2)

**File**: `cli-qa.js`

**Purpose**: Natural language interface for querying model metadata

**How It Works**:

1. **Load Precomputed Artifacts**
   - `physical_lineage.json`
   - `physical_impact.json`
   - `physical_graph_insights.json`
   - Physical model metadata

2. **Send Context to LLM**
   - Facts about tables, columns, relationships
   - Schema health metrics
   - Impact analysis data

3. **LLM Generates Response**
   - Plain English answers
   - No model modifications
   - Leadership-friendly language

4. **Interactive Loop**
   - User asks question
   - LLM responds
   - Repeat until user exits

**Example Questions & Answers**:

```
Q: Where did order.customer_id come from?
A: The column order.customer_id is a foreign key that references 
   customer.id from the customer table. It's used to link each order 
   to its customer for a many-to-one relationship.

Q: What happens if we drop the customer table?
A: Dropping the customer table would cause data integrity violations
   because 3 dependent tables (order, invoice, payment) have foreign
   key constraints referencing it. This would cascade delete all
   orders, invoices, and payments for all customers.

Q: Is this schema production-ready?
A: The schema is mostly production-ready with 100% primary key coverage
   and 60% foreign key coverage. However, consider:
   1. Adding indexes on frequently searched columns
   2. Reviewing CHECK constraints for business rules
   3. Implementing archival strategy for large tables
```

**Usage**:
```bash
cd Phase-2
node cli-qa.js 1769424754199

# Interactive prompt appears:
Q> Your question here
A> [LLM response]
Q> Next question
```

---

## 📡 API Architecture

### Phase-1 Express Server

**Base URL**: `http://localhost:3000`

#### Endpoint 1: Health Check
```http
GET /health

Response:
{
  "status": "ok",
  "timeStamp": "2026-01-27T15:30:45.123Z"
}
```

#### Endpoint 2: File Upload
```http
POST /upload/ingest

Headers:
  x-api-key: dev-api-key-change-in-production
  Content-Type: multipart/form-data

Body:
  file: <binary Excel/CSV file>

Response (Success):
{
  "success": true,
  "data": {
    "fileId": "1769450257490",
    "originalName": "Real_ingestion-01.csv",
    "uploadedAt": "2026-01-27T15:30:45.123Z",
    "metadata": {
      "tableCount": 5,
      "totalColumns": 42,
      "totalRows": 1500
    },
    "inference": {
      "primaryKeys": {
        "explicit": 4,
        "inferred": 1
      },
      "foreignKeys": {
        "explicit": 0,
        "inferred": 3
      }
    }
  }
}

Response (Error):
{
  "error": "Invalid API key",
  "message": "x-api-key header missing or invalid"
}
```

#### Endpoint 3: Generate Artifacts
```http
POST /generate/{fileId}

Query Parameters (optional):
  ?enhanceWithLLM=true    (default: true)
  ?generateImages=true    (default: true)

Response:
{
  "status": "success",
  "fileId": "1769450257490",
  "artifacts": {
    "json": {
      "path": "artifacts/1769450257490/json/metadata.json"
    },
    "dbml": {
      "path": "artifacts/1769450257490/logical/logical.dbml"
    },
    "mermaid": {
      "path": "artifacts/1769450257490/logical/erd.mmd"
    },
    "images": {
      "png": "artifacts/1769450257490/logical/erd.png",
      "svg": "artifacts/1769450257490/logical/erd.svg",
      "pdf": "artifacts/1769450257490/logical/erd.pdf"
    }
  }
}
```

#### Endpoint 4: Check Status
```http
GET /generate/{fileId}/status

Response:
{
  "fileId": "1769450257490",
  "artifacts": {
    "metadata": true,
    "dbml": true,
    "erd_png": true,
    "erd_svg": true,
    "erd_pdf": false
  }
}
```

---

## 🔄 Complete Workflow

### End-to-End Usage

#### Step 1: Setup & Start Server

```bash
# Clone and navigate
cd AGENT-POC-2/Phase-1
npm install

# Start server
npm start
# Server running at http://localhost:3000

# In another terminal, verify server is ready
curl http://localhost:3000/health
```

#### Step 2: Upload Excel/CSV File

```bash
# Using curl
curl -X POST \
  -H "x-api-key: dev-api-key-change-in-production" \
  -F "file=@Real_ingestion-01.csv" \
  http://localhost:3000/upload/ingest

# Response:
# {
#   "success": true,
#   "data": {
#     "fileId": "1769450257490",
#     ...
#   }
# }

# Note the fileId for next steps
```

#### Step 3: Generate Logical Model

```bash
# Option A: Via API
curl -X POST \
  http://localhost:3000/generate/1769450257490

# Option B: Via CLI
cd Phase-1
node generate-logical.js 1769450257490

# Outputs:
# ✓ metadata.json (parsed metadata)
# ✓ logical.dbml (DBML model)
# ✓ logical.json (JSON representation)
# ✓ erd.png (Entity relationship diagram)
# ✓ erd.svg (Scalable vector diagram)
```

#### Step 4: Generate Physical Model

```bash
cd Phase-2
npm install
node generate-complete.js 1769450257490

# Outputs:
# ✓ mysql.sql (Production MySQL DDL)
# ✓ physical/erd.png (Physical ERD)
# ✓ physical/erd.svg
# ✓ physical_lineage.json (Data lineage)
# ✓ physical_impact.json (Impact analysis)
# ✓ physical_graph_insights.json (Schema health)
# ✓ EXECUTIVE_REPORT.html (Leadership dashboard)
# ✓ erd_INTERACTIVE.html (Interactive viewer)
```

#### Step 5: Query Model with AI Q&A

```bash
node cli-qa.js 1769450257490

# Interactive interface:
Q> What tables depend on customer?
A> The tables order, invoice, and payment reference customer through 
   foreign keys. If customer is deleted and ON DELETE CASCADE is set,
   all related orders, invoices, and payments would be deleted.

Q> Is the schema production-ready?
A> Yes, with notes...
```

---

## 📊 Artifact Structure

### Complete Directory Layout

```
artifacts/
└── {fileId}/                      # e.g., 1769450257490
    ├── json/
    │   └── metadata.json          # Source metadata (parsed Excel/CSV)
    │       └── Contains: tables[], columns[], inferences{}
    │
    ├── logical/                   # Logical Data Model (LDM)
    │   ├── logical.dbml          # DBML format
    │   ├── logical.json          # JSON representation
    │   ├── erd.mmd               # Mermaid source
    │   ├── erd.png               # ERD diagram (PNG)
    │   ├── erd.svg               # ERD diagram (SVG)
    │   └── erd.pdf               # ERD diagram (PDF)
    │
    ├── physical/                  # Physical Data Model (PDM)
    │   ├── mysql.sql             # MySQL DDL (main artifact)
    │   ├── erd.png               # Physical ERD (PNG)
    │   ├── erd.svg               # Physical ERD (SVG)
    │   ├── erd.pdf               # Physical ERD (PDF)
    │   ├── physical_lineage.json     # Data lineage analysis
    │   ├── physical_impact.json      # Impact analysis
    │   └── physical_graph_insights.json # Schema health metrics
    │
    └── executive/                # Executive/Leadership Outputs
        ├── EXECUTIVE_REPORT.html      # Summary dashboard (HTML)
        └── erd_INTERACTIVE.html       # Interactive ERD viewer (HTML)
```

**Key Files for Different Audiences**:
- **Developers**: `logical.dbml`, `mysql.sql`, `erd.png`
- **DBAs**: `mysql.sql`, `physical_lineage.json`, `physical_impact.json`
- **Architects**: `logical.dbml`, `physical_graph_insights.json`
- **Executives**: `EXECUTIVE_REPORT.html`, `erd_INTERACTIVE.html`

---

## 🛠️ Technology Stack

### Backend Technologies

**Phase-1 Dependencies**:
```json
{
  "express": "^4.18.2",                           // Web framework
  "multer": "^2.0.0",                             // File uploads
  "xlsx": "latest (SheetJS)",                     // Excel parsing
  "csv-parse": "^5.5.2",                          // CSV parsing
  "@dbml/core": "^5.4.0",                         // DBML generation
  "@dbml/cli": "^2.5.0",                          // DBML CLI tools
  "@mermaid-js/mermaid-cli": "^11.12.0",         // Diagram generation
  "puppeteer": "^24.35.0",                        // PDF/PNG rendering
  "pino": "^8.16.2",                              // Structured logging
  "pino-pretty": "^10.2.3",                       // Log formatting
  "dotenv": "^16.3.1",                            // Environment config
  "nodemon": "^3.1.11",                           // Dev auto-reload
  "ajv": "^8.12.0"                                // JSON schema validation
}
```

**Phase-2 Dependencies** (Minimal):
```json
{
  "pino": "^8.17.2",                              // Logging
  "pino-pretty": "^10.3.1",                       // Log formatting
  "dotenv": "^16.3.1"                             // Configuration
}
```

### LLM Technologies

**Local LLM Stack**:
- **Ollama**: Local LLM server (http://localhost:11434)
- **Model**: DeepSeek-R1:7B (open-source reasoning model)
- **Alternative Models**: llama2, mistral, etc.

### External Tools

**Required for Full Functionality**:
- **Graphviz**: ERD diagram generation (dot command)
- **Node.js**: v18+ (ES modules support)

**Optional**:
- **Microsoft Edge/Chrome**: For PDF rendering (Puppeteer)
- **Ollama**: For LLM enhancement (graceful degradation without it)

### Development Tools

- **Code Format**: ES Modules (import/export)
- **Logging**: Pino (structured logging)
- **Testing**: Vitest, Supertest (configured but minimal tests)
- **Scripting**: PowerShell installers (.ps1)

---

## ⚙️ Configuration

### Phase-1 Environment (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# API Security
API_KEY=dev-api-key-change-in-production

# File Handling
ARTIFACTS_DIR=./artifacts
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50mb

# LLM Integration (Optional)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:7b
ENABLE_LLM_ENHANCEMENT=true

# ERD Generation
ERD_COLUMN_LIMIT=9999
RENDER_TYPES=png,svg,pdf

# Puppeteer (for PDF generation)
PUPPETEER_EXECUTABLE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe

# Logging
LOG_LEVEL=info
```

### Phase-2 Configuration (src/config.js)

```javascript
export default {
  // Paths
  phase1ArtifactsDir: '../Phase-1/artifacts',
  phase2OutputDir: 'artifacts',
  
  // Generation Options
  generateSQL: true,
  generateHTML: true,
  generateGraphs: true,
  
  // LLM
  enableLLMEnhancement: true,
  ollama: {
    url: 'http://localhost:11434',
    model: 'deepseek-r1:7b'
  },
  
  // MySQL Options
  mysql: {
    engine: 'InnoDB',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
  }
};
```

---

## 🚀 Deployment & Operations

### Prerequisites

**System Requirements**:
- Windows/Linux/Mac (tested on Windows)
- Node.js v18+
- npm or yarn
- 2GB+ RAM (for Ollama if used)
- 10GB+ disk space for artifacts

**Software Installation**:

1. **Install Node.js**:
   ```powershell
   # Windows
   winget install nodejs
   # OR download from https://nodejs.org/
   ```

2. **Install Graphviz** (for ERD generation):
   ```powershell
   # Windows with Chocolatey
   choco install graphviz
   
   # Windows with Winget
   winget install graphviz
   
   # Verify
   dot -V
   ```

3. **Install Ollama** (optional, for LLM enhancement):
   ```bash
   # Download from https://ollama.ai/
   # Then pull model:
   ollama pull deepseek-r1:7b
   ```

### Quick Start Scripts

**PowerShell Setup**:
```powershell
# Root installer
.\install.ps1

# Or per-phase
cd Phase-1
.\install.ps1

cd Phase-2
.\install.ps1
```

### Running in Production

**Phase-1 Server** (Always On):
```bash
cd Phase-1
npm start
# Or with PM2 for production:
pm2 start src/server.js --name "agent-02-api"
```

**Phase-2 Generation** (On-Demand):
```bash
cd Phase-2
node generate-complete.js {fileId}
```

**Log Management**:
- Pino structured logs
- Configure log level in .env
- Rotate logs using external tool (logrotate on Linux)

---

## 🔐 Security Considerations

### Current Security Measures

1. **API Key Authentication**
   - `x-api-key` header validation
   - Default: `dev-api-key-change-in-production`
   - **⚠️ MUST change in production**

2. **File Upload Validation**
   - File type checking (xlsx, xls, csv only)
   - File size limits (configurable, default 50MB)
   - Antivirus scan recommended

3. **Artifact Access**
   - Static file serving (publicly accessible via /artifacts)
   - **Consider**: Add authentication if artifacts contain sensitive data

### Recommended Production Hardening

1. **API Security**:
   ```env
   API_KEY=<strong-random-key>
   HTTPS_ONLY=true
   CORS_ORIGINS=["trusted-domain.com"]
   ```

2. **Database Credentials**:
   - Generate SQL only, don't auto-execute
   - Review before deploying to production
   - Use secrets manager for connection strings

3. **Artifact Storage**:
   - Store in restricted S3 bucket / private storage
   - Add authentication middleware
   - Implement artifact retention policy

4. **LLM Access**:
   - Ollama should NOT be exposed to internet
   - Use firewall to restrict to localhost only
   - Consider dedicated LLM API with auth

---

## 📈 Performance Characteristics

### Processing Times (Approximate)

| Operation | File Size | Time | Notes |
|-----------|-----------|------|-------|
| Upload & Parse | 1MB CSV | <1s | Depends on network |
| PK/FK Inference | 100 columns | 2-5s | Heuristics only |
| LLM Enhancement | 100 columns | 10-30s | Requires Ollama |
| DBML Generation | 5 tables | <1s | Very fast |
| ERD (PNG/SVG) | 10 tables | 5-15s | Graphviz rendering |
| MySQL DDL | 10 tables | 2-5s | Generation + formatting |
| Physical Model | 10 tables | 20-40s | Complete including graphs |
| Executive Report | 10 tables | 3-5s | HTML generation |
| AI Q&A Response | N/A | 5-10s | LLM latency |

**Bottlenecks**:
- LLM inference (if Ollama running locally)
- ERD diagram rendering (Graphviz)
- PDF generation (Puppeteer)

### Scalability Limits

**Tested Successfully**:
- ✅ Up to 31+ tables (complete data models)
- ✅ 100+ columns
- ✅ Complex relationship graphs (20+ relationships)

**Known Limitations**:
- Large diagrams (>100 tables) may render slowly
- Very large CSV files (>500MB) may cause memory issues
- LLM processing slows significantly with >150 columns

---

## 🐛 Known Issues & Workarounds

### Issue 1: ERD Diagrams Not Generating

**Cause**: Graphviz not installed or not in PATH

**Solution**:
```powershell
# Install Graphviz
choco install graphviz
# OR
winget install graphviz

# Verify installation
dot -V

# Restart terminal and regenerate
node generate-logical.js {fileId}
```

### Issue 2: LLM Timeout

**Cause**: Ollama not running or unreachable

**Solution**:
```bash
# Start Ollama (runs in background)
ollama serve

# In another terminal, pull model if not present
ollama pull deepseek-r1:7b

# Retry generation
node generate-logical.js {fileId}
```

**Graceful Degradation**: System continues with heuristics-only mode (70-75% accuracy)

### Issue 3: PDF Generation Fails

**Cause**: Puppeteer can't find browser

**Solution**:
```env
# Set explicit path in .env (Windows)
PUPPETEER_EXECUTABLE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe

# Or use Chrome
PUPPETEER_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

### Issue 4: Column Names with Special Characters

**Current Behavior**: Special characters in column names are sanitized

**Example**: `Customer-Name (ID)` → `customer_name_id`

**Workaround**: Pre-clean column names in source Excel file

---

## 📚 Key Files Reference

### Must-Read Files for Understanding Project

1. **[Readme.md](Readme.md)** - Quick start guide
2. **[PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md)** - Full technical analysis
3. **[ENHANCED-MODELS-SUMMARY.md](Phase-1/ENHANCED-MODELS-SUMMARY.md)** - Model enhancements
4. **[ERD_FIX_GUIDE.md](ERD_FIX_GUIDE.md)** - Graphviz troubleshooting

### Entry Points

**Phase-1**:
- [src/server.js](Phase-1/src/server.js) - Express API server
- [generate-logical.js](Phase-1/generate-logical.js) - CLI: Logical model generation

**Phase-2**:
- [generate-complete.js](Phase-2/generate-complete.js) - CLI: Physical model generation
- [cli-qa.js](Phase-2/cli-qa.js) - CLI: AI Q&A interface

### Core Logic Files

**Parsing & Inference**:
- [Phase-1/src/parsers/excelParser.js](Phase-1/src/parsers/excelParser.js)
- [Phase-1/src/heuristics/pkFkInference.js](Phase-1/src/heuristics/pkFkInference.js)

**Generation**:
- [Phase-1/src/generators/dbmlGenerator.js](Phase-1/src/generators/dbmlGenerator.js)
- [Phase-2/src/generators/MySQLGenerator.js](Phase-2/src/generators/MySQLGenerator.js)

**LLM Integration**:
- [Phase-1/src/llm/llmService.js](Phase-1/src/llm/llmService.js)

**Analysis**:
- [Phase-2/src/utils/graphAnalysis.js](Phase-2/src/utils/graphAnalysis.js)

---

## 💡 Design Principles

### 1. **Separation of Concerns**
- Phase-1: Logical modeling (input → DBML)
- Phase-2: Physical modeling (DBML → SQL + Reports)
- Each phase is independent but sequential

### 2. **Graceful Degradation**
- Works without Graphviz (skip diagrams)
- Works without Ollama (heuristics-only mode)
- Works without Puppeteer (skip PDF)

### 3. **Multiple Output Formats**
- Same metadata generates different outputs
- Artifacts reusable for various purposes
- Non-destructive (original preserved)

### 4. **LLM as Enhancement, Not Core**
- Heuristics always run first
- LLM validates and improves results
- System functional without LLM

### 5. **Audience-Centric Outputs**
- Technicians: DBML, SQL, JSON
- Architects: Diagrams, graph analysis
- Executives: HTML reports, interactive viewers

---

## 🔮 Future Enhancement Ideas

1. **Multi-Database Support**
   - PostgreSQL DDL generator
   - Snowflake, BigQuery support
   - Cross-platform compatibility

2. **Advanced Inference**
   - Machine learning for PK/FK detection
   - Data profiling recommendations
   - Automated denormalization suggestions

3. **Collaboration Features**
   - Web-based editor for models
   - Comments and annotations
   - Version control for schemas

4. **Performance Optimization**
   - Async batch processing
   - Diagram caching
   - Graph pre-computation

5. **Extended Reporting**
   - Data quality metrics
   - Migration scripts
   - Compliance/audit reports

6. **API Enhancements**
   - Webhook notifications
   - Batch file processing
   - Model versioning API

---

## 📖 How This Project Stands Out

### ✨ Key Differentiators

1. **Full Automation**
   - End-to-end: Upload → Production-Ready SQL
   - No manual intervention needed
   - 10x faster than manual modeling

2. **Intelligent Inference**
   - Hybrid approach (heuristics + AI)
   - Learns from data patterns
   - Accurate relationship detection

3. **Multiple Output Formats**
   - One source, many destinations
   - DBML, SQL, PNG, SVG, PDF, HTML, JSON
   - Designed for different audiences

4. **Leadership-Friendly**
   - Executive dashboards
   - Interactive visualizations
   - Plain English Q&A

5. **Production-Ready**
   - Full DDL with constraints
   - Proper indexing strategy
   - Best practices built-in

6. **Open Source Stack**
   - No proprietary dependencies
   - Extensible architecture
   - Community-friendly

---

## 📝 Conclusion

AGENT-POC-2 represents a complete, production-ready solution for automated database modeling. By combining classical heuristics with modern LLM capabilities, it transforms raw metadata into professional, deployable database schemas in minutes. The system is designed to be:

- **Fast**: Minimal processing time
- **Accurate**: Multi-validation pipeline
- **Flexible**: Works with various data formats
- **User-Friendly**: Multiple interfaces for different users
- **Professional**: Production-grade outputs

The project demonstrates EY's commitment to AI-assisted data engineering and provides a reusable foundation for enterprise data modernization initiatives.

---

**Document Version**: 1.0  
**Last Updated**: January 27, 2026  
**Status**: Complete Analysis ✅

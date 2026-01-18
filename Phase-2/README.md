# Phase-2: MySQL Physical Model Generator

Generate complete MySQL physical models with ERD diagrams for EY POC.

## Quick Start

```bash
# Install dependencies
npm install

# Generate complete model (includes executive outputs)
npm run generate YOUR_FILE_ID

# Generate executive outputs only (for leadership)
npm run executive YOUR_FILE_ID
```

## Output Files

```
artifacts/YOUR_FILE_ID/
├── mysql.sql                 # Production-ready DDL
├── EXECUTIVE_REPORT.html     # Professional dashboard ⭐
├── erd_INTERACTIVE.html      # Interactive viewer
├── erd_SUMMARY.png           # Architecture diagram
├── erd_DETAILED.svg          # Complete ERD (zoom)
└── VERIFICATION_REPORT.txt   # Completeness proof
```

## For EY Leadership

See `EY-LEADERSHIP-GUIDE.md` for presentation instructions.

## Built By

**EY POC Team - Amit Mishra**

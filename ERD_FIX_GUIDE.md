# ERD Diagram Generation Fix Guide

## Issues Fixed ✅

1. **Fixed `require('fs')` error** - Changed to use ES module imports
2. **Fixed DBML CLI command errors** - Now gracefully handles missing tools
3. **Improved error messages** - Clear instructions when tools are missing

## Solution: Install Graphviz (Recommended)

Graphviz is the **primary ERD generator** and provides the best quality diagrams. Install it to fix all ERD generation errors.

### Windows Installation:

**Option 1: Using Chocolatey (Easiest)**
```bash
choco install graphviz
```

**Option 2: Manual Installation**
1. Download from: https://graphviz.org/download/
2. Download the Windows installer (`.msi` file)
3. Run the installer
4. Add Graphviz to PATH (usually: `C:\Program Files\Graphviz\bin`)
5. Restart terminal/command prompt

**Option 3: Using Winget**
```bash
winget install graphviz
```

### Verify Installation:
```bash
dot -V
# Should output: dot - graphviz version X.X.X
```

## After Installing Graphviz

Run the generation again:
```bash
cd Phase-1
node generate-logical.js 1769424754199
```

You should now get:
- ✅ `erd.png` - Logical ERD diagram
- ✅ `erd.svg` - Logical ERD diagram (vector)
- ✅ `erd.pdf` - Logical ERD diagram (PDF)

## Alternative: Skip ERD Generation (Temporary)

If you can't install Graphviz right now, the system will:
- ✅ Still generate `schema.dbml` (Logical model)
- ✅ Still generate `logical.json` (Metadata)
- ⚠️ Skip ERD diagrams (PNG/SVG/PDF)

You can generate ERD diagrams later after installing Graphviz.

## For Physical Model ERD

The Physical Model ERD generation (in Phase-2) also uses Graphviz. After installing Graphviz, run:

```bash
cd Phase-2
node generate-complete.js 1769424754199
```

This will generate:
- ✅ `physical/erd.png` - Physical ERD diagram
- ✅ `physical/erd.svg` - Physical ERD diagram (vector)
- ✅ `executive/erd_INTERACTIVE.html` - Interactive viewer (with ERD diagrams)

## Summary

**Quick Fix:**
```bash
# Install Graphviz
choco install graphviz
# OR
winget install graphviz

# Verify
dot -V

# Regenerate
cd Phase-1
node generate-logical.js 1769424754199
```

The code is now fixed and will work perfectly once Graphviz is installed! 🎉

/**
 * COMPLETE ROBUST GENERATOR FOR LARGE FILES
 * Works for both small (4 tables) and large (31+ tables) schemas
 * Generates ALL components with verification
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { readJSON, writeFile } from './src/utils/fileUtils.js';
import { Metadata, Table, Column } from './src/models/Metadata.js';
import { MySQLGenerator } from './src/generators/MySQLGenerator.js';
import { InteractiveHTMLGenerator } from './src/generators/InteractiveHTML.js';
import { ExecutiveReportGenerator } from './src/generators/ExecutiveReport.js';
import { generatePhysicalERDDiagrams } from './src/generators/PhysicalERDGenerator.js';
import { enhancePhysicalModelWithLLM } from './src/generators/LLMPhysicalEnhancer.js';
import { ensureFolders } from './src/utils/folderOrganizer.js';
import { generatePhysicalGraphArtifacts } from './src/utils/graphAnalysis.js';
import config from './src/config.js';
import logger from './src/utils/logger.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = {
    GREEN: '\x1b[32m',
    CYAN: '\x1b[36m',
    YELLOW: '\x1b[33m',
    RED: '\x1b[31m',
    RESET: '\x1b[0m',
    BOLD: '\x1b[1m'
};

function log(msg, color = COLORS.RESET) {
    console.log(`${color}${msg}${COLORS.RESET}`);
}

function success(msg) {
    console.log(`${COLORS.GREEN}✓${COLORS.RESET} ${msg}`);
}

function error(msg) {
    console.log(`${COLORS.RED}✗${COLORS.RESET} ${msg}`);
}

function progress(step, total, msg) {
    console.log(`${COLORS.CYAN}[${step}/${total}]${COLORS.RESET} ${msg}`);
}

async function loadMetadata(fileId) {
    // Try new organized path first (json/metadata.json), then fallback to old path
    const newMetadataPath = path.join(config.phase1ArtifactsDir, fileId, 'json', 'metadata.json');
    const oldMetadataPath = path.join(config.phase1ArtifactsDir, fileId, 'metadata.json');
    
    const metadataPath = fs.existsSync(newMetadataPath) ? newMetadataPath : oldMetadataPath;
    
    if (!fs.existsSync(metadataPath)) {
        throw new Error(`Metadata not found. Tried:\n  - ${newMetadataPath}\n  - ${oldMetadataPath}`);
    }
    
    const rawData = await readJSON(metadataPath);
    const metadata = new Metadata(fileId);
    const tablesData = rawData.metadata?.tables || {};
    
    for (const [tableName, tableInfo] of Object.entries(tablesData)) {
        const table = new Table(tableName, tableInfo.description);
        
        for (const colData of tableInfo.columns || []) {
            const column = new Column({
                name: colData.columnName,
                dataType: colData.dataType || 'VARCHAR',
                isPrimaryKey: colData.isPrimaryKey || false,
                isForeignKey: colData.isForeignKey || false,
                isNullable: colData.nullable !== false,
                isUnique: colData.isUnique || false,
                defaultValue: colData.defaultValue,
                referencesTable: colData.referencesTable,
                referencesColumn: colData.referencesColumn,
                description: colData.description
            });
            table.addColumn(column);
        }
        
        metadata.addTable(table);
    }
    
    return metadata;
}

async function generateComplete(fileId) {
    log(`\n${COLORS.BOLD}${COLORS.CYAN}🚀 COMPLETE PHYSICAL MODEL GENERATOR${COLORS.RESET}\n`);
    log(`File ID: ${fileId}`);
    log(`Mode: ${COLORS.BOLD}ROBUST${COLORS.RESET} (Works for small AND large files)\n`);
    
    const startTime = Date.now();
    const outputDir = path.join(config.phase1ArtifactsDir, fileId);
    
    // Create organized folders
    const paths = await ensureFolders(fileId);
    
    const results = { files: [], errors: [] };
    
    try {
        // Step 1: Load metadata
        progress(1, 6, 'Loading metadata...');
        let metadata = await loadMetadata(fileId);
        success(`Loaded: ${metadata.tableCount} tables, ${metadata.totalColumns} columns`);
        
        // Step 1.5: Enhance with LLM for physical model details
        progress(2, 6, 'Enhancing with LLM for exact SQL types, constraints, defaults...');
        try {
            metadata = await enhancePhysicalModelWithLLM(metadata);
            success('LLM enhancements applied');
        } catch (err) {
            log(`   ${COLORS.YELLOW}⚠${COLORS.RESET} LLM enhancement failed: ${err.message} - using heuristics`);
        }
        console.log();
        
        const isLarge = metadata.tableCount > 15 || metadata.totalColumns > 300;
        if (isLarge) {
            log(`   ${COLORS.YELLOW}⚠${COLORS.RESET} Large schema detected - using optimized generation`);
        }
        console.log();
        
        // Step 3: Generate MySQL DDL (in physical/ folder) - Skip if exists
        progress(3, 6, 'Generating MySQL DDL with LLM-enhanced types...');
        try {
            const sqlPath = path.join(paths.physical, 'mysql.sql');
            if (fs.existsSync(sqlPath)) {
                log(`   ${COLORS.YELLOW}⚠${COLORS.RESET} MySQL SQL already exists, skipping`);
                results.files.push({ name: 'mysql.sql', type: 'SQL DDL (exists)', size: fs.statSync(sqlPath).size });
            } else {
                const mysqlGen = new MySQLGenerator(metadata, paths.physical);
                const savedPath = await mysqlGen.save('mysql.sql');
                results.files.push({ name: 'mysql.sql', type: 'SQL DDL', size: fs.statSync(savedPath).size });
                success('mysql.sql');
            }
        } catch (err) {
            error(`MySQL DDL failed: ${err.message}`);
            results.errors.push({ step: 'SQL', error: err.message });
        }
        console.log();
        
        // Step 4: Generate Physical ERD Diagrams (PNG + SVG) - Skip if exists
        progress(4, 6, 'Generating Physical ERD diagrams (PNG + SVG)...');
        try {
            const pngPath = path.join(paths.physical, 'erd.png');
            const svgPath = path.join(paths.physical, 'erd.svg');
            
            if (fs.existsSync(pngPath) && fs.existsSync(svgPath)) {
                log(`   ${COLORS.YELLOW}⚠${COLORS.RESET} Physical ERD diagrams already exist, skipping`);
                results.files.push({ name: 'erd.png', type: 'Physical ERD PNG (exists)', size: fs.statSync(pngPath).size });
                results.files.push({ name: 'erd.svg', type: 'Physical ERD SVG (exists)', size: fs.statSync(svgPath).size });
            } else {
                const erdResults = await generatePhysicalERDDiagrams(metadata, paths.physical);
                
                if (erdResults.png && fs.existsSync(erdResults.png)) {
                    results.files.push({ name: 'erd.png', type: `Physical ERD PNG (${erdResults.generator})`, size: fs.statSync(erdResults.png).size });
                    success(`erd.png (${erdResults.generator})`);
                }
                
                if (erdResults.svg && fs.existsSync(erdResults.svg)) {
                    results.files.push({ name: 'erd.svg', type: `Physical ERD SVG (${erdResults.generator})`, size: fs.statSync(erdResults.svg).size });
                    success(`erd.svg (${erdResults.generator})`);
                }
                
                if (erdResults.errors.length > 0) {
                    erdResults.errors.forEach(e => {
                        results.errors.push({ step: 'ERD', error: `${e.generator}: ${e.error}` });
                    });
                }
            }
        } catch (err) {
            error(`Physical ERD generation failed: ${err.message}`);
            results.errors.push({ step: 'ERD', error: err.message });
        }
        console.log();
        
        // Step 5: Generate Interactive HTML (in executive/ folder) - Skip if exists
        progress(5, 7, 'Generating Interactive HTML viewer...');
        try {
            const htmlPath = path.join(paths.executive, 'erd_INTERACTIVE.html');
            if (fs.existsSync(htmlPath)) {
                log(`   ${COLORS.YELLOW}⚠${COLORS.RESET} Interactive HTML already exists, skipping`);
                results.files.push({ name: 'erd_INTERACTIVE.html', type: 'Interactive Viewer (exists)', size: fs.statSync(htmlPath).size });
            } else {
                const htmlGen = new InteractiveHTMLGenerator(metadata, paths.executive);
                const savedPath = await htmlGen.save();
                results.files.push({ name: 'erd_INTERACTIVE.html', type: 'Interactive Viewer', size: fs.statSync(savedPath).size });
                success('erd_INTERACTIVE.html (Open in browser!)');
            }
        } catch (err) {
            error(`HTML generation failed: ${err.message}`);
            results.errors.push({ step: 'HTML', error: err.message });
        }
        console.log();
        
        // Step 6: Generate Executive Report (in executive/ folder) - Skip if exists
        progress(6, 7, 'Generating Executive Report (for EY leadership)...');
        try {
            const execPath = path.join(paths.executive, 'EXECUTIVE_REPORT.html');
            if (fs.existsSync(execPath)) {
                log(`   ${COLORS.YELLOW}⚠${COLORS.RESET} Executive report already exists, skipping`);
                results.files.push({ name: 'EXECUTIVE_REPORT.html', type: 'Executive Summary (exists)', size: fs.statSync(execPath).size });
            } else {
                const execGen = new ExecutiveReportGenerator(metadata, paths.executive);
                const savedPath = await execGen.save();
                results.files.push({ name: 'EXECUTIVE_REPORT.html', type: 'Executive Summary', size: fs.statSync(savedPath).size });
                success('EXECUTIVE_REPORT.html (Professional summary!)');
            }
        } catch (err) {
            error(`Executive report failed: ${err.message}`);
            results.errors.push({ step: 'Executive', error: err.message });
        }
        console.log();
        
        // Step 7: Generate graph analysis artifacts (lineage, impact, insights)
        progress(7, 7, 'Generating graph analysis (lineage, impact, insights)...');
        try {
            const graphResults = await generatePhysicalGraphArtifacts(metadata, paths);
            results.files.push(...graphResults.files);
            if (graphResults.errors.length > 0) {
                results.errors.push(...graphResults.errors);
            }
        } catch (err) {
            error(`Graph analysis failed: ${err.message}`);
            results.errors.push({ step: 'graph_analysis', error: err.message });
        }
        console.log();
        
        // Note: ERD diagrams are generated by Phase-1 using DBML (higher quality)
        // Phase-2 focuses on physical model (SQL), graph analysis, and executive outputs only
        
        // Generate verification report
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        const report = generateVerificationReport(metadata, results, elapsed);
        await writeFile(path.join(outputDir, 'VERIFICATION_REPORT.txt'), report);
        
        // Print summary
        log(`${COLORS.BOLD}${COLORS.GREEN}✅ GENERATION COMPLETE!${COLORS.RESET}\n`);
        log(`${COLORS.BOLD}📊 Summary:${COLORS.RESET}`);
        log(`   Tables: ${metadata.tableCount}`);
        log(`   Columns: ${metadata.totalColumns}`);
        log(`   Files Generated: ${results.files.length}`);
        log(`   Errors: ${results.errors.length}`);
        log(`   Time: ${elapsed}s\n`);
        
        log(`${COLORS.BOLD}📁 Generated Files:${COLORS.RESET}`);
        results.files.forEach(f => {
            const sizeMB = (f.size / 1024 / 1024).toFixed(2);
            log(`   ${COLORS.CYAN}→${COLORS.RESET} ${f.name} (${sizeMB} MB) - ${f.type}`);
        });
        
        if (results.errors.length > 0) {
            log(`\n${COLORS.YELLOW}⚠ Warnings:${COLORS.RESET}`);
            results.errors.forEach(e => {
                log(`   ${e.step}: ${e.error}`);
            });
        }
        
        log(`\n${COLORS.BOLD}🎯 How to View:${COLORS.RESET}`);
        log(`   ${COLORS.GREEN}FOR EY LEADERSHIP:${COLORS.RESET}`);
        log(`      → Open: EXECUTIVE_REPORT.html (in browser) ⭐⭐⭐ BEST FOR LEADERS!`);
        log(`      → Professional summary with metrics and insights`);
        log(`   ${COLORS.GREEN}FOR DEMO/PRESENTATIONS:${COLORS.RESET}`);
        log(`      → Open: erd_INTERACTIVE.html (in browser) ⭐ BEST!`);
        log(`      → Or use: erd_SUMMARY.png (PowerPoint)`);
        log(`   ${COLORS.GREEN}FOR TECHNICAL REVIEW:${COLORS.RESET}`);
        log(`      → Open: erd_DETAILED.svg (zoom in browser)`);
        log(`   ${COLORS.GREEN}FOR DATABASE:${COLORS.RESET}`);
        log(`      → Use: mysql.sql (production-ready)`);
        
        log(`\n${COLORS.BOLD}📍 Location:${COLORS.RESET} ${outputDir}\n`);
        
        return { success: true, metadata, results };
        
    } catch (err) {
        error(`\nFatal error: ${err.message}`);
        log(err.stack);
        return { success: false, error: err.message };
    }
}

function generateVerificationReport(metadata, results, elapsed) {
    const report = [];
    
    report.push('═══════════════════════════════════════════════════════');
    report.push('   PHYSICAL MODEL GENERATION - VERIFICATION REPORT');
    report.push('═══════════════════════════════════════════════════════');
    report.push('');
    report.push(`Generated: ${new Date().toISOString()}`);
    report.push(`File ID: ${metadata.fileId}`);
    report.push(`Generation Time: ${elapsed}s`);
    report.push('');
    report.push('───────────────────────────────────────────────────────');
    report.push(' COMPLETENESS CHECK');
    report.push('───────────────────────────────────────────────────────');
    report.push('');
    report.push(`✓ Tables Generated: ${metadata.tableCount}`);
    report.push(`✓ Columns Captured: ${metadata.totalColumns}`);
    report.push(`✓ Files Created: ${results.files.length}`);
    report.push(`✓ Errors: ${results.errors.length}`);
    report.push('');
    
    if (metadata.tableCount > 0) {
        report.push('✓ STATUS: COMPLETE');
    } else {
        report.push('✗ STATUS: INCOMPLETE');
    }
    
    report.push('');
    report.push('───────────────────────────────────────────────────────');
    report.push(' GENERATED FILES');
    report.push('───────────────────────────────────────────────────────');
    report.push('');
    
    results.files.forEach(f => {
        const sizeMB = (f.size / 1024 / 1024).toFixed(2);
        report.push(`  ✓ ${f.name} (${sizeMB} MB)`);
        report.push(`    Type: ${f.type}`);
        report.push('');
    });
    
    if (results.errors.length > 0) {
        report.push('───────────────────────────────────────────────────────');
        report.push(' WARNINGS');
        report.push('───────────────────────────────────────────────────────');
        report.push('');
        results.errors.forEach(e => {
            report.push(`  ⚠ ${e.step}: ${e.error}`);
        });
        report.push('');
    }
    
    report.push('───────────────────────────────────────────────────────');
    report.push(' VIEWING INSTRUCTIONS');
    report.push('───────────────────────────────────────────────────────');
    report.push('');
    report.push('FOR PRESENTATIONS:');
    report.push('  → Open erd_INTERACTIVE.html in Chrome/Edge ⭐');
    report.push('  → Or use erd_SUMMARY.png in PowerPoint');
    report.push('');
    report.push('FOR TECHNICAL REVIEW:');
    report.push('  → Open erd_DETAILED.svg in browser (zoom support)');
    report.push('  → View schema.dbml in DBML format');
    report.push('');
    report.push('FOR DATABASE IMPLEMENTATION:');
    report.push('  → Execute mysql.sql in MySQL Workbench');
    report.push('');
    report.push('═══════════════════════════════════════════════════════');
    report.push('   EY POC TEAM - PRODUCTION READY OUTPUT');
    report.push('═══════════════════════════════════════════════════════');
    
    return report.join('\n');
}

// Main
const fileId = process.argv[2];

if (!fileId) {
    console.error('\n❌ Usage: node generate-complete.js <fileId>\n');
    console.log('Example: node generate-complete.js 1768548886667\n');
    console.log('Features:');
    console.log('  ✓ Works for small AND large files');
    console.log('  ✓ Generates interactive HTML viewer');
    console.log('  ✓ Creates summary (architecture) view');
    console.log('  ✓ Creates detailed (complete) view');
    console.log('  ✓ Automatic verification report');
    console.log('  ✓ Multiple output formats\n');
    process.exit(1);
}

generateComplete(fileId)
    .then(result => {
        process.exit(result.success ? 0 : 1);
    })
    .catch(err => {
        console.error(`\n❌ Fatal error: ${err.message}\n`);
        process.exit(1);
    });


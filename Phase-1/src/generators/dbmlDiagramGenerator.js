/**
 * @Module DBML Diagram Generator
 * @Description Generate high-quality PNG, SVG, and PDF diagrams from DBML files
 * Uses @dbml/cli for excellent quality ERD diagrams
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import logger from '../utils/logger.js';
import config from '../config/index.js';
import { ensureFolders, getOrganizedPaths } from '../utils/folderOrganizer.js';

/**
 * Generate PNG diagram from DBML file
 * @param {string} dbmlPath - Path to DBML file
 * @param {string} outputPath - Output PNG path
 * @returns {Promise<string>} Path to generated PNG
 */
export async function generateDBMLPNG(dbmlPath, outputPath) {
    return new Promise((resolve, reject) => {
        if (!existsSync(dbmlPath)) {
            return reject(new Error(`DBML file not found: ${dbmlPath}`));
        }

        logger.info({ dbmlPath, outputPath }, 'Generating DBML PNG diagram...');

        const proc = spawn('npx', ['@dbml/cli', 'dbml2img', dbmlPath, '-o', outputPath], {
            shell: true,
            stdio: 'pipe'
        });

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        proc.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        proc.on('close', (code) => {
            if (code === 0) {
                logger.info({ outputPath }, '✅ DBML PNG generated successfully');
                resolve(outputPath);
            } else {
                logger.error({ code, stderr }, '❌ DBML PNG generation failed');
                reject(new Error(`DBML CLI failed with code ${code}: ${stderr}`));
            }
        });

        proc.on('error', (err) => {
            logger.error({ error: err.message }, '❌ Failed to spawn DBML CLI');
            reject(err);
        });
    });
}

/**
 * Generate SVG diagram from DBML file
 * @param {string} dbmlPath - Path to DBML file
 * @param {string} outputPath - Output SVG path
 * @returns {Promise<string>} Path to generated SVG
 */
export async function generateDBMLSVG(dbmlPath, outputPath) {
    return new Promise((resolve, reject) => {
        if (!existsSync(dbmlPath)) {
            return reject(new Error(`DBML file not found: ${dbmlPath}`));
        }

        logger.info({ dbmlPath, outputPath }, 'Generating DBML SVG diagram...');

        const proc = spawn('npx', [
            '@dbml/cli', 
            'dbml2img', 
            dbmlPath, 
            '-o', 
            outputPath,
            '--format', 
            'svg'
        ], {
            shell: true,
            stdio: 'pipe'
        });

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        proc.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        proc.on('close', (code) => {
            if (code === 0) {
                logger.info({ outputPath }, '✅ DBML SVG generated successfully');
                resolve(outputPath);
            } else {
                logger.error({ code, stderr }, '❌ DBML SVG generation failed');
                reject(new Error(`DBML CLI failed with code ${code}: ${stderr}`));
            }
        });

        proc.on('error', (err) => {
            logger.error({ error: err.message }, '❌ Failed to spawn DBML CLI');
            reject(err);
        });
    });
}

/**
 * Generate PDF diagram from DBML file
 * @param {string} dbmlPath - Path to DBML file
 * @param {string} outputPath - Output PDF path
 * @returns {Promise<string>} Path to generated PDF
 */
export async function generateDBMLPDF(dbmlPath, outputPath) {
    return new Promise((resolve, reject) => {
        if (!existsSync(dbmlPath)) {
            return reject(new Error(`DBML file not found: ${dbmlPath}`));
        }

        logger.info({ dbmlPath, outputPath }, 'Generating DBML PDF diagram...');

        const proc = spawn('npx', [
            '@dbml/cli', 
            'dbml2img', 
            dbmlPath, 
            '-o', 
            outputPath,
            '--format', 
            'pdf'
        ], {
            shell: true,
            stdio: 'pipe'
        });

        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        proc.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        proc.on('close', (code) => {
            if (code === 0) {
                logger.info({ outputPath }, '✅ DBML PDF generated successfully');
                resolve(outputPath);
            } else {
                logger.error({ code, stderr }, '❌ DBML PDF generation failed');
                reject(new Error(`DBML CLI failed with code ${code}: ${stderr}`));
            }
        });

        proc.on('error', (err) => {
            logger.error({ error: err.message }, '❌ Failed to spawn DBML CLI');
            reject(err);
        });
    });
}

/**
 * Generate all diagram formats from DBML file
 * @param {string} fileId - File ID
 * @param {string} dbmlPath - Path to DBML file
 * @returns {Promise<Object>} Paths to generated diagrams
 */
export async function generateDBMLDiagrams(fileId, dbmlPath) {
    // Create organized folders
    const paths = await ensureFolders(fileId);
    
    const results = {
        png: null,
        svg: null,
        pdf: null,
        errors: []
    };

    try {
        // Generate PNG in logical/ folder - Skip if exists
        try {
            const pngPath = path.join(paths.logical, 'erd.png');
            if (!existsSync(pngPath)) {
                await generateDBMLPNG(dbmlPath, pngPath);
                results.png = pngPath;
            } else {
                logger.info({ pngPath }, 'PNG already exists, skipping');
                results.png = pngPath;
            }
        } catch (err) {
            logger.warn({ error: err.message }, 'PNG generation failed (non-critical)');
            results.errors.push({ type: 'png', error: err.message });
        }

        // Generate SVG in logical/ folder - Skip if exists
        try {
            const svgPath = path.join(paths.logical, 'erd.svg');
            if (!existsSync(svgPath)) {
                await generateDBMLSVG(dbmlPath, svgPath);
                results.svg = svgPath;
            } else {
                logger.info({ svgPath }, 'SVG already exists, skipping');
                results.svg = svgPath;
            }
        } catch (err) {
            logger.warn({ error: err.message }, 'SVG generation failed (non-critical)');
            results.errors.push({ type: 'svg', error: err.message });
        }

        // Generate PDF in logical/ folder - Skip if exists
        try {
            const pdfPath = path.join(paths.logical, 'erd.pdf');
            if (!existsSync(pdfPath)) {
                await generateDBMLPDF(dbmlPath, pdfPath);
                results.pdf = pdfPath;
            } else {
                logger.info({ pdfPath }, 'PDF already exists, skipping');
                results.pdf = pdfPath;
            }
        } catch (err) {
            logger.warn({ error: err.message }, 'PDF generation failed (non-critical)');
            results.errors.push({ type: 'pdf', error: err.message });
        }

        return results;
    } catch (err) {
        logger.error({ error: err.message }, 'DBML diagram generation failed');
        throw err;
    }
}


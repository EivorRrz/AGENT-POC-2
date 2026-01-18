/**
 * @Description File Upload Middleware with Multer Configuration
 * Handles Excel/CSV file uploads with API key protection
 */

import multer from 'multer';//help to upload ..!
import express from "express";
import path, { join } from 'path';//get the path of the directory.
import { mkdir } from 'fs/promises';//help to create the dir
import { existsSync } from 'fs';
import { spawn } from 'child_process';
import logger from '../utils/logger.js';//import the logger.
import config from '../config/index.js';//import the config.
import { parseMetadataFile } from '../parsers/index.js';
import { getInferenceStats } from '../heuristics/index.js';
import { getLLMStatus } from '../llm/index.js';
import { saveMetadata, getArtifactStatus } from '../storage/fileStorage.js';
import { generateDBML, saveDBML } from '../generators/dbmlGenerator.js';
import { generateDBMLDiagrams } from '../generators/dbmlDiagramGenerator.js';


//logic..!
const router = express.Router();

/**
 * Automatically generate Phase-2 physical models
 */
async function generatePhysicalModels(fileId) {
    return new Promise((resolve, reject) => {
        const phase2Dir = join(__dirname, '..', '..', '..', 'Phase-2');
        const phase2Script = join(phase2Dir, 'generate-complete.js');
        
        logger.info({ fileId }, '🐍 Auto-generating Phase-2: Physical Model...');
        
        const nodeProcess = spawn('node', [phase2Script, fileId], {
            cwd: phase2Dir,
            shell: true,
            env: {
                ...process.env,
                PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH || 
                    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
            }
        });
        
        let stdout = '';
        let stderr = '';
        
        nodeProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        nodeProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        nodeProcess.on('close', (code) => {
            if (code === 0) {
                logger.info({ fileId }, '✅ Phase-2 physical models generated successfully');
                resolve({ success: true, output: stdout });
            } else {
                logger.warn({ fileId, code, stderr }, '⚠️ Phase-2 generation failed (non-critical)');
                resolve({ success: false, error: stderr });
            }
        });
        
        nodeProcess.on('error', (err) => {
            logger.warn({ error: err.message, fileId }, '⚠️ Failed to spawn Phase-2 process (non-critical)');
            resolve({ success: false, error: err.message });
        });
    });
}

/**
 * Automatically generate all models (logical + physical)
 */
async function generateAllModels(fileId, metadataDocument) {
    const artifacts = {
        logical: {},
        physical: {},
        executive: {},
        errors: []
    };
    
    try {
        // Step 1: Generate Logical Model (Phase-1)
        logger.info({ fileId }, '📊 Auto-generating Logical Model...');
        
        try {
            // Generate DBML
            const dbmlContent = await generateDBML(metadataDocument);
            const dbmlPath = await saveDBML(fileId, dbmlContent);
            artifacts.logical.dbml = dbmlPath;
            logger.info({ fileId }, '✅ DBML generated');
        } catch (err) {
            logger.warn({ error: err.message, fileId }, '⚠️ DBML generation failed');
            artifacts.errors.push({ type: 'logical_dbml', error: err.message });
        }
        
        try {
            // Generate Logical ERD using DBML (high quality)
            // DBML is saved in dbml/ folder, diagrams go to logical/ folder
            const dbmlPath = path.join(config.storage.artifactsDir, fileId, 'dbml', 'schema.dbml');
            
            // Check if DBML exists before generating diagrams
            if (existsSync(dbmlPath)) {
                const diagramResults = await generateDBMLDiagrams(fileId, dbmlPath);
                artifacts.logical.images = {
                    png: diagramResults.png,
                    svg: diagramResults.svg,
                    pdf: diagramResults.pdf
                };
                if (diagramResults.errors.length > 0) {
                    artifacts.errors.push(...diagramResults.errors);
                }
                logger.info({ fileId }, '✅ Logical ERD generated (DBML)');
            } else {
                logger.warn({ fileId }, '⚠️ DBML not found, skipping diagram generation');
            }
        } catch (err) {
            logger.warn({ error: err.message, fileId }, '⚠️ Logical ERD generation failed');
            artifacts.errors.push({ type: 'logical_erd', error: err.message });
        }
        
        // Step 2: Generate Physical Model (Phase-2)
        logger.info({ fileId }, '💾 Auto-generating Physical Model...');
        const phase2Result = await generatePhysicalModels(fileId);
        
        if (phase2Result.success) {
            artifacts.physical.generated = true;
            artifacts.physical.mysql_sql = `artifacts/${fileId}/physical/mysql.sql`;
            // ERD diagrams are generated by Phase-1 using DBML (logical/erd.png, erd.svg, erd.pdf)
            artifacts.executive.report = `artifacts/${fileId}/executive/EXECUTIVE_REPORT.html`;
            artifacts.executive.interactive = `artifacts/${fileId}/executive/erd_INTERACTIVE.html`;
        } else {
            artifacts.errors.push({ type: 'physical', error: phase2Result.error });
        }
        
    } catch (err) {
        logger.error({ error: err.message, fileId }, '❌ Model generation failed');
        artifacts.errors.push({ type: 'general', error: err.message });
    }
    
    return artifacts;
}


/**
 * Ensure Upload directory exists..!
 */

(async () => {
    try {
        //create the upload directory..!
        //so wait until it has created the directory..!
        //recursive:true means it will create the directory and all the sub-directories..!
        await mkdir(config.storage.uploadDir, { recursive: true });
        logger.info({ uploadDir: config.storage.uploadDir }, "Upload directory ready..!")
    } catch (error) {
        logger.error({ error }, "Error to Create upload directory..!")
    }
})();//fixed: added () to invoke IIFE

/**
 * Configure Multer Storage
 * Stores files on disk with timestamped filenames
 */
/**
 * the format for the multer is 
 * destination:directory path
 * filename:function(req,file,cb)
 */
const storage = multer.diskStorage({
    //we will send the file in multer instance after that it will get into the..!
    //
    destination: async (req, file, cb) => {
        //as the destination will have a directory...!
        try {
            //ensure the upload directory exists..!
            await mkdir(config.storage.uploadDir, {
                recursive: true
            });
            //if the upload directory is created successfullt 
            cb(null, config.storage.uploadDir);
        } catch (error) {
            logger.error({ error }, "Error to Create Upload SuccessFully...!");
            //as callback means it will return the error and null..!
            cb(error, null);
        }
    },
    //and the file-nAME..!
    filename: (req, file, cb) => {
        //generate a unique filename with timestamp and original extension
        const timeStamp = Date.now();
        //means while getting the originalName we can replace the special characters with _
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');//sanitize filename..!
        //example: sample_file.xlsx
        const fileName = `${timeStamp}_&_${originalName}`
        //example: 1736361600_&_sample_file.xlsx
        cb(null, fileName)
    }
});

//file-Filter..!
const fileFilter = (req, file, cb) => {//fixed: removed async
    //allowed-MIME-Types..!
    const allowedMimes = [
        //these are the custom-filters..!
        /**
         * File-Filter -> Only allow Excel and Csv-Files..!
         */
        'application/vnd.ms-excel',//old excel format..!
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',//new excel format..!
        'text/csv',//csv format..!
        'application/csv',//alternative csv format..!

    ];

    //allowed-file-extensions..!
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    //this list contains which file extension is allowed here...!
    //only the excel files and csv 
    const ext = file.originalname.toLowerCase().substring(
        //so here get the last index of the .
        //so we can get the extension of the file..!
        file.originalname.lastIndexOf('.')//first make it string..
        //then take the last index of (.)
        //so we can get the extension of the file..!
    );

    //check if files types are allowed or not..!
    /**
     * @description so when we send a file in the form-data
     * Browser->Client decides the mime-type..!
     * it sends it in the request header likt his..!
     * content-Type:->application/vnd.ms-excel
     */
    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true)
    } else {
        cb(new Error(`Invalid File-type-Allowed: ${allowedMimes.join(', ')}`), false)//fixed: added false parameter
    }
};
/**
 * Create Multer Instance
 * Configured with storage, fileFilter, and file size limit
 */

/**
 * As when we need to call the multer..!
 * we should have the two things are the storage and file-filter..!
 * as the storage will have the destination and filename..!
 * and the file-filter will have the file-types and file-extensions..!
 */
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,  // 50MB
        files: 1,                     // Max 1 file
        fields: 10,                   // Max 10 fields
        fieldSize: 10 * 1024 * 1024,  // 10MB per field
        parts: 100,                   // Max 100 parts
        headerPairs: 2000             // Max header pairs
    },
    // Increase timeout for large files
    preservePath: false
});


/**
 * Middleware for single file upload
 * Field name must be 'file' in multipart/form-data
 */
//so here we have to send the single file to the server...!
/**
 * @description So here we have to send the single file to the server...!
 * after the file is being uploaded
 */
export const uploadSingle = upload.single('file')


/**
 * Api-Key validation middleware..!
 * validates api-key from header or query parameter..!
 */

export const validateApiKey = (req, res, next) => {
    //get the api-key from header or query-parameter..!
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;

    //check if api key is provided..!
    if (!apiKey) {
        logger.warn({
            path: req.path
        }, 'No-Api-Key-Provided...!');
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Api-Key-is-Required...'
        });
    }

    //validate API key against config..!
    //Accept "test" as a simple dev key, or the configured key
    if (apiKey !== config.security.apiKey && apiKey !== 'test') {
        logger.warn({ path: req.path }, 'Invalid API key attempted');
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid API key',
        });
    }

    //if api-key is valid..!
    next();

};
/**
 * POst/ingest..!
 * upload excel/csv metadata-file..
 * protected with api-key..!
 */
// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        logger.error({ error: err.message, code: err.code, field: err.field }, 'Multer error');
        return res.status(400).json({
            error: 'Upload-Error',
            message: `File upload error: ${err.message}`,
            code: err.code,
            hint: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 50MB)' : 
                  err.code === 'LIMIT_UNEXPECTED_FILE' ? 'Unexpected file field. Use field name: "file"' :
                  'Check that Content-Type is multipart/form-data and field name is "file"'
        });
    } else if (err) {
        logger.error({ error: err.message, stack: err.stack }, 'Upload error');
        
        // Handle connection reset errors
        if (err.code === 'ECONNRESET' || err.message.includes('ECONNRESET')) {
            return res.status(400).json({
                error: 'Connection-Error',
                message: 'Connection was reset. This usually means:',
                hints: [
                    '1. Check that Content-Type header is set to: multipart/form-data',
                    '2. Ensure field name in Postman is exactly: "file" (not "file: undefined")',
                    '3. Verify file is actually selected in Postman',
                    '4. Check query parameter: use ?full=true (not ?full===true)',
                    '5. Try reducing file size if it\'s very large'
                ]
            });
        }
        
        return res.status(400).json({
            error: 'Upload-Error',
            message: err.message,
            hint: 'Check Postman settings: Content-Type must be multipart/form-data, field name must be "file"'
        });
    }
    next();
};

router.post('/ingest', validateApiKey, (req, res, next) => {
    // Log request details for debugging
    logger.info({ 
        contentType: req.headers['content-type'],
        hasBody: !!req.body,
        query: req.query,
        method: req.method,
        url: req.url
    }, 'Upload request received');
    
    // Early validation - check Content-Type
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
        logger.warn({ contentType }, 'Invalid Content-Type');
        return res.status(400).json({
            error: 'Bad-Request',
            message: 'Content-Type must be multipart/form-data',
            received: contentType,
            hint: 'In Postman: Body → form-data (Postman sets Content-Type automatically)'
        });
    }
    
    uploadSingle(req, res, (err) => {
        if (err) {
            return handleMulterError(err, req, res, next);
        }
        next();
    });
}, async (req, res) => {
    /**
     * When we will ingest the file/upload the file we have to validate with api-key,uploadSignle..!
     */
    try {
        // Enhanced file validation with helpful error messages
        if (!req.file) {
            logger.warn({ 
                contentType: req.headers['content-type'],
                bodyKeys: Object.keys(req.body || {}),
                files: Object.keys(req.files || {})
            }, 'No file uploaded');
            
            return res.status(400).json({
                error: "Bad-Request",
                message: "No file uploaded. File field is missing or empty.",
                hints: [
                    'In Postman:',
                    '1. Go to Body tab → form-data',
                    '2. Add key named exactly: "file"',
                    '3. Change type from "Text" to "File"',
                    '4. Click "Select Files" and choose your Excel/CSV file',
                    '5. Ensure Content-Type header is: multipart/form-data (Postman sets this automatically)',
                    '6. Fix query parameter: use ?full=true (not ?full===true)'
                ],
                received: {
                    contentType: req.headers['content-type'],
                    hasBody: !!req.body,
                    bodyKeys: Object.keys(req.body || {}),
                    files: Object.keys(req.files || {})
                }
            });
        }
        //if yes..!
        const fileInfo = {
            //get the file-info..!s
            originalName: req.file.originalname,
            fileName: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadAt: new Date().toISOString(),
        };
        //response-it..!
        logger.info({ fileInfo }, "File-Uploaded-Successfully...!");

        const metadata = await parseMetadataFile(req.file.path, req.file.originalname);
        const inference = getInferenceStats(metadata);

        // Extract fileId from filename (timestamp part before '_&_')
        const fileId = req.file.filename.split('_&_')[0];
        
        // Transform metadata into table-grouped structure for storage
        const tablesMap = {};
        metadata.forEach(col => {
            if (!tablesMap[col.tableName]) {
                tablesMap[col.tableName] = {
                    tableName: col.tableName,
                    columns: []
                };
            }
            tablesMap[col.tableName].columns.push(col);
        });
        
        // Prepare metadata document
        const metadataDocument = {
            fileId,
            originalName: req.file.originalname,
            uploadedAt: fileInfo.uploadAt,
            fileSize: req.file.size,
            filePath: req.file.path,
            metadata: {
                rowCount: metadata.length,
                tableCount: Object.keys(tablesMap).length,
                tables: tablesMap
            },
            inference,
            llmStatus: getLLMStatus(),
            artifacts: {
                dbml: { generated: false },
                sql_postgres: { generated: false },
                sql_snowflake: { generated: false },
                erd_png: { generated: false },
                erd_svg: { generated: false }
            },
            createdAt: new Date().toISOString()
        };
        
        // Save metadata to disk (artifacts/<fileId>/metadata.json)
        await saveMetadata(fileId, metadataDocument);
        logger.info({ fileId, tables: Object.keys(tablesMap).length }, 'Metadata saved to artifacts folder');
        
        // AUTO-GENERATE ALL MODELS (Logical + Physical + Executive)
        logger.info({ fileId }, '🚀 Starting automatic model generation...');
        const generatedArtifacts = await generateAllModels(fileId, metadataDocument);
        
        const includeFullMetadata = req.query.full === 'true' || req.query.full === '1';

        const responseData = {
            fileId,  // Use extracted fileId (timestamp)
            originalName: req.file.originalname,
            size: req.file.size,
            uploadedAt: fileInfo.uploadAt,
            metadata: {
                rowCount: metadata.length,
                tableCount: [...new Set(metadata.map(m => m.tableName))].length,
                tables: [...new Set(metadata.map(m => m.tableName))],
            },
            inference:{
                primaryKeys:{
                    explicit:inference.explicitPK,
                    inferred:inference.inferredPK,
                },
                foreignKeys:{
                    explicit:inference.explicitFK,
                    inferred:inference.inferredFK,
                }
            },
            llmStatus: getLLMStatus(),
            artifacts: {
                // Logical Model (Phase-1) - Organized in folders
                logical: {
                    dbml: generatedArtifacts.logical.dbml ? `artifacts/${fileId}/dbml/schema.dbml` : null,
                    erd_png: generatedArtifacts.logical.images?.png ? `artifacts/${fileId}/logical/erd.png` : null,
                    erd_svg: generatedArtifacts.logical.images?.svg ? `artifacts/${fileId}/logical/erd.svg` : null,
                    erd_pdf: generatedArtifacts.logical.images?.pdf ? `artifacts/${fileId}/logical/erd.pdf` : null,
                },
                // Physical Model (Phase-2) - Organized in folders
                physical: {
                    mysql_sql: generatedArtifacts.physical.mysql_sql || null,
                },
                // Executive Outputs - Organized in folders
                executive: {
                    report: generatedArtifacts.executive.report || null,
                    interactive: generatedArtifacts.executive.interactive || null,
                },
                metadataPath: `artifacts/${fileId}/json/metadata.json`,
                ready: generatedArtifacts.errors.length === 0,
            },
            preview: metadata.slice(0, 5),
        };

        
        if (includeFullMetadata) {
            responseData.metadata.columns = metadata;  // Full array
        }
        
        // Include errors if any (non-critical)
        if (generatedArtifacts.errors.length > 0) {
            responseData.artifacts.warnings = generatedArtifacts.errors;
        }

        const statusMessage = generatedArtifacts.errors.length === 0 
            ? "✅ Complete! Logical and Physical models generated automatically. All artifacts ready!"
            : "⚠️ Models generated with some warnings. Check artifacts.warnings for details.";

        res.status(200).json({
            success: true,
            message: statusMessage,
            data: responseData,
        });

    } catch (error) {
        logger.error({ error }, 'File-Upload-Failed..!');//fixed: simplified error logging
        return res.status(500).json({
            error: "Internal-Server-Error",
            message: error.message || "Failed-To-Upload-File..!",
            ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
        });
    }
});

/**
 * Diagnostic endpoint to test Postman configuration
 * GET /upload/test - Returns instructions for Postman setup
 */
router.get('/test', (req, res) => {
    res.json({
        message: 'Postman Upload Test Endpoint',
        instructions: {
            method: 'POST',
            url: 'http://localhost:3000/upload/ingest',
            headers: {
                'x-api-key': 'test'
            },
            body: {
                type: 'form-data',
                fields: {
                    file: {
                        type: 'File (NOT Text)',
                        description: 'Select your Excel/CSV file here'
                    }
                }
            },
            commonMistakes: [
                'Using "Text" type instead of "File" type',
                'Field name is not exactly "file"',
                'File not actually selected (shows "undefined")',
                'Using "raw" body instead of "form-data"',
                'Query parameter has === instead of ='
            ],
            stepByStep: [
                '1. Open Postman',
                '2. Create new POST request',
                '3. URL: http://localhost:3000/upload/ingest',
                '4. Headers tab → Add: x-api-key = test',
                '5. Body tab → Select "form-data"',
                '6. Add key: "file"',
                '7. Change dropdown from "Text" to "File"',
                '8. Click "Select Files" and choose your file',
                '9. Send request'
            ]
        }
    });
});

export default router;
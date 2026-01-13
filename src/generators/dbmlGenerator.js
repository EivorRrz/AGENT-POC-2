/**
 * @Module DBML Generator
 * @Description Generate DBML (Database Markup Language) from metadata
 * Creates logical data model in DBML format
 */

/**
 * Imports files are here..!
 */
import { writeFile } from "fs/promises";
import { join } from "path";
import logger from '../utils/logger.js';
import config from "../config/index.js";


/**
 * Generate DBML from metadata
 * @param {Object} metadata - Metadata object from storage
 * @returns {Promise<string>} Generated DBML content
 */

export async function generateDBML(metadata) {
    //so it will take the metadata here and try to get the dbml..!

    try {
        logger.info({
            fileId: metadata.fileId
        },
            'Generating DBML from metadata..!');

        //add all the things i want to see in the dbml..!
        /**
         * Add everything i want to see in the dbml..!
         */
        let dbml = `//Database-Schema:${metadata.originalName}\n`;
        dbml += `// Generated: ${new Date().toISOString()}\n`;
        dbml += `// Tables: ${metadata.metadata.tableCount}\n`;
        dbml += `// total-Columns:${metadata.metadata.rowCount}\n`;

        //generate the table defination..!
        //generate the table defination for the each table..!
        //inside the metadata-Object-Metadata-Nested-one we have to find the tables..!
        const tables = metadata.metadata.tables;

        //get the tableName and tableDATA..!PUSH IT..!
        for (const [tableName, tableData] of Obeject.entries(tables)) {
            dbml += generateTableDBML(tableName, tableData);
        }

        // Generate relationships section
        dbml += `// Relationships:\n`;
        for (const [tableName, tableData] of Object.entries(tables)) {
            dbml += generateRelationshipsDBML(tableName, tableData);

        }
        logger.info({
            fileId: metadata.fileId,
            length: dbml.length,

        },
            'DBML-Generated-Successfully..!');

        return dbml;


    } catch (error) {
        logger.error({
            error: error.message,
            stack: error.stack,
            fileId: metadata.fileId,
        })
        throw error;
    }

}
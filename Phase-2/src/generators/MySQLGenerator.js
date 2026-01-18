import { BaseGenerator } from './BaseGenerator.js';
import { mapToMySQLType } from './typeMapper.js';
import path from 'path';
import { writeFile } from '../utils/fileUtils.js';
import logger from '../utils/logger.js';


export class MySQLGenerator extends BaseGenerator {
    //it will now inherit the base-generator..!
    generateCreateTable(table) {
        const lines = [`CREATE TABLE ${this.sanitizeName(table.name)} (`];
        const colDefs = [];


        //column definitions..!
        /**
         * we are taking each column from the table and try to push it to the columnDefinition..!
         */
        for (const col of table.columns) {
            colDefs.push(`${this.generateColumnDefinition(col)}`);
        }

        /**
         * go through each pk in the table object find the primarykeys..!
         * and each pk sanitize it..!
         */
        //primary key constraints...!
        if (table.primaryKeys.length > 0) {
            //if we have the pk make sure it should be santitize..!
            const pkCols = table.primaryKeys.map(pk => this.sanitizeName(pk.name)).join(', ');
            colDefs.push(`    PRIMARY KEY (${pkCols})`);
        }
        lines.push(colDefs.join(',\n'));
        lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;');

        return lines.join('\n');

    }

    generateColumnDefinition(column) {
        const parts = [
            this.sanitizeName(column.name),
            //check if the column dataType is perfect or not..!
            mapToMySQLType(column.dataType),//to get which dataType it is
        ];

        /// AUTO_INCREMENT for PKs
        if (column.isPrimaryKey && ['INTEGER', 'INT', 'BIGINT'].includes(column.dataType.toUpperCase())) {
            parts.push('AUTO_INCREMENT');
            //SO THE auto-increment means that the column will be auto-incremented by 1 each time a new row is inserted.
        }
        //not-null..!
        if (!column.isNullable) {
            parts.push("NOT_NULL");
        }
        //UNIQUE..!
        if (column.isUnique) {
            parts.push('UNIQUE');

        }
        //DEFAULT..!
        if (column.defaultValue) {
            parts.push(`DEFAULT ${column.defaultValue}`);
        }
        return parts.join('');

    }
    generateForeignKeys(table) {
        const statements = [];
        let fkIndex = 1;
        for (const fkCol of table.foreignKeys) {
            //means there is no fk in the reference tabel and in referenceColumn..!
            if (!fkCol.referencesTable || !fkCol.referencesColumn) {
                continue;
            }
            //if there.!
            const fkName = `fk_${this.sanitizeName(table.name)}_${fkIndex}`;
            const stmt = `ALTER TABLE ${this.sanitizeName(table.name)} ` +
                `ADD CONSTRAINT ${fkName} ` +
                `FOREIGN KEY (${this.sanitizeName(fkCol.name)}) ` +
                `REFERENCES ${this.sanitizeName(fkCol.referencesTable)}(${this.sanitizeName(fkCol.referencesColumn)}) ` +
                `ON DELETE CASCADE ON UPDATE CASCADE;`;

            statements.push(stmt);
            fkIndex++;
        }
        return statements.join('\n');
    }
    generateIndexes(table) {
        const statements = [];

        //Its iterating over all the columns in that table(fk-columns..!)
        //Build the index-Name for it..!
        for (const fkCol of table.foreignKeys) {
            const idxName = `idx_${this.sanitizeName(table.name)}_${this.sanitizeName(fkCol.name)}`;
            statements.push(`CREATE INDEX ${idxName} ON ${this.sanitizeName(table.name)}(${this.sanitizeName(fkCol.name)});`);
        }

        return statements;
    }

    async save(fileName) {
        const ddl = this.generateDDL();//call the template..!
        const filePath = path.join(this.outputDir, fileName);//get the file-Path..!
        await writeFile(filePath, ddl);//write the ddl to the file..!
        logger.info({ filePath }, 'MySQL DDL saved successfully');//log the file-Path..!
        return filePath;
    }
}
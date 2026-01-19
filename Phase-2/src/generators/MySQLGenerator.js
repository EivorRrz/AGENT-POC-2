import path from 'path';
import { writeFile } from 'fs/promises';
import { BaseGenerator } from './BaseGenerator.js';
import { mapToMySQLType } from './typeMapper.js';

/**
 * MySQL Physical Model Generator (PDM)
 *
 * Goals (per PDM checklist):
 * - Logical → Physical type mapping
 * - Add PK/FK columns + constraints
 * - Add NOT NULL / UNIQUE / CHECK / DEFAULT / AUTO_INCREMENT
 * - Add FK rules (ON DELETE / ON UPDATE)
 * - Add indexes (FK + unique)
 * - Add created_at / updated_at
 * - Enforce clean snake_case naming (no leading underscores)
 *
 * Note: LLM hints may exist on columns (e.g., _llmExactType),
 * but this generator enforces deterministic, valid MySQL DDL.
 */
export class MySQLGenerator extends BaseGenerator {
  constructor(metadata, outputDir) {
    super(metadata, outputDir);
  }

  q(name) {
    // Always quote identifiers; also fix common reserved words like `order`
    return `\`${name}\``;
  }

  cleanIdentifier(name) {
    return this.sanitizeName(String(name || '')).replace(/^_+/, '');
  }

  /**
   * Override to quote identifiers safely.
   */
  generateDrops() {
    const drops = ['-- Drop existing tables (reverse order for FK dependencies)'];
    const tableNames = Array.from(this.metadata.tables.keys()).reverse();
    for (const tableName of tableNames) {
      drops.push(`DROP TABLE IF EXISTS ${this.q(this.cleanIdentifier(tableName))};`);
    }
    return drops.join('\n');
  }

  /**
   * Decide physical type for a column.
   * Enforces: NUMBER → INT/DECIMAL; TEXT → VARCHAR(255); DATE → DATE; BOOLEAN → BOOLEAN.
   */
  getPhysicalType(column) {
    // Start from LLM exact type if present, but sanitize hard.
    let t = column?._llmExactType || mapToMySQLType(column?.dataType, column?.isPrimaryKey);
    t = String(t || '').trim();

    // Hard sanitize: remove any embedded DEFAULT / AUTO_INCREMENT / NULL tokens from type string.
    t = t
      .replace(/\bDEFAULT\b[\s\S]*$/i, '')
      .replace(/\bAUTO_INCREMENT\b/gi, '')
      .replace(/\bNOT\s+NULL\b/gi, '')
      .replace(/\bNULL\b/gi, '')
      .trim();

    // Normalize INTEGER → INT
    t = t.replace(/\bINTEGER\b/gi, 'INT');

    // Enforce known allowed type families for this PoC generator.
    // If it doesn't match, fall back based on column.dataType.
    const upper = t.toUpperCase();
    const allowed =
      upper.startsWith('INT') ||
      upper.startsWith('BIGINT') ||
      upper.startsWith('DECIMAL') ||
      upper.startsWith('VARCHAR') ||
      upper === 'DATE' ||
      upper === 'DATETIME' ||
      upper === 'TIMESTAMP' ||
      upper === 'BOOLEAN' ||
      upper.startsWith('TINYINT');

    if (!allowed) {
      t = mapToMySQLType(column?.dataType, column?.isPrimaryKey);
      t = String(t).replace(/\bINTEGER\b/gi, 'INT').trim();
    }

    // Primary key id should be INT
    if (column?.isPrimaryKey) {
      return 'INT';
    }

    // Foreign keys should be INT unless metadata indicates BIGINT
    if (column?.isForeignKey) {
      if (String(column?.dataType || '').toUpperCase().includes('BIGINT')) return 'BIGINT';
      return 'INT';
    }

    return t;
  }

  shouldBeNotNull(column, cleanName) {
    if (column.isPrimaryKey) return true;
    if (column.isForeignKey) return true;

    const n = cleanName.toLowerCase();
    // Required attributes per checklist / typical PDM
    if (n === 'name') return true;
    if (n === 'email') return true;
    if (n === 'order_date') return true;
    if (n === 'total') return true;
    if (n === 'price') return true;
    if (n === 'quantity') return true;

    return column.isNullable === false;
  }

  getDefaultClause(cleanName, physicalType) {
    const n = cleanName.toLowerCase();
    const t = String(physicalType).toUpperCase();

    // Only the defaults required by checklist:
    if (n === 'created_at') return 'DEFAULT CURRENT_TIMESTAMP';
    if (n === 'updated_at') return 'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP';
    if (n === 'order_date' && t === 'DATE') return 'DEFAULT (CURRENT_DATE)';
    return null;
  }

  getCheckExpression(cleanName) {
    const n = cleanName.toLowerCase();
    if (n === 'quantity') return `${this.q(cleanName)} > 0`;
    if (n === 'price') return `${this.q(cleanName)} >= 0`;
    if (n === 'total') return `${this.q(cleanName)} >= 0`;
    return null;
  }

  generateColumnDefinition(column) {
    const cleanName = this.cleanIdentifier(column.name);
    const type = this.getPhysicalType(column);

    const parts = [this.q(cleanName), type];

    // NOT NULL
    if (this.shouldBeNotNull(column, cleanName)) parts.push('NOT NULL');

    // UNIQUE — only enforce email uniqueness by default
    if (!column.isPrimaryKey && cleanName.toLowerCase() === 'email') {
      parts.push('UNIQUE');
    }

    // AUTO_INCREMENT — only for integer PKs
    if (column.isPrimaryKey) {
      parts.push('AUTO_INCREMENT');
    }

    // DEFAULT — limited to safe ones
    const def = this.getDefaultClause(cleanName, type);
    if (def) parts.push(def);

    // CHECK constraints
    const checkExpr = this.getCheckExpression(cleanName);
    if (checkExpr) parts.push(`CHECK (${checkExpr})`);

    return parts.join(' ');
  }

  ensureTimestampColumns(table) {
    const existing = new Set(table.columns.map(c => this.cleanIdentifier(c.name).toLowerCase()));
    if (!existing.has('created_at')) {
      table.addColumn(
        // eslint-disable-next-line no-new
        new (table.columns[0].constructor)({
          name: 'created_at',
          dataType: 'TIMESTAMP',
          isPrimaryKey: false,
          isForeignKey: false,
          isNullable: false,
          isUnique: false,
          defaultValue: 'CURRENT_TIMESTAMP'
        })
      );
    }
    if (!existing.has('updated_at')) {
      table.addColumn(
        // eslint-disable-next-line no-new
        new (table.columns[0].constructor)({
          name: 'updated_at',
          dataType: 'TIMESTAMP',
          isPrimaryKey: false,
          isForeignKey: false,
          isNullable: false,
          isUnique: false,
          defaultValue: 'CURRENT_TIMESTAMP'
        })
      );
    }
  }

  generateCreateTable(table) {
    const cleanTableName = this.cleanIdentifier(table.name);

    // Add timestamps (PDM requirement)
    this.ensureTimestampColumns(table);

    const lines = [`CREATE TABLE ${this.q(cleanTableName)} (`];
    const defs = [];

    for (const col of table.columns) {
      defs.push(`  ${this.generateColumnDefinition(col)}`);
    }

    // PK constraint
    const pkCols = table.primaryKeys.map(pk => this.q(this.cleanIdentifier(pk.name)));
    if (pkCols.length > 0) {
      defs.push(`  PRIMARY KEY (${pkCols.join(', ')})`);
    }

    lines.push(defs.join(',\n'));
    lines.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
    return lines.join('\n');
  }

  generateForeignKeys(table) {
    const statements = [];
    const cleanTableName = this.cleanIdentifier(table.name);

    for (const fkCol of table.foreignKeys) {
      if (!fkCol.referencesTable || !fkCol.referencesColumn) continue;

      const fkName = `fk_${cleanTableName}_${this.cleanIdentifier(fkCol.name)}`;
      const fromCol = this.q(this.cleanIdentifier(fkCol.name));
      const refTable = this.q(this.cleanIdentifier(fkCol.referencesTable));
      const refCol = this.q(this.cleanIdentifier(fkCol.referencesColumn));

      // ON DELETE / ON UPDATE rules per checklist
      // - customer -> order: RESTRICT
      // - order -> order_item: CASCADE
      // - product -> order_item: CASCADE
      const tableLower = cleanTableName.toLowerCase();
      const deleteAction =
        tableLower.includes('order_item') || tableLower.includes('orderitem') || tableLower.includes('item')
          ? 'CASCADE'
          : 'RESTRICT';

      const stmt =
        `ALTER TABLE ${this.q(cleanTableName)} ` +
        `ADD CONSTRAINT ${this.q(fkName)} ` +
        `FOREIGN KEY (${fromCol}) REFERENCES ${refTable}(${refCol}) ` +
        `ON DELETE ${deleteAction} ON UPDATE CASCADE;`;

      statements.push(stmt);
    }

    return statements.join('\n');
  }

  generateIndexes(table) {
    const idx = [];
    const cleanTableName = this.cleanIdentifier(table.name);

    // Index foreign keys
    for (const fkCol of table.foreignKeys) {
      const colName = this.cleanIdentifier(fkCol.name);
      const idxName = `idx_${cleanTableName}_${colName}`;
      idx.push(`CREATE INDEX ${this.q(idxName)} ON ${this.q(cleanTableName)} (${this.q(colName)});`);
    }

    // Index unique email explicitly (even though MySQL creates one for UNIQUE)
    const emailCol = table.columns.find(c => this.cleanIdentifier(c.name).toLowerCase() === 'email');
    if (emailCol) {
      const idxName = `uk_${cleanTableName}_email`;
      idx.push(`CREATE UNIQUE INDEX ${this.q(idxName)} ON ${this.q(cleanTableName)} (${this.q('email')});`);
    }

    return idx;
  }

  async save(filename = 'mysql.sql') {
    const ddl = this.generateDDL();
    const outPath = path.join(this.outputDir, filename);
    await writeFile(outPath, ddl, 'utf-8');
    this.logger.info({ filePath: outPath }, 'MySQL DDL saved successfully');
    return outPath;
  }
}



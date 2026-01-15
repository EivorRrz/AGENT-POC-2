"""MySQL DDL Generator"""
from typing import List
from .base import SQLGenerator
from .type_mapper import map_to_mysql_type
from ..models.metadata import Table, Column

class MySQLGenerator(SQLGenerator):
    """MySQL-specific SQL DDL generator"""
    
    def map_type(self, generic_type: str) -> str:
        """Map generic type to MySQL type"""
        return map_to_mysql_type(generic_type)
    
    def _generate_create_table(self, table: Table) -> str:
        """Generate MySQL CREATE TABLE statement"""
        lines = [f"CREATE TABLE {self._sanitize_name(table.name)} ("]
        
        # Column definitions
        col_defs = []
        for col in table.columns:
            col_def = self._generate_column_definition(col)
            col_defs.append(f"    {col_def}")
        
        # Primary key constraint
        if table.primary_keys:
            pk_cols = [self._sanitize_name(pk.name) for pk in table.primary_keys]
            pk_constraint = f"    PRIMARY KEY ({', '.join(pk_cols)})"
            col_defs.append(pk_constraint)
        
        lines.append(",\n".join(col_defs))
        lines.append(") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;")
        
        return "\n".join(lines)
    
    def _generate_column_definition(self, column: Column) -> str:
        """Generate column definition"""
        parts = [
            self._sanitize_name(column.name),
            self.map_type(column.data_type)
        ]
        
        # AUTO_INCREMENT for PKs
        if column.is_primary_key and column.data_type.upper() in ['INTEGER', 'INT', 'BIGINT']:
            parts.append("AUTO_INCREMENT")
        
        # NOT NULL
        if not column.is_nullable:
            parts.append("NOT NULL")
        
        # UNIQUE
        if column.is_unique:
            parts.append("UNIQUE")
        
        # DEFAULT
        if column.default_value:
            parts.append(f"DEFAULT {column.default_value}")
        
        return " ".join(parts)
    
    def _generate_foreign_keys(self, table: Table) -> List[str]:
        """Generate ALTER TABLE for foreign keys"""
        statements = []
        
        for idx, fk_col in enumerate(table.foreign_keys, 1):
            if not fk_col.references_table or not fk_col.references_column:
                continue
            
            fk_name = f"fk_{self._sanitize_name(table.name)}_{idx}"
            stmt = (
                f"ALTER TABLE {self._sanitize_name(table.name)} "
                f"ADD CONSTRAINT {fk_name} "
                f"FOREIGN KEY ({self._sanitize_name(fk_col.name)}) "
                f"REFERENCES {self._sanitize_name(fk_col.references_table)}"
                f"({self._sanitize_name(fk_col.references_column)}) "
                f"ON DELETE CASCADE ON UPDATE CASCADE;"
            )
            statements.append(stmt)
        
        return statements
    
    def _generate_indexes(self, table: Table) -> List[str]:
        """Generate CREATE INDEX statements"""
        statements = []
        
        for fk_col in table.foreign_keys:
            idx_name = f"idx_{self._sanitize_name(table.name)}_{self._sanitize_name(fk_col.name)}"
            stmt = f"CREATE INDEX {idx_name} ON {self._sanitize_name(table.name)}({self._sanitize_name(fk_col.name)});"
            statements.append(stmt)
        
        return statements


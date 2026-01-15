"""Physical ERD Generator for MySQL"""
from pathlib import Path
from typing import Dict
from ..models.metadata import Metadata, Table, Column
from ..generators.type_mapper import map_to_mysql_type
from ..utils.logger import get_logger

logger = get_logger(__name__)

class PhysicalERDGenerator:
    """Generate MySQL physical ERD in Mermaid format"""
    
    def __init__(self, metadata: Metadata, output_dir: Path):
        self.metadata = metadata
        self.output_dir = output_dir
        self.logger = logger
    
    def generate_mermaid(self) -> str:
        """Generate Mermaid ERD syntax"""
        self.logger.info("Generating MySQL physical ERD...")
        
        mermaid = "erDiagram\n\n"
        
        # Generate entities
        for table_name, table in self.metadata.tables.items():
            mermaid += self._generate_entity(table)
        
        # Generate relationships
        for table_name, table in self.metadata.tables.items():
            mermaid += self._generate_relationships(table)
        
        return mermaid
    
    def _generate_entity(self, table: Table) -> str:
        """Generate entity definition"""
        entity_name = self._sanitize_name(table.name)
        mermaid = f"    {entity_name} {{\n"
        
        for col in table.columns:
            col_line = self._generate_column_line(col)
            mermaid += f"        {col_line}\n"
        
        mermaid += "    }\n\n"
        return mermaid
    
    def _generate_column_line(self, col: Column) -> str:
        """Generate column line with MySQL types"""
        # MySQL-specific type
        mysql_type = map_to_mysql_type(col.data_type)
        mysql_type_clean = mysql_type.replace('(', '_').replace(')', '').replace(',', '_')
        
        # Column name
        col_name = self._sanitize_name(col.name)
        
        # Key markers
        key = ""
        if col.is_primary_key:
            key = " PK"
        elif col.is_foreign_key:
            key = " FK"
        
        # Constraints
        constraints = []
        if col.is_primary_key and col.data_type.upper() in ['INTEGER', 'INT', 'BIGINT']:
            constraints.append("AUTO_INCREMENT")
        if not col.is_nullable:
            constraints.append("NOT NULL")
        if col.is_unique:
            constraints.append("UNIQUE")
        if col.default_value:
            constraints.append(f"DEFAULT {col.default_value}")
        if col.is_foreign_key:
            constraints.append("INDEX")
        
        constraint_str = f" \"{', '.join(constraints)}\"" if constraints else ""
        
        return f"{mysql_type_clean} {col_name}{key}{constraint_str}"
    
    def _generate_relationships(self, table: Table) -> str:
        """Generate relationships"""
        mermaid = ""
        
        for fk_col in table.foreign_keys:
            if not fk_col.references_table:
                continue
            
            from_table = self._sanitize_name(fk_col.references_table)
            to_table = self._sanitize_name(table.name)
            
            # One-to-many relationship
            mermaid += f"    {from_table} ||--o{{ {to_table} : \"FK, ON DELETE CASCADE\"\n"
        
        return mermaid
    
    def _sanitize_name(self, name: str) -> str:
        """Sanitize name for Mermaid"""
        return ''.join(c if c.isalnum() or c == '_' else '_' for c in name).upper()
    
    def save_mermaid(self, filename: str = "erd_mysql.mmd") -> Path:
        """Save Mermaid source"""
        mermaid_content = self.generate_mermaid()
        output_path = self.output_dir / filename
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(mermaid_content, encoding='utf-8')
        
        self.logger.info(f"✓ Saved Mermaid: {output_path}")
        return output_path


"""Data Type Mapping"""
from typing import Dict

# Generic to MySQL type mapping
MYSQL_TYPE_MAP: Dict[str, str] = {
    'INTEGER': 'INT',
    'INT': 'INT',
    'BIGINT': 'BIGINT',
    'SMALLINT': 'SMALLINT',
    'VARCHAR': 'VARCHAR(255)',
    'TEXT': 'TEXT',
    'CHAR': 'CHAR',
    'BOOLEAN': 'BOOLEAN',
    'BOOL': 'BOOLEAN',
    'DATE': 'DATE',
    'TIMESTAMP': 'TIMESTAMP',
    'DATETIME': 'DATETIME',
    'DECIMAL': 'DECIMAL(18,2)',
    'NUMERIC': 'DECIMAL(18,2)',
    'FLOAT': 'FLOAT',
    'DOUBLE': 'DOUBLE',
    'JSON': 'JSON',
}

def map_to_mysql_type(generic_type: str) -> str:
    """Map generic type to MySQL type"""
    return MYSQL_TYPE_MAP.get(generic_type.upper(), 'VARCHAR(255)')


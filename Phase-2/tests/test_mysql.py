"""Tests for MySQL Generator"""
import pytest
from pathlib import Path
from src.models.metadata import Metadata, Table, Column
from src.generators.mysql_generator import MySQLGenerator
from src.generators.type_mapper import map_to_mysql_type

def test_type_mapping():
    """Test generic to MySQL type mapping"""
    assert map_to_mysql_type('INTEGER') == 'INT'
    assert map_to_mysql_type('VARCHAR') == 'VARCHAR(255)'
    assert map_to_mysql_type('DECIMAL') == 'DECIMAL(18,2)'
    assert map_to_mysql_type('TIMESTAMP') == 'TIMESTAMP'

def test_mysql_generator_basic():
    """Test basic MySQL DDL generation"""
    # Create test metadata
    metadata = Metadata(file_id='test123')
    
    # Create test table
    table = Table(name='customers')
    table.columns = [
        Column(
            name='id',
            data_type='INTEGER',
            is_primary_key=True,
            is_nullable=False
        ),
        Column(
            name='name',
            data_type='VARCHAR',
            is_nullable=False
        ),
        Column(
            name='email',
            data_type='VARCHAR',
            is_unique=True
        )
    ]
    
    metadata.tables['customers'] = table
    
    # Generate DDL
    generator = MySQLGenerator(metadata, Path('/tmp'))
    ddl = generator.generate_ddl()
    
    # Assertions
    assert 'CREATE TABLE customers' in ddl
    assert 'INT' in ddl
    assert 'AUTO_INCREMENT' in ddl
    assert 'PRIMARY KEY' in ddl
    assert 'ENGINE=InnoDB' in ddl

def test_foreign_key_generation():
    """Test foreign key generation"""
    metadata = Metadata(file_id='test123')
    
    # Parent table
    parent = Table(name='customers')
    parent.columns = [
        Column(name='id', data_type='INTEGER', is_primary_key=True)
    ]
    metadata.tables['customers'] = parent
    
    # Child table with FK
    child = Table(name='orders')
    child.columns = [
        Column(name='id', data_type='INTEGER', is_primary_key=True),
        Column(
            name='customer_id',
            data_type='INTEGER',
            is_foreign_key=True,
            references_table='customers',
            references_column='id'
        )
    ]
    metadata.tables['orders'] = child
    
    # Generate DDL
    generator = MySQLGenerator(metadata, Path('/tmp'))
    ddl = generator.generate_ddl()
    
    # Assertions
    assert 'FOREIGN KEY' in ddl
    assert 'REFERENCES customers' in ddl
    assert 'ON DELETE CASCADE' in ddl

if __name__ == '__main__':
    pytest.main([__file__, '-v'])


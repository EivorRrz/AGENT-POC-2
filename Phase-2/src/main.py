"""Main Entry Point for Phase-2"""
import sys
import json
from pathlib import Path
from rich.console import Console
from rich.table import Table as RichTable

from .config import config
from .models.metadata import Metadata, Table, Column
from .generators.mysql_generator import MySQLGenerator
from .erd.physical_erd import PhysicalERDGenerator
from .erd.renderer import render_mermaid
from .utils.logger import setup_logging, get_logger
from .utils.file_utils import read_json

console = Console()
logger = get_logger(__name__)

def load_metadata(file_id: str) -> Metadata:
    """Load metadata from Phase-1"""
    metadata_path = config.PHASE1_ARTIFACTS_DIR / file_id / "metadata.json"
    
    if not metadata_path.exists():
        raise FileNotFoundError(f"Metadata not found: {metadata_path}")
    
    logger.info(f"Loading metadata from: {metadata_path}")
    raw_data = read_json(metadata_path)
    
    # Parse into structured model
    metadata = Metadata(file_id=file_id)
    tables_data = raw_data.get('metadata', {}).get('tables', {})
    
    for table_name, table_info in tables_data.items():
        table = Table(name=table_name, description=table_info.get('description'))
        
        for col_data in table_info.get('columns', []):
            column = Column(
                name=col_data['columnName'],
                data_type=col_data.get('dataType', 'VARCHAR'),
                is_primary_key=col_data.get('isPrimaryKey', False),
                is_foreign_key=col_data.get('isForeignKey', False),
                is_nullable=col_data.get('nullable', True),
                is_unique=col_data.get('isUnique', False),
                default_value=col_data.get('defaultValue'),
                references_table=col_data.get('referencesTable'),
                references_column=col_data.get('referencesColumn'),
                description=col_data.get('description')
            )
            table.columns.append(column)
        
        metadata.tables[table_name] = table
    
    logger.info(f"✓ Loaded {len(metadata.tables)} tables, {metadata.total_columns} columns")
    return metadata

def generate_physical_model(file_id: str):
    """Generate MySQL physical model"""
    console.print(f"\n[bold cyan]Phase-2: MySQL Physical Model Generator[/bold cyan]")
    console.print(f"File ID: {file_id}\n")
    
    # Load metadata
    metadata = load_metadata(file_id)
    output_dir = config.PHASE1_ARTIFACTS_DIR / file_id
    
    results = {}
    
    # Generate MySQL SQL DDL
    if config.GENERATE_SQL:
        console.print("[yellow]Generating MySQL DDL...[/yellow]")
        mysql_gen = MySQLGenerator(metadata, output_dir)
        sql_path = mysql_gen.save('mysql.sql')
        results['mysql_sql'] = str(sql_path)
        console.print(f"[green]✓[/green] Saved: {sql_path.name}")
    
    # Generate Physical ERD
    if config.GENERATE_ERD:
        console.print("\n[yellow]Generating MySQL Physical ERD...[/yellow]")
        erd_gen = PhysicalERDGenerator(metadata, output_dir)
        
        # Save Mermaid source
        mermaid_path = erd_gen.save_mermaid()
        results['erd_mermaid'] = str(mermaid_path)
        console.print(f"[green]✓[/green] Saved: {mermaid_path.name}")
        
        # Render to images
        mermaid_content = mermaid_path.read_text(encoding='utf-8')
        image_results = render_mermaid(output_dir, mermaid_content)
        
        for format_type, path in image_results.items():
            results[f'erd_{format_type}'] = str(path)
            console.print(f"[green]✓[/green] Saved: {path.name}")
    
    # Summary table
    console.print("\n[bold green]✓ Phase-2 Complete![/bold green]\n")
    
    summary = RichTable(title="Generated Artifacts")
    summary.add_column("Type", style="cyan")
    summary.add_column("File", style="white")
    
    for key, path in results.items():
        summary.add_row(key, Path(path).name)
    
    console.print(summary)
    
    return results

def main():
    """CLI Entry Point"""
    setup_logging()
    
    if len(sys.argv) < 2:
        console.print("[red]Error: Missing file ID[/red]")
        console.print("\nUsage: python -m src.main <fileId>")
        console.print("Example: python -m src.main 1768458755700")
        sys.exit(1)
    
    file_id = sys.argv[1]
    
    try:
        generate_physical_model(file_id)
        sys.exit(0)
    except Exception as e:
        logger.error(f"Generation failed: {e}", exc_info=True)
        console.print(f"\n[bold red]✗ Error:[/bold red] {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()


"""Render Mermaid to Images"""
import asyncio
from pathlib import Path
from pyppeteer import launch
from ..config import config
from ..utils.logger import get_logger

logger = get_logger(__name__)

class MermaidRenderer:
    """Render Mermaid diagrams to PNG/SVG/PDF"""
    
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.logger = logger
    
    async def render_to_images(self, mermaid_content: str, base_name: str = "erd_mysql"):
        """Render Mermaid to PNG, SVG, PDF"""
        self.logger.info("Rendering ERD images...")
        
        browser = None
        try:
            # Launch browser
            launch_options = {
                'headless': True,
                'args': ['--no-sandbox', '--disable-setuid-sandbox']
            }
            
            if config.PUPPETEER_EXECUTABLE_PATH:
                launch_options['executablePath'] = config.PUPPETEER_EXECUTABLE_PATH
            
            browser = await launch(launch_options)
            page = await browser.newPage()
            
            # Create HTML with Mermaid
            html_content = self._create_html(mermaid_content)
            await page.setContent(html_content)
            await page.waitForSelector('#mermaid-diagram')
            
            # Wait for Mermaid to render
            await asyncio.sleep(2)
            
            # Get diagram element
            diagram = await page.querySelector('#mermaid-diagram')
            
            results = {}
            
            # Render PNG
            if 'png' in config.ERD_FORMATS:
                png_path = self.output_dir / f"{base_name}.png"
                await diagram.screenshot({'path': str(png_path)})
                results['png'] = png_path
                self.logger.info(f"✓ Saved PNG: {png_path}")
            
            # Render PDF
            if 'pdf' in config.ERD_FORMATS:
                pdf_path = self.output_dir / f"{base_name}.pdf"
                await page.pdf({'path': str(pdf_path), 'format': 'A4'})
                results['pdf'] = pdf_path
                self.logger.info(f"✓ Saved PDF: {pdf_path}")
            
            # SVG (get from page)
            if 'svg' in config.ERD_FORMATS:
                svg_content = await page.evaluate('''() => {
                    const svg = document.querySelector('#mermaid-diagram svg');
                    return svg ? svg.outerHTML : null;
                }''')
                
                if svg_content:
                    svg_path = self.output_dir / f"{base_name}.svg"
                    svg_path.write_text(svg_content, encoding='utf-8')
                    results['svg'] = svg_path
                    self.logger.info(f"✓ Saved SVG: {svg_path}")
            
            return results
            
        except Exception as e:
            self.logger.error(f"Rendering failed: {e}")
            raise
        finally:
            if browser:
                await browser.close()
    
    def _create_html(self, mermaid_content: str) -> str:
        """Create HTML with Mermaid"""
        return f"""
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script>
        mermaid.initialize({{ startOnLoad: true, theme: 'default' }});
    </script>
    <style>
        body {{ margin: 20px; background: white; }}
        #mermaid-diagram {{ display: inline-block; }}
    </style>
</head>
<body>
    <div id="mermaid-diagram" class="mermaid">
{mermaid_content}
    </div>
</body>
</html>
"""

def render_mermaid(output_dir: Path, mermaid_content: str, base_name: str = "erd_mysql"):
    """Sync wrapper for async rendering"""
    renderer = MermaidRenderer(output_dir)
    return asyncio.get_event_loop().run_until_complete(
        renderer.render_to_images(mermaid_content, base_name)
    )


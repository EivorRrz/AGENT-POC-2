/**
 * Interactive HTML ERD Generator
 * Creates zoomable, filterable, searchable HTML viewer
 * Perfect for large schemas (30+ tables, 500+ columns)
 */

import path from 'path';
import { writeFile } from '../utils/fileUtils.js';
import logger from '../utils/logger.js';

export class InteractiveHTMLGenerator {
    constructor(metadata, outputDir) {
        this.metadata = metadata;
        this.outputDir = outputDir;
    }

    generate() {
        const tables = Array.from(this.metadata.tables.values());
        const relationships = this.extractRelationships(tables);
        
        return this.createHTML(tables, relationships);
    }

    extractRelationships(tables) {
        const relationships = [];
        
        for (const table of tables) {
            for (const col of table.columns) {
                if (col.isForeignKey && col.referencesTable) {
                    relationships.push({
                        from: col.referencesTable,
                        to: table.name,
                        fromCol: col.referencesColumn || 'id',
                        toCol: col.name
                    });
                }
            }
        }
        
        return relationships;
    }

    createHTML(tables, relationships) {
        const tablesJSON = JSON.stringify(tables.map(t => ({
            name: t.name,
            columns: t.columns.map(c => ({
                name: c.name,
                type: c.dataType,
                isPK: c.isPrimaryKey,
                isFK: c.isForeignKey,
                nullable: c.isNullable,
                unique: c.isUnique,
                refTable: c.referencesTable,
                refCol: c.referencesColumn
            }))
        })));

        const relationshipsJSON = JSON.stringify(relationships);

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Physical Model - ${this.metadata.tableCount} Tables Interactive Viewer</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            overflow: hidden;
        }
        #header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #header h1 { font-size: 20px; font-weight: 600; }
        #stats {
            display: flex;
            gap: 20px;
            font-size: 14px;
        }
        .stat { background: rgba(255,255,255,0.2); padding: 5px 15px; border-radius: 20px; }
        #controls {
            background: white;
            padding: 15px 20px;
            border-bottom: 1px solid #ddd;
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
        }
        #search {
            flex: 1;
            min-width: 200px;
            padding: 8px 15px;
            border: 2px solid #667eea;
            border-radius: 5px;
            font-size: 14px;
        }
        .btn {
            padding: 8px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s;
        }
        .btn-primary {
            background: #667eea;
            color: white;
        }
        .btn-primary:hover {
            background: #5568d3;
            transform: translateY(-2px);
        }
        .btn-secondary {
            background: #f0f0f0;
            color: #333;
        }
        #canvas-container {
            position: relative;
            width: 100%;
            height: calc(100vh - 120px);
            overflow: hidden;
            background: white;
            cursor: grab;
        }
        #canvas-container.grabbing { cursor: grabbing; }
        #canvas {
            position: absolute;
            top: 50%;
            left: 50%;
            transform-origin: 0 0;
        }
        .table-box {
            position: absolute;
            background: white;
            border: 2px solid #667eea;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            min-width: 250px;
            transition: all 0.3s;
        }
        .table-box:hover {
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
            transform: translateY(-5px);
            z-index: 100;
        }
        .table-box.highlighted {
            border-color: #f59e0b;
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
        }
        .table-header {
            background: #667eea;
            color: white;
            padding: 10px 15px;
            font-weight: 600;
            border-radius: 6px 6px 0 0;
            cursor: move;
        }
        .table-body {
            max-height: 400px;
            overflow-y: auto;
        }
        .column-row {
            padding: 8px 15px;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
        }
        .column-row:last-child { border-bottom: none; }
        .column-row:hover { background: #f8f9ff; }
        .column-name { font-weight: 500; color: #333; }
        .column-type { color: #666; font-size: 12px; }
        .badge {
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: 600;
            margin-left: 5px;
        }
        .badge-pk { background: #10b981; color: white; }
        .badge-fk { background: #f59e0b; color: white; }
        .badge-unique { background: #8b5cf6; color: white; }
        svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
        .relationship-line { stroke: #667eea; stroke-width: 2; fill: none; opacity: 0.6; }
        #zoom-indicator {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: white;
            padding: 10px 15px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            font-size: 14px;
            font-weight: 600;
            color: #667eea;
        }
        #instructions {
            position: absolute;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.1);
            font-size: 13px;
            max-width: 250px;
        }
        #instructions h3 { margin-bottom: 10px; color: #667eea; font-size: 14px; }
        #instructions ul { list-style: none; padding-left: 0; }
        #instructions li { padding: 5px 0; }
        #instructions li:before { content: "→ "; color: #667eea; font-weight: bold; }
    </style>
</head>
<body>
    <div id="header">
        <h1>🎯 Physical Model Interactive Viewer</h1>
        <div id="stats">
            <div class="stat">📊 ${this.metadata.tableCount} Tables</div>
            <div class="stat">📋 ${this.metadata.totalColumns} Columns</div>
            <div class="stat">🔗 ${relationships.length} Relationships</div>
        </div>
    </div>
    
    <div id="controls">
        <input type="text" id="search" placeholder="🔍 Search tables or columns..." />
        <button class="btn btn-primary" onclick="resetView()">Reset View</button>
        <button class="btn btn-secondary" onclick="toggleInstructions()">Help</button>
    </div>
    
    <div id="canvas-container">
        <svg id="svg-layer"></svg>
        <div id="canvas"></div>
        <div id="zoom-indicator">Zoom: 100%</div>
        <div id="instructions" style="display: none;">
            <h3>📖 Controls</h3>
            <ul>
                <li>Mouse Wheel: Zoom</li>
                <li>Click + Drag: Pan</li>
                <li>Search: Filter tables</li>
                <li>Hover: Highlight</li>
                <li>Click table: Show details</li>
            </ul>
        </div>
    </div>

    <script>
        const tables = ${tablesJSON};
        const relationships = ${relationshipsJSON};
        
        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let isDragging = false;
        let lastX, lastY;
        
        const container = document.getElementById('canvas-container');
        const canvas = document.getElementById('canvas');
        const svgLayer = document.getElementById('svg-layer');
        const searchInput = document.getElementById('search');
        
        function renderTables() {
            canvas.innerHTML = '';
            const cols = Math.ceil(Math.sqrt(tables.length));
            const spacing = 300;
            
            tables.forEach((table, idx) => {
                const row = Math.floor(idx / cols);
                const col = idx % cols;
                const x = col * spacing;
                const y = row * spacing;
                
                const tableEl = document.createElement('div');
                tableEl.className = 'table-box';
                tableEl.style.left = x + 'px';
                tableEl.style.top = y + 'px';
                tableEl.dataset.tableName = table.name;
                
                let columnsHTML = table.columns.map(col => {
                    const badges = [];
                    if (col.isPK) badges.push('<span class="badge badge-pk">PK</span>');
                    if (col.isFK) badges.push('<span class="badge badge-fk">FK</span>');
                    if (col.unique) badges.push('<span class="badge badge-unique">UQ</span>');
                    
                    return \`
                        <div class="column-row">
                            <div>
                                <span class="column-name">\${col.name}</span>
                                \${badges.join('')}
                            </div>
                            <span class="column-type">\${col.type}</span>
                        </div>
                    \`;
                }).join('');
                
                tableEl.innerHTML = \`
                    <div class="table-header">\${table.name}</div>
                    <div class="table-body">\${columnsHTML}</div>
                \`;
                
                canvas.appendChild(tableEl);
            });
            
            drawRelationships();
            centerView();
        }
        
        function drawRelationships() {
            svgLayer.innerHTML = '';
            relationships.forEach(rel => {
                const fromEl = document.querySelector(\`[data-table-name="\${rel.from}"]\`);
                const toEl = document.querySelector(\`[data-table-name="\${rel.to}"]\`);
                
                if (fromEl && toEl) {
                    const fromRect = fromEl.getBoundingClientRect();
                    const toRect = toEl.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();
                    
                    const x1 = (fromRect.left + fromRect.width/2 - containerRect.left) / scale - translateX;
                    const y1 = (fromRect.top + fromRect.height/2 - containerRect.top) / scale - translateY;
                    const x2 = (toRect.left + toRect.width/2 - containerRect.left) / scale - translateX;
                    const y2 = (toRect.top + toRect.height/2 - containerRect.top) / scale - translateY;
                    
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('class', 'relationship-line');
                    path.setAttribute('d', \`M \${x1} \${y1} L \${x2} \${y2}\`);
                    svgLayer.appendChild(path);
                }
            });
        }
        
        function centerView() {
            const canvasRect = canvas.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            translateX = (containerRect.width - canvasRect.width * scale) / 2;
            translateY = (containerRect.height - canvasRect.height * scale) / 2;
            updateTransform();
        }
        
        function updateTransform() {
            canvas.style.transform = \`translate(\${translateX}px, \${translateY}px) scale(\${scale})\`;
            document.getElementById('zoom-indicator').textContent = \`Zoom: \${Math.round(scale * 100)}%\`;
            drawRelationships();
        }
        
        function resetView() {
            scale = 1;
            centerView();
        }
        
        function toggleInstructions() {
            const el = document.getElementById('instructions');
            el.style.display = el.style.display === 'none' ? 'block' : 'none';
        }
        
        // Zoom
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            scale *= delta;
            scale = Math.max(0.1, Math.min(scale, 3));
            updateTransform();
        });
        
        // Pan
        container.addEventListener('mousedown', (e) => {
            if (e.target === container || e.target === canvas) {
                isDragging = true;
                lastX = e.clientX;
                lastY = e.clientY;
                container.classList.add('grabbing');
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                translateX += e.clientX - lastX;
                translateY += e.clientY - lastY;
                lastX = e.clientX;
                lastY = e.clientY;
                updateTransform();
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            container.classList.remove('grabbing');
        });
        
        // Search
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.table-box').forEach(box => {
                const tableName = box.dataset.tableName.toLowerCase();
                const text = box.textContent.toLowerCase();
                if (tableName.includes(query) || text.includes(query)) {
                    box.style.display = 'block';
                    box.classList.add('highlighted');
                } else {
                    box.style.display = query ? 'none' : 'block';
                    box.classList.remove('highlighted');
                }
            });
        });
        
        // Initialize
        renderTables();
    </script>
</body>
</html>`;
    }

    async save(fileName = 'erd_INTERACTIVE.html') {
        const html = this.generate();
        const filePath = path.join(this.outputDir, fileName);
        await writeFile(filePath, html);
        
        logger.info({ filePath }, 'Interactive HTML ERD saved');
        return filePath;
    }
}


/**
 * schematic.js — Journal de Tir PLB
 * SVG schematic drawing generator for BANQUETTE and TUNNEL zones
 */

export function generateSchematic(ext, formData) {
  if (!ext || (!ext.totalTrous && !ext.trousMasse)) {
    return null;
  }

  const zone = ext.zone || formData?.zoneType || 'BANQUETTE';
  if (zone === 'TUNNEL') {
    return renderTunnelSchematic(ext, formData);
  } else {
    return renderBanquetteSchematic(ext, formData);
  }
}

export function renderBanquetteSchematic(ext, formData) {
  const W = 800, H = 560;
  const masse = ext.trousMasse || 68;
  const bouchon = ext.trousBouchon || 13;
  const tampon = ext.trousTampon || 40;
  const total = masse + bouchon + tampon;
  const esp = ext.espacement || 1.1;
  const fard = ext.fardeau || 1.1;
  const longueur = ext.longueur || 15;
  const largeur = ext.largeur || 11;

  const margin = 60;
  const drawW = W - margin*2;
  const drawH = H - margin*2 - 60;
  const scale = Math.min(drawW / longueur, drawH / largeur);
  const drawActualW = longueur * scale;
  const drawActualH = largeur * scale;
  const offX = margin + (drawW - drawActualW) / 2;
  const offY = margin + 30 + (drawH - drawActualH) / 2;

  let content = '';

  // Border
  content += `<rect x="${offX}" y="${offY}" width="${drawActualW}" height="${drawActualH}" fill="none" stroke="#2d3148" stroke-width="1" rx="4"/>`;

  // Grid lines
  const gridSpX = scale * esp;
  const gridSpY = scale * fard;
  for (let x = gridSpX/2; x < drawActualW; x += gridSpX) {
    content += `<line x1="${offX+x}" y1="${offY}" x2="${offX+x}" y2="${offY+drawActualH}" stroke="#1e2130" stroke-width="0.5"/>`;
  }
  for (let y = gridSpY/2; y < drawActualH; y += gridSpY) {
    content += `<line x1="${offX}" y1="${offY+y}" x2="${offX+drawActualW}" y2="${offY+y}" stroke="#1e2130" stroke-width="0.5"/>`;
  }

  // Hole positions
  const cols = Math.round(longueur / esp);
  const rows_mass = Math.ceil(masse / cols);
  const rows_bouchon = Math.max(1, Math.ceil(bouchon / 4));
  const rows_tampon = Math.max(1, Math.ceil(tampon / cols));
  const holR = Math.max(4, Math.min(9, scale * 0.18));

  // Tampon holes (top)
  const tampArr = [];
  for (let r = 0; r < rows_tampon && tampArr.length < tampon; r++) {
    const rowCols = Math.min(cols, tampon - tampArr.length);
    for (let c = 0; c < rowCols; c++) {
      const px = offX + (c + 0.5) * (drawActualW / rowCols);
      const py = offY + (r + 0.5) * gridSpY;
      tampArr.push([px, py]);
    }
  }
  tampArr.forEach(([px, py]) => {
    content += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${holR}" fill="#e67e22" opacity="0.85"/>`;
    content += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${holR}" fill="none" stroke="#f39c12" stroke-width="1"/>`;
  });

  // Mass holes (middle)
  const massArr = [];
  const massStartY = offY + rows_tampon * gridSpY;
  for (let r = 0; r < rows_mass && massArr.length < masse; r++) {
    const rowCols = Math.min(cols, masse - massArr.length);
    for (let c = 0; c < rowCols; c++) {
      const px = offX + (c + 0.5) * (drawActualW / rowCols);
      const py = massStartY + (r + 0.5) * gridSpY;
      massArr.push([px, py]);
    }
  }
  massArr.forEach(([px, py]) => {
    content += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${holR}" fill="#4f6ef7" opacity="0.9"/>`;
    content += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${holR}" fill="none" stroke="#6c84f8" stroke-width="1"/>`;
  });

  // Bouchon holes (cut zone, bottom clustered)
  const bouchonArr = [];
  const cutCols = 4;
  const cutStartX = offX + drawActualW/2 - (cutCols/2) * gridSpX;
  const cutStartY = offY + drawActualH - (rows_bouchon + 0.5) * gridSpY;
  for (let r = 0; r < rows_bouchon && bouchonArr.length < bouchon; r++) {
    for (let c = 0; c < cutCols && bouchonArr.length < bouchon; c++) {
      const px = cutStartX + (c + 0.5) * gridSpX;
      const py = cutStartY + r * gridSpY;
      bouchonArr.push([px, py]);
    }
  }
  bouchonArr.forEach(([px, py]) => {
    content += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${holR}" fill="#e74c3c" opacity="0.9"/>`;
    content += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${holR}" fill="none" stroke="#ff6b6b" stroke-width="1.5"/>`;
  });

  // Dimension annotations
  const dimY = offY + drawActualH + 20;
  const dimX = offX - 20;
  content += `<line x1="${offX}" y1="${dimY}" x2="${offX+drawActualW}" y2="${dimY}" stroke="#4f6ef7" stroke-width="1.5" marker-end="url(#arr)" marker-start="url(#arr)"/>`;
  content += `<text x="${offX+drawActualW/2}" y="${dimY+14}" text-anchor="middle" fill="#a0a8cc" font-size="11" font-family="monospace">${longueur.toFixed(2)} m</text>`;
  content += `<line x1="${dimX}" y1="${offY}" x2="${dimX}" y2="${offY+drawActualH}" stroke="#4f6ef7" stroke-width="1.5"/>`;
  content += `<text x="${dimX-6}" y="${offY+drawActualH/2}" text-anchor="middle" fill="#a0a8cc" font-size="11" font-family="monospace" transform="rotate(-90,${dimX-6},${offY+drawActualH/2})">${largeur.toFixed(2)} m</text>`;

  // Title
  const shotId = ext.shotId || formData?.shotId || 'Tir';
  const station = ext.projet || '';
  content += `<text x="${W/2}" y="22" text-anchor="middle" fill="#e8eaf6" font-size="14" font-weight="bold" font-family="system-ui">${shotId} — BANQUETTE</text>`;
  content += `<text x="${W/2}" y="38" text-anchor="middle" fill="#6b7299" font-size="10" font-family="system-ui">${station} | Ø${ext.diametreMm||51}mm | Esp.${esp}m × Fard.${fard}m</text>`;

  // Spacing indicator
  if (massArr.length >= 2) {
    const [p1, p2] = [massArr[0], massArr[1]];
    const mid = [(p1[0]+p2[0])/2, p1[1]-14];
    content += `<line x1="${p1[0]}" y1="${p1[1]-holR-2}" x2="${p2[0]}" y2="${p2[1]-holR-2}" stroke="#6b7299" stroke-width="0.8" stroke-dasharray="3,2"/>`;
    content += `<text x="${mid[0]}" y="${mid[1]}" text-anchor="middle" fill="#6b7299" font-size="9" font-family="monospace">${esp}m</text>`;
  }

  // Arrow marker
  const defs = `<defs><marker id="arr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#4f6ef7"/></marker></defs>`;

  // Stats box
  const stats = [
    `Masse: ${masse}`, `Bouchon: ${bouchon}`, `Tampon: ${tampon}`,
    `Total: ${total}`, `Charge: ${ext.chargeTotaleKg||'—'} kg`
  ];
  let statsY = 70;
  content += `<rect x="${W-155}" y="${statsY-14}" width="148" height="${stats.length*18+16}" fill="#1a1d27" stroke="#2d3148" stroke-width="1" rx="6"/>`;
  stats.forEach((s, i) => {
    content += `<text x="${W-148}" y="${statsY+i*18}" fill="#a0a8cc" font-size="11" font-family="monospace">${s}</text>`;
  });

  const legend = [
    {color:'#e74c3c', label:`Bouchon/Helpers (${bouchon})`},
    {color:'#4f6ef7', label:`Masse (${masse})`},
    {color:'#e67e22', label:`Tampon (${tampon})`},
  ];

  return {
    viewBox: `0 0 ${W} ${H}`,
    style: 'background:#10131a',
    innerHTML: defs + content,
    legend,
  };
}

export function renderTunnelSchematic(ext, formData) {
  const W = 800, H = 600;
  const masse = ext.trousMasse || 31;
  const perim = ext.trousPerim || 20;
  const lifter = ext.trousLifter || 16;
  const alesage = ext.trousAlésage || 6;
  const total = masse + perim + lifter + alesage;
  const avance = ext.avance || 3.6;
  const superficie = ext.superficie || 23;

  const CX = W/2, CY = H/2 - 20;
  const tunnelR = Math.sqrt(superficie / Math.PI) * 28;
  const tunnelH = tunnelR * 1.1;
  const tunnelW = tunnelR * 1.15;

  let content = '';

  // Tunnel profile
  content += `<ellipse cx="${CX}" cy="${CY+tunnelH*0.15}" rx="${tunnelW}" ry="${tunnelH*0.85}" fill="#1a1d27" stroke="#2d3148" stroke-width="1.5"/>`;
  content += `<path d="M${CX-tunnelW},${CY+tunnelH*0.15} Q${CX},${CY-tunnelH*1.1} ${CX+tunnelW},${CY+tunnelH*0.15}" fill="none" stroke="#4f6ef7" stroke-width="2"/>`;
  content += `<line x1="${CX-tunnelW}" y1="${CY+tunnelH*0.15}" x2="${CX+tunnelW}" y2="${CY+tunnelH*0.15}" stroke="#4f6ef7" stroke-width="2"/>`;
  content += `<path d="M${CX-tunnelW},${CY+tunnelH*0.15} Q${CX},${CY-tunnelH*1.1} ${CX+tunnelW},${CY+tunnelH*0.15} L${CX-tunnelW},${CY+tunnelH*0.15}" fill="#13161f" stroke="none"/>`;

  const holR = 5;

  // Perimetric holes around arch
  for (let i = 0; i < perim; i++) {
    const t2 = i / (perim - 1);
    const px = CX + tunnelW * (t2 * 2 - 1) * 1.05;
    const archY = CY + tunnelH*0.15 - tunnelH * 0.9 * Math.sin(Math.PI * t2);
    content += `<circle cx="${px.toFixed(1)}" cy="${archY.toFixed(1)}" r="${holR}" fill="none" stroke="#3498db" stroke-width="1.8"/>`;
  }

  // Mass holes — grid
  const massRows = 4, massCols = Math.ceil(masse / massRows);
  let mCount = 0;
  for (let r = 0; r < massRows && mCount < masse; r++) {
    for (let c = 0; c < massCols && mCount < masse; c++) {
      const px = CX - tunnelW*0.6 + (c / (massCols-1||1)) * tunnelW * 1.2;
      const py = CY - tunnelH*0.5 + (r / (massRows-1||1)) * tunnelH * 0.9;
      content += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${holR}" fill="#4f6ef7" opacity="0.9"/>`;
      mCount++;
    }
  }

  // Lifter holes — bottom row
  const lifterSpacing = (tunnelW * 1.8) / (lifter + 1);
  for (let i = 0; i < lifter; i++) {
    const px = CX - tunnelW*0.9 + (i+1) * lifterSpacing;
    const py = CY + tunnelH * 0.15 + 2;
    content += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${holR}" fill="#2ecc71" opacity="0.9"/>`;
  }

  // Alésage holes — center cluster (large empty)
  const alesR = holR * 2.2;
  for (let i = 0; i < alesage; i++) {
    const angle = (i / alesage) * Math.PI * 2;
    const px = CX + Math.cos(angle) * 22;
    const py = CY - 10 + Math.sin(angle) * 22;
    content += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${alesR}" fill="none" stroke="#9b59b6" stroke-width="2"/>`;
    content += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2" fill="#9b59b6"/>`;
  }

  // Title
  const shotId = ext.shotId || formData?.shotId || 'Tir';
  content += `<text x="${W/2}" y="22" text-anchor="middle" fill="#e8eaf6" font-size="14" font-weight="bold" font-family="system-ui">${shotId} — TUNNEL</text>`;
  content += `<text x="${W/2}" y="38" text-anchor="middle" fill="#6b7299" font-size="10" font-family="system-ui">Avance ${avance}m | ${superficie}m² | Ø${ext.diametreMm||41}mm</text>`;

  // Stats
  const stats = [`Périm: ${perim}`, `Masse: ${masse}`, `Lifter: ${lifter}`, `Alésage: ${alesage}`, `Total: ${total}`, `Charge: ${ext.chargeTotaleKg||'—'}kg`];
  let statsY = 70;
  content += `<rect x="${W-155}" y="${statsY-14}" width="148" height="${stats.length*18+16}" fill="#1a1d27" stroke="#2d3148" stroke-width="1" rx="6"/>`;
  stats.forEach((s, i) => {
    content += `<text x="${W-148}" y="${statsY+i*18}" fill="#a0a8cc" font-size="11" font-family="monospace">${s}</text>`;
  });

  content += `<text x="${W/2}" y="${H-10}" text-anchor="middle" fill="#6b7299" font-size="10" font-family="monospace">Section: ${superficie}m² | Volume: ${ext.volume||Math.round(superficie*avance)}m³</text>`;

  const legend = [
    {color:'transparent', stroke:'#3498db', label:`Périmétriques (${perim})`},
    {color:'#4f6ef7', label:`Masse (${masse})`},
    {color:'#2ecc71', label:`Lifters (${lifter})`},
    {color:'transparent', stroke:'#9b59b6', label:`Alésage (${alesage})`},
  ];

  return {
    viewBox: `0 0 ${W} ${H}`,
    style: 'background:#10131a',
    innerHTML: content,
    legend,
  };
}

export function getSchemaParams(ext) {
  return [
    ['No tir', ext.shotId || '—'],
    ['Zone', ext.zone || '—'],
    ['Plan DWG', ext.dessinNo || '—'],
    ['Diamètre', ext.diametreMm ? ext.diametreMm + ' mm' : '—'],
    ['Profondeur', ext.profForee ? ext.profForee + ' m' : (ext.avance ? ext.avance + ' m' : '—')],
    ['Espacement', ext.espacement ? ext.espacement + ' m' : '—'],
    ['Fardeau', ext.fardeau ? ext.fardeau + ' m' : '—'],
    ['Superficie', ext.superficie ? ext.superficie + ' m²' : '—'],
    ['Volume', ext.volume ? ext.volume + ' m³' : '—'],
    ['Charge totale', ext.chargeTotaleKg ? ext.chargeTotaleKg + ' kg' : '—'],
    ['Facteur', ext.facteurTir ? ext.facteurTir + ' kg/m³' : '—'],
    ['Détonateurs', ext.nbDetonateurs || '—'],
  ];
}

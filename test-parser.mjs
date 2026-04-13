/**
 * test-parser.mjs — CLI test script for the blast plan PDF parser
 *
 * Usage (from /workspace/repos/journal-tir/):
 *   node test-parser.mjs [pdf-file-path ...]
 *
 * If no files are specified, tests both reference PDFs automatically.
 */

import { readFileSync, existsSync } from 'fs';

// ─── Setup pdfjs-dist ────────────────────────────────────────────────────────

let pdfjsLib;
try {
  const pdfModule = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjsLib = pdfModule;
  const workerPath = new URL(
    './node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs',
    import.meta.url
  ).href;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
} catch (e) {
  console.error('Failed to load pdfjs-dist:', e.message);
  process.exit(1);
}

// ─── Text extraction ─────────────────────────────────────────────────────────

async function extractAllPages(filePath) {
  const data = readFileSync(filePath);
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(data) });
  const pdf = await loadingTask.promise;

  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const items = [];
    let rawText = '';
    for (const item of content.items) {
      if (item.str) {
        const x = item.transform ? Math.round(item.transform[4]) : 0;
        const y = item.transform ? Math.round(item.transform[5]) : 0;
        items.push({ str: item.str, x, y });
        rawText += item.str + ' ';
      }
    }

    // Build position-sorted text
    const sorted = [...items].sort((a, b) => {
      const yA = Math.round(a.y / 3) * 3;
      const yB = Math.round(b.y / 3) * 3;
      return yB - yA || a.x - b.x;
    });
    const sortedText = sorted.map(it => it.str).join(' ');

    pages.push({
      pageNum: i,
      rawText: preprocessText(rawText),
      sortedText: preprocessText(sortedText),
      items
    });
  }
  return pages;
}

function preprocessText(raw) {
  let t = raw;
  const fixes = [
    [/V\s+ertical/gi, 'Vertical'],
    [/t\s+rous\b/gi, 'trous'],
    [/moy\s+enne/gi, 'moyenne'],
    [/Sys\s+t[eè]me/gi, 'Système'],
    [/Diam[eè]t\s+re/gi, 'Diamètre'],
    [/Dens\s+it[eé]/gi, 'Densité'],
    [/V\s+olume/gi, 'Volume'],
  ];
  for (const [pat, rep] of fixes) t = t.replace(pat, rep);
  t = t.replace(/\b(\d+),(\d{1,4})\b/g, '$1.$2');
  return t;
}

// ─── Position helpers ─────────────────────────────────────────────────────────

function findValueAtSameRow(items, labelPattern, opts = {}) {
  const { minX = 370, yTolerance = 4, refX = null } = opts;
  const labelItem = items.find(it => labelPattern.test(it.str));
  if (!labelItem) return null;

  let rowItems = items
    .filter(it => Math.abs(it.y - labelItem.y) <= yTolerance && it.x > minX)
    .sort((a, b) => a.x - b.x)
    .filter(it => it.str.trim() && !/^\d$/.test(it.str.trim()));

  if (refX !== null) {
    // For multi-column tables: find the value closest to refX
    const tolerance = 40;
    const closest = rowItems
      .filter(it => Math.abs(it.x - refX) <= tolerance)
      .sort((a, b) => Math.abs(a.x - refX) - Math.abs(b.x - refX));
    return closest[0]?.str.trim() || null;
  }

  return rowItems[0]?.str.trim() || null;
}

function findAllValuesAtRow(items, labelPattern, opts = {}) {
  const { minX = 370, yTolerance = 4, maxValues = 4 } = opts;
  const labelItem = items.find(it => labelPattern.test(it.str));
  if (!labelItem) return [];
  return items
    .filter(it => Math.abs(it.y - labelItem.y) <= yTolerance && it.x > minX)
    .sort((a, b) => a.x - b.x)
    .filter(it => it.str.trim() && !/^\[/.test(it.str) && /^\d+$/.test(it.str.trim()))
    .map(it => it.str.trim())
    .slice(0, maxValues);
}

/**
 * For multi-scenario comparison tables (DWG-3002 style):
 * Find the X position of the scenario column that corresponds to the current tir's banquette.
 *
 * @param banquetteNum - The banquette number from the tir title (e.g., 9)
 * @param items - All positioned text items from all pages
 * @returns The X position of the matching scenario column header (or null)
 */
function getScenarioColumnX(banquetteNum, items) {
  if (banquetteNum === null) return null;

  // Scenario headers are at a row that contains multiple "Banquette #..." items
  // Look for items matching "Banquette #..." or "Banquette N"
  const banqItems = items.filter(it => /^Banquette\s+[#\d]/i.test(it.str));
  if (banqItems.length === 0) return null;

  // Group by Y row to find the header row
  const yGroups = new Map();
  for (const it of banqItems) {
    const yKey = Math.round(it.y / 6) * 6;
    if (!yGroups.has(yKey)) yGroups.set(yKey, []);
    yGroups.get(yKey).push(it);
  }

  // Find the Y row with the most scenario headers
  let bestGroup = [];
  for (const [, group] of yGroups) {
    if (group.length > bestGroup.length) bestGroup = group;
  }
  if (bestGroup.length === 0) return null;

  // Try each scenario header to see if it covers our banquette number
  for (const header of bestGroup) {
    const headerText = header.str;

    // "Banquette #8-6 à #10" → covers 6 to 10
    const rangeMatch = headerText.match(/Banquette\s+#?(\d+)(?:[–\-](\d+))?\s*[àa]\s*#?(\d+)/i);
    if (rangeMatch) {
      const low = Math.min(parseInt(rangeMatch[1]), parseInt(rangeMatch[2] || rangeMatch[1]));
      const high = parseInt(rangeMatch[3]);
      if (banquetteNum >= low && banquetteNum <= high) return header.x;
      continue;
    }

    // "Banquette #6-4A" — alphanumeric range — check if any number part matches
    const alphaMatch = headerText.match(/Banquette\s+#?(\d+)[–\-](\d+)[A-Za-z]?/i);
    if (alphaMatch) {
      const low = Math.min(parseInt(alphaMatch[1]), parseInt(alphaMatch[2]));
      const high = Math.max(parseInt(alphaMatch[1]), parseInt(alphaMatch[2]));
      if (banquetteNum >= low && banquetteNum <= high) return header.x;
      continue;
    }

    // "Banquette 11" — exact number
    const exactMatch = headerText.match(/Banquette\s+(\d+)$/i);
    if (exactMatch && parseInt(exactMatch[1]) === banquetteNum) return header.x;
  }

  return null;
}

/**
 * For a multi-column table, given a scenario header X, find the actual data column X
 * (which may be offset from the header X) by looking at the charge totale row.
 * Returns an object { scenarioX, refX } where refX is the column center for data values.
 */
function getScenarioRefX(items, scenarioHeaderX) {
  if (scenarioHeaderX === null) return null;

  // Use the "Charge explosive totale" row to find the actual data column X
  const ctLabel = items.find(it => /Charge\s+explosive\s+totale/i.test(it.str));
  if (!ctLabel) return scenarioHeaderX;

  const ctRow = items
    .filter(it => Math.abs(it.y - ctLabel.y) <= 6 && it.x > 150 && /^[\d.]+$/.test(it.str.trim()))
    .sort((a, b) => a.x - b.x);

  if (ctRow.length === 0) return scenarioHeaderX;

  // Find the charge totale value closest to the scenario header X
  const closest = [...ctRow].sort((a, b) =>
    Math.abs(a.x - scenarioHeaderX) - Math.abs(b.x - scenarioHeaderX)
  )[0];

  return closest ? closest.x : scenarioHeaderX;
}

// ─── Detection ───────────────────────────────────────────────────────────────

function detectDocumentType(allText) {
  if (/FULL\s+FACE|DEMI\s+FACE/i.test(allText)) return 'tunnel_advance';
  if (/Longueur\s+d.avanc[eé]e/i.test(allText)) return 'tunnel_advance';
  if (/trous?\s+p[eé]rim[eé]triques?/i.test(allText)) return 'tunnel_advance';
  if (/trous?\s+lifters?/i.test(allText)) return 'tunnel_advance';
  if (/Tir\s+\d+\s*[–\-]\s*Banquette\s+\d+/i.test(allText)) return 'bench';
  if (/Tir\s+\d+\s+B-\d+/i.test(allText)) return 'bench';
  if (/ZONE\s+BANQUETTE/i.test(allText)) return 'bench';
  return 'unknown';
}

// ─── PPV parser ───────────────────────────────────────────────────────────────

function parsePPV(text) {
  const values = [];
  const seen = new Set();
  for (const m of text.matchAll(/\bP\s*:\s*([\d.]+)\s*mm\/s/gi)) {
    if (!seen.has(m[1])) { seen.add(m[1]); values.push({ label: 'P', value: parseFloat(m[1]) }); }
  }
  for (const m of text.matchAll(/([A-ZÀÂÄ][a-zàâäéèêëîïôùûü]{2,}(?:\s+[A-Za-z]{2,})?)\s+([\d.]+)\s+mm\/s/g)) {
    const label = m[1].trim();
    if (/\[mm|diamètre|longueur|profondeur|collet/i.test(label)) continue;
    if (!seen.has(m[2])) { seen.add(m[2]); values.push({ label, value: parseFloat(m[2]) }); }
  }
  for (const m of text.matchAll(/\b([\d.]+)\s+mm\/s\b/gi)) {
    if (!seen.has(m[1])) { seen.add(m[1]); values.push({ label: '', value: parseFloat(m[1]) }); }
  }
  return values.filter(v => !isNaN(v.value) && v.value > 0 && v.value < 1000);
}

// ─── Personnel ────────────────────────────────────────────────────────────────

function extractPersonnel(pages) {
  for (const page of pages) {
    const items = page.items;
    const concuItem = items.find(it => /CONÇU\s+PAR\s*:/i.test(it.str));
    const verifiedItem = items.find(it => /VÉRIFIÉ\s+PAR\s*:/i.test(it.str));
    const dessineItem = items.find(it => /DESSINÉ\s+PAR\s*:/i.test(it.str));

    if (!concuItem && !verifiedItem) continue;

    const isLabel = (s) =>
      /^(CON[ÇC]U|DESSIN[EÉ]|V[EÉ]RIFI[EÉ]|APPROUV[EÉ]|SCEAU|PROJET|TITRE|CLIENT|[EÉ]CHELLE|DATE|DESSIN|FEUILLE|FORMAT|R[EÉ]VISIONS|IMPRIM[EÉ])[\s:,]/i.test(s)
      || /^N\/A$/.test(s);

    const findNameNearLabel = (labelItem) => {
      if (!labelItem) return null;
      const candidates = items.filter(it => {
        const yDiff = labelItem.y - it.y;
        return yDiff > 0 && yDiff <= 15
          && Math.abs(it.x - labelItem.x) < 20
          && !isLabel(it.str)
          && it.str.trim().length > 3
          && !/^\d{2}-\d{2}-\d{4}$/.test(it.str.trim());
      }).sort((a, b) => b.y - a.y);
      return candidates[0]?.str.trim() || null;
    };

    const concuPar = findNameNearLabel(concuItem);
    const dessinePar = findNameNearLabel(dessineItem);
    const verifiePar = findNameNearLabel(verifiedItem);

    if (concuPar || verifiePar) {
      return { concuPar, dessinePar, verifiePar };
    }
  }

  // Fallback: look for known names
  const allRaw = pages.map(p => p.rawText).join(' ');
  const namePattern = /\b(DEL\s+BOSCO[,\s]+RICCARDO|St-Pierre[,\s]+Alexis|Del\s+Bosco[,\s]+Riccardo)\b/gi;
  const names = [...allRaw.matchAll(namePattern)].map(m => m[0].trim());
  const unique = [...new Set(names)];
  return { concuPar: unique[0] || null, dessinePar: unique[1] || null, verifiePar: unique[0] || null };
}

function extractDate(pages) {
  for (const page of pages) {
    const m = page.rawText.match(/\b(\d{2})-(\d{2})-(\d{4})\b/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    const m2 = page.sortedText.match(/\b(\d{2})-(\d{2})-(\d{4})\b/);
    if (m2) return `${m2[3]}-${m2[2]}-${m2[1]}`;
  }
  return null;
}

// ─── Main parser ──────────────────────────────────────────────────────────────

function parseBenchPlan(pages) {
  const allRaw = pages.map(p => p.rawText).join('\n\n');
  const allSorted = pages.map(p => p.sortedText).join('\n\n');
  const allItems = pages.flatMap(p => p.items);
  const result = {};
  const extracted = {};

  // Station
  const stationMatch = allRaw.match(/STATION\s+([\w\s]+?)[\s–\-]+LOT\s+(\w+)/i);
  if (stationMatch) {
    result.station = stationMatch[1].trim().toUpperCase();
    result.contrat = stationMatch[2].trim();
    result.chantier = `Station ${result.station}`;
    extracted.station = true; extracted.contrat = true; extracted.chantier = true;
  }

  // Shot ID
  const tirShort = allRaw.match(/Tir\s+(\d+)\s+B-(\d+)/i);
  const tirLong = allRaw.match(/Tir\s+(\d+)\s*[–\-]\s*Banquette\s+(\d+)/i);
  if (tirShort) { result.numero_tir = `Tir ${tirShort[1]} B-${tirShort[2]}`; extracted.numero_tir = true; }
  else if (tirLong) { result.numero_tir = `Tir ${tirLong[1]} B-${tirLong[2]}`; extracted.numero_tir = true; }

  // Extract banquette number for multi-column scenario tables
  const banquetteNum = tirLong ? parseInt(tirLong[2]) : null;

  // Date
  const date = extractDate(pages);
  if (date) { result.date_tir = date; extracted.date_tir = true; }

  result.type_tir = 'Banc';

  // Hole counts
  const tRousMasse = parseInt(allRaw.match(/(\d+)\s+trous?\s+de\s+masse/i)?.[1] || '0');
  const trousBouchon = parseInt(allRaw.match(/(\d+)\s+trous?\s+(?:de\s+)?bouchon/i)?.[1] || '0');
  const trousTampon = parseInt(allRaw.match(/(\d+)\s+trous?\s+tampons?/i)?.[1] || '0');
  const trousSatellite = parseInt(allRaw.match(/(\d+)\s+trous?\s+satellite/i)?.[1] || '0');
  let totalHoles = tRousMasse + trousBouchon;
  if (trousTampon > 0) totalHoles += trousTampon;
  if (trousSatellite > 0 && trousSatellite !== trousTampon) totalHoles += trousSatellite;
  if (totalHoles > 0) { result.nb_trous = String(totalHoles); extracted.nb_trous = true; }

  // Profondeur
  const profForee = allRaw.match(/Prof\.\s*\(for[eé]e\)\s*:\s*([\d.]+)\s*m/i)?.[1];
  if (profForee) { result.profondeur_prevue = profForee; extracted.profondeur_prevue = true; }

  // ── Multi-scenario table detection ───────────────────────────────────────
  // Detect if this is a multi-column comparison table (DWG-3002 style)
  const scenarioHeaderX = banquetteNum !== null ? getScenarioColumnX(banquetteNum, allItems) : null;
  const refX = scenarioHeaderX !== null ? getScenarioRefX(allItems, scenarioHeaderX) : null;

  // For single-column tables (DWG-3018), use traditional positional lookup with minX=400
  // For multi-column tables (DWG-3002), use refX with lower minX threshold
  const isMultiColumn = scenarioHeaderX !== null;

  // Profondeur from positional (single-column only; multi-column profondeur already got from page 1)
  if (!result.profondeur_prevue) {
    const profOpts = isMultiColumn
      ? { minX: 100, refX }
      : { minX: 370 };
    const profMoy = findValueAtSameRow(allItems, /Profondeur\s+(?:moy(?:enne)?\s+des\s+trous)/i, profOpts);
    if (profMoy && /^[\d.]+$/.test(profMoy)) { result.profondeur_prevue = profMoy; extracted.profondeur_prevue = true; }
  }

  // Diameter
  const diamOpts = isMultiColumn ? { minX: 100, refX } : {};
  const diamVal = findValueAtSameRow(allItems, /Diam[eè]tre\s+de\s+forage/i, diamOpts);
  if (diamVal && /^\d{2,3}$/.test(diamVal)) { result.diametre = diamVal; extracted.diametre = true; }
  if (!result.diametre) {
    const d = allSorted.match(/\[mm\]\s+(\d{2,3})\b/)?.[1];
    if (d) { result.diametre = d; extracted.diametre = true; }
  }

  // Espacement
  if (isMultiColumn) {
    // Multi-column: use refX to select the right column
    const espVal = findValueAtSameRow(allItems, /^Espacement$/i, { minX: 100, refX });
    if (espVal && /^[\d.]+$/.test(espVal)) { result.espacement = espVal; extracted.espacement = true; }
  } else {
    const espVal = findValueAtSameRow(allItems, /^Espacement$/i);
    if (espVal && /^[\d.]+$/.test(espVal)) { result.espacement = espVal; extracted.espacement = true; }
    if (!result.espacement) {
      const e = allSorted.match(/Espacement\s+\[m\]\s+([\d.]+)/i)?.[1];
      if (e) { result.espacement = e; extracted.espacement = true; }
    }
  }

  // Fardeau (single-column tables only; multi-column doesn't have a separate fardeau row)
  if (!isMultiColumn) {
    const fardVal = findValueAtSameRow(allItems, /^Fardeau$/i);
    if (fardVal && /^[\d.]+$/.test(fardVal)) { result.fardeau = fardVal; extracted.fardeau = true; }
    if (!result.fardeau) {
      const f = allSorted.match(/Fardeau\s+\[m\]\s+([\d.]+)/i)?.[1];
      if (f) { result.fardeau = f; extracted.fardeau = true; }
    }
  }

  // Sous-forage
  if (isMultiColumn) {
    const sfVal = findValueAtSameRow(allItems, /^Sous-forage$/i, { minX: 100, refX });
    if (sfVal && /^[\d.]+$/.test(sfVal)) { result.sous_forage = sfVal; extracted.sous_forage = true; }
  } else {
    const sfVal = findValueAtSameRow(allItems, /^Sous-forage$/i);
    if (sfVal && /^[\d.]+$/.test(sfVal)) { result.sous_forage = sfVal; extracted.sous_forage = true; }
    if (!result.sous_forage) {
      const sf = allSorted.match(/Sous-forage\s+\[m\]\s+([\d.]+)/i)?.[1];
      if (sf) { result.sous_forage = sf; extracted.sous_forage = true; }
    }
  }

  if (/Vertical\s+\(90/i.test(allRaw)) { result.inclinaison = '90'; extracted.inclinaison = true; }

  // Charge totale
  if (isMultiColumn) {
    // For multi-column: use refX to select correct scenario column
    const ctVal = findValueAtSameRow(allItems, /Charge\s+explosive\s+totale/i, { minX: 100, refX });
    if (ctVal && /^\d+(\.\d+)?$/.test(ctVal)) { result.total_explosif_kg = ctVal; extracted.total_explosif_kg = true; }
  } else {
    // For single-column: minX=400 gets us past the label area
    const ctVal = findValueAtSameRow(allItems, /Charge\s+explosive\s+totale/i, { minX: 400 });
    if (ctVal && /^\d+(\.\d+)?$/.test(ctVal)) { result.total_explosif_kg = ctVal; extracted.total_explosif_kg = true; }
    if (!result.total_explosif_kg) {
      const ct = allSorted.match(/Charge\s+explosive\s+totale\s+\[kg\]\s+(\d+)/i)?.[1];
      if (ct) { result.total_explosif_kg = ct; extracted.total_explosif_kg = true; }
    }
  }

  // Initiation system
  const sys = allRaw.match(/(UNITRONIC|NONEL|i-kon|eDev|Daveytronic|EXEL)/i)?.[1];
  if (sys) {
    result.detonateurs = sys;
    if (/UNITRONIC/i.test(sys)) result.type_detonateurs = 'Électronique (eDev)';
    extracted.detonateurs = true;
  }

  // Nb detonators
  if (isMultiColumn) {
    // For multi-column: use the scenario-specific charged hole counts
    const nbMasseLabelItem = allItems.find(it => /Nombre\s+de\s+trous\s+charg[eé]s/i.test(it.str));
    const nbBouchonLabelItem = allItems.find(it => /Trous\s+additionnels\s+charg[eé]s/i.test(it.str));

    // Look for nb_masse at the refX column (y of Nb trous label row)
    if (nbMasseLabelItem && refX !== null) {
      const masseTolerance = 40;
      const masseY = nbMasseLabelItem.y;

      // Use tight yTolerance=4 to avoid picking up charge totale row (y≈139 when label is y≈154)
      const masseRowItems = allItems
        .filter(it =>
          Math.abs(it.y - masseY) <= 4 &&
          it.x > 150 && /^\d+$/.test(it.str.trim())
        )
        .sort((a, b) => a.x - b.x);

      // Find the value at refX
      const masseAtRef = masseRowItems.filter(it => Math.abs(it.x - refX) <= masseTolerance)
        .sort((a, b) => Math.abs(a.x - refX) - Math.abs(b.x - refX))[0];

      // Bouchon at refX — tight tolerance to avoid charge totale row bleedthrough
      let bouchonAtRef = null;
      if (nbBouchonLabelItem) {
        const bouchonY = nbBouchonLabelItem.y;
        const bouchonRowItems = allItems
          .filter(it =>
            Math.abs(it.y - bouchonY) <= 4 &&
            it.x > 150 && /^\d+$/.test(it.str.trim())
          )
          .sort((a, b) => a.x - b.x);
        bouchonAtRef = bouchonRowItems.filter(it => Math.abs(it.x - refX) <= masseTolerance)
          .sort((a, b) => Math.abs(a.x - refX) - Math.abs(b.x - refX))[0];
      }

      const masseCount = masseAtRef ? parseInt(masseAtRef.str) : 0;
      const bouchonCount = bouchonAtRef ? parseInt(bouchonAtRef.str) : 0;
      const total = masseCount + bouchonCount;
      if (total > 0) { result.nb_detonateurs = String(total); extracted.nb_detonateurs = true; }
    }

    // Fallback to total holes from page 1
    if (!result.nb_detonateurs && totalHoles > 0) {
      result.nb_detonateurs = String(totalHoles);
      extracted.nb_detonateurs = true;
    }
  } else {
    // Single-column: sum all charged holes
    const nbTrousRow = findAllValuesAtRow(allItems, /Nombre\s+de\s+trous\s+charg[eé]s/i, { minX: 360 });
    const bouchonRow = findAllValuesAtRow(allItems, /Trous\s+additionnels\s+charg[eé]s/i, { minX: 360 });
    const sumNums = (vals) => vals.map(v => parseInt(v) || 0).reduce((a,b) => a+b, 0);
    const nbCharged = sumNums(nbTrousRow) + sumNums(bouchonRow);
    if (nbCharged > 0) { result.nb_detonateurs = String(nbCharged); extracted.nb_detonateurs = true; }
  }

  // PPV
  const ppv = parsePPV(allRaw);
  if (ppv.length > 0) {
    const maxPPV = Math.max(...ppv.map(v => v.value));
    const ppvStr = ppv.map(v => v.label && v.label !== 'P' ? `${v.label}: ${v.value}` : `${v.value}`).join(', ');
    result.vibrations_ppv = `${maxPPV} (max) — ${ppvStr} mm/s`;
    extracted.vibrations_ppv = true;
  }

  // ISO contour
  const iso = allRaw.match(/ISO\s+CONTOUR\s+(\d+)\s*MS/i);
  if (iso) { result.sequence_delais = `ISO Contour ${iso[1]}ms`; extracted.sequence_delais = true; }

  // Personnel
  const personnel = extractPersonnel(pages);
  if (personnel.verifiePar) { result.superviseur = personnel.verifiePar; extracted.superviseur = true; }

  const dessinNo = allRaw.match(/(\d{7}-\d{6}-[\dA-Z]+-DWG-\d{4})/)?.[1];
  const notes = [];
  if (personnel.concuPar) notes.push(`Conçu par: ${personnel.concuPar}`);
  if (personnel.dessinePar) notes.push(`Dessiné par: ${personnel.dessinePar}`);
  if (personnel.verifiePar) notes.push(`Vérifié par: ${personnel.verifiePar}`);
  if (dessinNo) notes.push(`Plan de tir: ${dessinNo.trim()}`);
  if (notes.length > 0) { result.remarques = notes.join('\n'); extracted.remarques = true; }

  // Explosives
  const nbTrousTotal = totalHoles || parseInt(result.nb_detonateurs || '0');
  const explosifs = parseExplosives(allRaw, allSorted, allItems, nbTrousTotal, isMultiColumn, refX);

  return { result, extracted, explosifs, dessinNo };
}

function parseExplosives(allRaw, allSorted, allItems, nbChargedTotal, isMultiColumn, refX) {
  const explMap = new Map();

  if (isMultiColumn && refX !== null) {
    // Multi-column table: find explosif type/diameter/weight for each explosif index
    // Use positional lookup at the scenario's refX column
    const COL_TOLERANCE = 40; // px tolerance for column matching

    for (let i = 1; i <= 4; i++) {
      const typeLabelItem = allItems.find(it => new RegExp(`Type\\s+Explosif\\s+${i}\\b`, 'i').test(it.str));
      if (!typeLabelItem) continue;

      // Find type name at refX — must be within COL_TOLERANCE
      const typeY = typeLabelItem.y;
      const typeItems = allItems.filter(it =>
        Math.abs(it.y - typeY) <= 6 && it.x > 100 &&
        Math.abs(it.x - refX) <= COL_TOLERANCE &&
        /powerditch|powerfrac|powergel|senatel|dynomax|riobel/i.test(it.str)
      );
      const typeAtRef = typeItems.length > 0
        ? [...typeItems].sort((a,b) => Math.abs(a.x - refX) - Math.abs(b.x - refX))[0]
        : null;

      if (!typeAtRef) continue; // Explosif not used in this scenario column

      const typeName = typeAtRef.str.trim();

      // Diameter: look for "Diamètre - Explosif N" label row
      // The value columns should be within COL_TOLERANCE of refX
      const diamLabelItem = allItems.find(it =>
        new RegExp(`Diam[eè]tre\\s*-\\s*Explosif\\s+${i}`, 'i').test(it.str)
      );
      let diameter = '';
      if (diamLabelItem) {
        const diamY = diamLabelItem.y;
        const diamItems = allItems.filter(it =>
          Math.abs(it.y - diamY) <= 6 && it.x > 100 &&
          Math.abs(it.x - refX) <= COL_TOLERANCE &&
          /^\d{2,3}$/.test(it.str.trim())
        );
        const diamAtRef = [...diamItems].sort((a,b) =>
          Math.abs(a.x - refX) - Math.abs(b.x - refX)
        )[0];
        diameter = diamAtRef?.str.trim() || '';
      }

      // Weight: In this PDF, "Poids unitaire / bâton -" is split across two rows:
      // Line 1: "Poids unitaire / bâton -" (no "[kg/un]" unit)
      // Line 2: "Explosif N" + "[kg/un]" + values
      // So we look for items on the "Explosif N" sub-item row
      let weight = '';
      // Find the "Explosif N" sub-item (distinct from "Type Explosif N" label)
      // It appears as just "Explosif N" at lower y than the type label
      const explosifSubItem = allItems.find(it =>
        new RegExp(`^Explosif\\s+${i}$`, 'i').test(it.str.trim()) &&
        it.y < typeY && (typeY - it.y) <= 50
      );
      if (explosifSubItem) {
        const subY = explosifSubItem.y;
        // Look for "[kg/un]" on this row or up to 8px above/below
        const kgUnItem = allItems.find(it =>
          Math.abs(it.y - subY) <= 8 && /\[kg\/un\]/i.test(it.str)
        );
        if (kgUnItem) {
          // Values are on the same row as "[kg/un]"
          const weightY = kgUnItem.y;
          const weightItems = allItems.filter(it =>
            Math.abs(it.y - weightY) <= 4 && it.x > kgUnItem.x &&
            Math.abs(it.x - refX) <= COL_TOLERANCE &&
            /^[\d.]+$/.test(it.str.trim()) && parseFloat(it.str) < 5 // weight should be < 5 kg
          );
          const weightAtRef = [...weightItems].sort((a,b) =>
            Math.abs(a.x - refX) - Math.abs(b.x - refX)
          )[0];
          weight = weightAtRef?.str.trim() || '';
        }
      }

      // Fallback weight: scan rows below type row for decimal values at refX
      if (!weight) {
        const nearbyWeightItems = allItems.filter(it =>
          it.y < typeY && (typeY - it.y) <= 80 && it.x > 100 &&
          Math.abs(it.x - refX) <= COL_TOLERANCE &&
          /^0?\.\d+$|^\d\.\d+$/.test(it.str.trim()) // decimal values like 0.34 or 1.36
        );
        // Prefer smaller values (actual weight rather than density)
        const weightAtRef = [...nearbyWeightItems]
          .filter(it => parseFloat(it.str) < 2) // weight < 2 kg/bâton
          .sort((a,b) => Math.abs(a.x - refX) - Math.abs(b.x - refX))[0];
        weight = weightAtRef?.str.trim() || '';
      }

      explMap.set(String(i), { type: typeName, diametre: diameter, poids: weight });
    }
  } else {
    // Single-column table (DWG-3018 style)

    // Diameter
    for (const m of allRaw.matchAll(/Diam[eè]tre\s*-\s*Explosif\s+(\d+)[^[]*\[mm\]\s+(\d+)/gi)) {
      const idx = m[1];
      if (!explMap.has(idx)) explMap.set(idx, { type: '', diametre: m[2], poids: '' });
      else explMap.get(idx).diametre = m[2];
    }
    // Fallback positional
    for (let i = 1; i <= 3; i++) {
      const val = findValueAtSameRow(allItems, new RegExp(`Diam[eè]tre\\s*-\\s*Explosif\\s+${i}`, 'i'));
      if (val && /^\d+$/.test(val)) {
        if (!explMap.has(String(i))) explMap.set(String(i), { type: '', diametre: val, poids: '' });
        else if (!explMap.get(String(i)).diametre) explMap.get(String(i)).diametre = val;
      }
    }

    // Weight
    for (const m of allRaw.matchAll(/Poids\s+unitaire[^-]*-\s*Explosif\s+(\d+)[^[]*\[kg\/un\]\s+([\d.]+)/gi)) {
      const idx = m[1];
      if (!explMap.has(idx)) explMap.set(idx, { type: '', diametre: '', poids: m[2] });
      else explMap.get(idx).poids = m[2];
    }

    // Type names
    for (const m of allRaw.matchAll(/Type\s+Explosif\s+(\d+)[^a-z]*(Powerditch|PowerDitch|PowerFrac)/gi)) {
      const idx = m[1];
      if (!explMap.has(idx)) explMap.set(idx, { type: m[2], diametre: '', poids: '' });
      else if (!explMap.get(idx).type) explMap.get(idx).type = m[2];
    }
    for (const m of allSorted.matchAll(/Type\s+Explosif\s+(\d+)\s+(Powerditch|PowerDitch|PowerFrac)/gi)) {
      const idx = m[1];
      if (!explMap.has(idx)) explMap.set(idx, { type: m[2], diametre: '', poids: '' });
      else if (!explMap.get(idx).type) explMap.get(idx).type = m[2];
    }
  }

  const explosifs = [];
  for (const [idx, e] of [...explMap.entries()].sort()) {
    if (!e.diametre && !e.type && !e.poids) continue;
    explosifs.push({
      id: idx,
      type: e.type,
      diametre_mm: e.diametre,
      poids_kg_baton: e.poids,
      nb_total: nbChargedTotal
    });
  }

  return explosifs;
}

// ─── Main ────────────────────────────────────────────────────────────────────

const DEFAULT_PDFS = [
  '/workspace/.sam/uploads/8721003-900000-4M-DWG-3018-R00.pdf',
  '/workspace/.sam/uploads/8721003-600000-4M-DWG-3002-R01.pdf',
];

const args = process.argv.slice(2);
const pdfPaths = args.length > 0 ? args : DEFAULT_PDFS;

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║  Blast Plan PDF Parser — Test Script                     ║');
console.log('╚══════════════════════════════════════════════════════════╝');

for (const pdfPath of pdfPaths) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📄 File: ${pdfPath}`);
  console.log(`${'─'.repeat(60)}`);

  if (!existsSync(pdfPath)) {
    console.log(`  ❌ File not found: ${pdfPath}`);
    continue;
  }

  try {
    console.log('  ⏳ Extracting text from PDF pages...');
    const pages = await extractAllPages(pdfPath);
    console.log(`  ✅ Extracted ${pages.length} pages`);

    const allRaw = pages.map(p => p.rawText).join('\n\n');
    const docType = detectDocumentType(allRaw);
    console.log(`  📋 Document type: ${docType}`);

    const { result, extracted, explosifs, dessinNo } = parseBenchPlan(pages);

    console.log('\n  ── Extracted Fields ─────────────────────────────────');

    const fields = [
      ['numero_tir',       'Numéro de tir',         result.numero_tir],
      ['date_tir',         'Date du tir',            result.date_tir],
      ['station',          'Station',                result.station],
      ['chantier',         'Chantier',               result.chantier],
      ['contrat',          'Contrat/Lot',            result.contrat],
      ['type_tir',         'Type de tir',            result.type_tir],
      ['nb_trous',         'Nombre de trous',        result.nb_trous],
      ['profondeur_prevue','Profondeur (m)',          result.profondeur_prevue],
      ['diametre',         'Diamètre (mm)',           result.diametre],
      ['espacement',       'Espacement (m)',          result.espacement],
      ['fardeau',          'Fardeau (m)',             result.fardeau],
      ['sous_forage',      'Sous-forage (m)',         result.sous_forage],
      ['inclinaison',      'Inclinaison (°)',         result.inclinaison],
      ['detonateurs',      'Détonateurs',             result.detonateurs],
      ['type_detonateurs', 'Type détonateurs',        result.type_detonateurs],
      ['nb_detonateurs',   'Nb détonateurs',          result.nb_detonateurs],
      ['total_explosif_kg','Total explosifs (kg)',    result.total_explosif_kg],
      ['vibrations_ppv',   'Vibrations PPV',          result.vibrations_ppv],
      ['sequence_delais',  'Séquence/délais',         result.sequence_delais],
      ['superviseur',      'Superviseur',             result.superviseur],
      ['remarques',        'Remarques (1ère ligne)',  result.remarques ? result.remarques.split('\n')[0] + (result.remarques.includes('\n') ? '...' : '') : null],
    ];

    let count = 0;
    for (const [, label, value] of fields) {
      const status = value ? '✅' : '—';
      const display = value ? String(value).substring(0, 60) : '(vide)';
      console.log(`  ${status} ${label.padEnd(26)} ${display}`);
      if (value) count++;
    }

    if (explosifs.length > 0) {
      console.log('\n  ── Explosive Products ───────────────────────────────');
      for (const e of explosifs) {
        console.log(`  ✅ Explosif ${e.id}: ${e.type || '?'} — ∅${e.diametre_mm}mm — ${e.poids_kg_baton} kg/bâton — ${e.nb_total} trous total`);
        count++;
      }
    }

    console.log(`\n  📊 Total: ${count} champs extraits`);
    if (dessinNo) console.log(`  🔢 Dessin No: ${dessinNo}`);

  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    if (process.env.DEBUG) console.error(err);
  }
}

console.log('\n✅ Test complete.');

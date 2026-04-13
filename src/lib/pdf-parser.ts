/**
 * pdf-parser.ts — Blast Plan PDF Auto-Parser
 *
 * Extracts fields from engineering blast plan PDFs (produced by PowerPoint → MS Print To PDF
 * or Acrobat PDFMaker) and maps them to the JournalTir interface.
 *
 * Supports two document formats:
 *  - Bench blast (banquette): 4 pages A/B/C/D
 *  - Tunnel full face (foncée): 3 pages F
 *
 * All parsing runs client-side using pdf.js (pdfjs-dist).
 */

import type { JournalTir, ExplosifRow } from './db';

// ─── Types ─────────────────────────────────────────────────────────────────

export type BlastDocumentType = 'bench' | 'tunnel_advance' | 'unknown';

export interface ParsedBlastPlan {
  /** Partial JournalTir fields auto-filled from the PDF */
  journalData: Partial<JournalTir>;
  /** Number of fields that were successfully extracted */
  fieldsExtracted: number;
  /** Document type detected */
  documentType: BlastDocumentType;
  /** Drawing number from the PDF */
  dessinNo: string;
  /** Any warnings / notes about parsing */
  warnings: string[];
}

interface PositionedItem {
  str: string;
  x: number;
  y: number;
}

interface PageText {
  pageNum: number;
  /** Simple concatenated text (stream order, no positioning) */
  rawText: string;
  /** Position-sorted text (top-to-bottom, left-to-right) */
  sortedText: string;
  /** Raw positioned items for column-based parsing */
  items: PositionedItem[];
}

// ─── Worker setup ──────────────────────────────────────────────────────────

let pdfjsInitialized = false;

async function initPdfjs() {
  if (pdfjsInitialized) return;
  const pdfjsLib = await import('pdfjs-dist');
  try {
    const workerUrl = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).href;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
  }
  pdfjsInitialized = true;
}

// ─── Text Extraction ────────────────────────────────────────────────────────

/**
 * Extract text from all pages of a PDF File object.
 * Returns both stream-order text and position-sorted text.
 */
async function extractAllPages(file: File): Promise<PageText[]> {
  await initPdfjs();
  const pdfjsLib = await import('pdfjs-dist');

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pages: PageText[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const items: PositionedItem[] = [];
    let rawText = '';

    for (const item of content.items) {
      if ('str' in item && (item as { str: string }).str) {
        const str = (item as { str: string }).str;
        const transform = (item as { transform: number[] }).transform;
        const x = transform ? Math.round(transform[4]) : 0;
        const y = transform ? Math.round(transform[5]) : 0;
        items.push({ str, x, y });
        rawText += str + ' ';
      }
    }

    // Build position-sorted text: sort top-to-bottom (Y desc), then left-to-right (X asc)
    // Quantize Y to 3-pt buckets to group items on the same visual row
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

/**
 * Normalize raw extracted text:
 * - Fix word-split artifacts from MS Print To PDF
 * - Convert French decimal commas to periods
 */
function preprocessText(raw: string): string {
  let t = raw;

  const fixes: Array<[RegExp, string]> = [
    [/V\s+ertical/gi, 'Vertical'],
    [/t\s+rous\b/gi, 'trous'],
    [/moy\s+enne/gi, 'moyenne'],
    [/Sys\s+t[eè]me/gi, 'Système'],
    [/[eé]t\s+ag[eé]es/gi, 'étagées'],
    [/Rat\s+io/gi, 'Ratio'],
    [/tot\s+al/gi, 'total'],
    [/Diam[eè]t\s+re/gi, 'Diamètre'],
    [/Dens\s+it[eé]/gi, 'Densité'],
    [/Prof\s+ondeur/gi, 'Profondeur'],
  ];

  for (const [pat, rep] of fixes) {
    t = t.replace(pat, rep);
  }
  // French decimal: "0,76" → "0.76" (only in numeric context)
  t = t.replace(/\b(\d+),(\d{1,4})\b/g, '$1.$2');

  return t;
}

// ─── Document Type Detection ────────────────────────────────────────────────

function detectDocumentType(allText: string): BlastDocumentType {
  if (/FULL\s+FACE|DEMI\s+FACE/i.test(allText)) return 'tunnel_advance';
  if (/Longueur\s+d.avanc[eé]e/i.test(allText)) return 'tunnel_advance';
  if (/trous?\s+p[eé]rim[eé]triques?/i.test(allText)) return 'tunnel_advance';
  if (/trous?\s+lifters?/i.test(allText)) return 'tunnel_advance';

  if (/Tir\s+\d+\s*[–\-]\s*Banquette\s+\d+/i.test(allText)) return 'bench';
  if (/Tir\s+\d+\s+B-\d+/i.test(allText)) return 'bench';
  if (/ZONE\s+BANQUETTE/i.test(allText)) return 'bench';
  if (/trous?\s+de\s+masse/i.test(allText) && /trous?\s+(?:tampon|bouchon|satellite)/i.test(allText)) return 'bench';

  return 'unknown';
}

// ─── Field Extractors ───────────────────────────────────────────────────────

function extract(text: string, pattern: RegExp, groupIndex = 1): string | null {
  const m = text.match(pattern);
  if (!m) return null;
  return m[groupIndex]?.trim() || null;
}

/**
 * Position-aware value lookup: given a row label, find the data value
 * at the same Y coordinate but at a larger X (in the data column area).
 *
 * Uses a tight 4px Y tolerance so adjacent table rows don't bleed together.
 * Supports an optional refX for multi-column tables (picks value closest to refX).
 */
function findValueAtSameRow(
  items: PositionedItem[],
  labelPattern: RegExp,
  opts: { minX?: number; yTolerance?: number; refX?: number | null } = {}
): string | null {
  const { minX = 370, yTolerance = 4, refX = null } = opts;

  const labelItem = items.find(it => labelPattern.test(it.str));
  if (!labelItem) return null;

  // Find all items at the same Y (within tolerance) with X > minX
  let rowItems = items
    .filter(it => Math.abs(it.y - labelItem.y) <= yTolerance && it.x > minX)
    .sort((a, b) => a.x - b.x);

  if (rowItems.length === 0) return null;

  // Skip superscript numbers (single digit at slightly different Y)
  rowItems = rowItems.filter(it => it.str.trim() && !/^\d$/.test(it.str.trim()));

  if (refX !== null) {
    // Multi-column: find the value closest to refX
    const tolerance = 40;
    const closest = rowItems
      .filter(it => Math.abs(it.x - refX) <= tolerance)
      .sort((a, b) => Math.abs(a.x - refX) - Math.abs(b.x - refX));
    return closest[0]?.str.trim() || null;
  }

  return rowItems[0]?.str.trim() || null;
}

/**
 * For multi-scenario comparison tables (DWG-3002 style):
 * Find the X position of the scenario column header that contains the current banquette number.
 */
function getScenarioColumnX(
  banquetteNum: number,
  items: PositionedItem[]
): number | null {
  // Scenario headers look like "Banquette #8-6 à #10" or "Banquette 11"
  const banqItems = items.filter(it => /^Banquette\s+[#\d]/i.test(it.str));
  if (banqItems.length === 0) return null;

  // Group by Y row to find the header row with the most scenario headers
  const yGroups = new Map<number, PositionedItem[]>();
  for (const it of banqItems) {
    const yKey = Math.round(it.y / 6) * 6;
    if (!yGroups.has(yKey)) yGroups.set(yKey, []);
    yGroups.get(yKey)!.push(it);
  }

  let bestGroup: PositionedItem[] = [];
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

    // "Banquette #6-4A" — alphanumeric range
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
 * by looking at the charge totale row values.
 */
function getScenarioRefX(
  items: PositionedItem[],
  scenarioHeaderX: number
): number {
  const ctLabel = items.find(it => /Charge\s+explosive\s+totale/i.test(it.str));
  if (!ctLabel) return scenarioHeaderX;

  const ctRow = items
    .filter(it => Math.abs(it.y - ctLabel.y) <= 6 && it.x > 150 && /^[\d.]+$/.test(it.str.trim()))
    .sort((a, b) => a.x - b.x);

  if (ctRow.length === 0) return scenarioHeaderX;

  const closest = [...ctRow].sort((a, b) =>
    Math.abs(a.x - scenarioHeaderX) - Math.abs(b.x - scenarioHeaderX)
  )[0];

  return closest ? closest.x : scenarioHeaderX;
}

/**
 * Find all values at the same row as a label (for multi-column tables).
 * Returns up to maxValues items (default 4) to avoid runaway table reads.
 */
function findAllValuesAtRow(
  items: PositionedItem[],
  labelPattern: RegExp,
  opts: { minX?: number; yTolerance?: number; maxValues?: number } = {}
): string[] {
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

// ─── PPV Parser ─────────────────────────────────────────────────────────────

interface PPVValue {
  label: string;
  value: number;
}

function parsePPV(text: string): PPVValue[] {
  const values: PPVValue[] = [];
  const seen = new Set<string>();

  // Format 1: "P:4.26 mm/s" or "P: 4.26 mm/s"
  for (const m of text.matchAll(/\bP\s*:\s*([\d.]+)\s*mm\/s/gi)) {
    const key = m[1];
    if (!seen.has(key)) { seen.add(key); values.push({ label: 'P', value: parseFloat(m[1]) }); }
  }

  // Format 2: "Pharmaprix 7.18 mm/s" — named label + value
  for (const m of text.matchAll(/([A-ZÀÂÄ][a-zàâäéèêëîïôùûü]{2,}(?:\s+[A-Za-z]{2,})?)\s+([\d.]+)\s+mm\/s/g)) {
    const label = m[1].trim();
    if (/\[mm|diamètre|longueur|profondeur|collet/i.test(label)) continue;
    const key = m[2];
    if (!seen.has(key)) { seen.add(key); values.push({ label, value: parseFloat(m[2]) }); }
  }

  // Format 3: bare value "5.6 mm/s"
  for (const m of text.matchAll(/\b([\d.]+)\s+mm\/s\b/gi)) {
    const key = m[1];
    if (!seen.has(key)) { seen.add(key); values.push({ label: '', value: parseFloat(m[1]) }); }
  }

  return values.filter(v => !isNaN(v.value) && v.value > 0 && v.value < 1000);
}

// ─── Personnel Extraction ────────────────────────────────────────────────────

/**
 * Extract personnel names from the title block.
 *
 * In MS Print To PDF, the labels (CONÇU PAR, VÉRIFIÉ PAR, etc.) are in one
 * stream and the values (DEL BOSCO, St-Pierre, etc.) are in a separate stream.
 * The values appear AFTER their respective labels in the Y-sorted text.
 *
 * Strategy: use position data to find names at the same Y as labels.
 */
function extractPersonnel(pages: PageText[]): {
  concuPar: string | null;
  dessinePar: string | null;
  verifiePar: string | null;
  approuvePar: string | null;
} {
  // Try each page — title block repeats on every page
  for (const page of pages) {
    const items = page.items;

    // Labels positions (they appear as full strings like "CONÇU PAR :")
    const concuItem = items.find(it => /CONÇU\s+PAR\s*:/i.test(it.str));
    const dessineItem = items.find(it => /DESSINÉ\s+PAR\s*:/i.test(it.str));
    const verifiedItem = items.find(it => /VÉRIFIÉ\s+PAR\s*:/i.test(it.str));
    const approuveItem = items.find(it => /APPROUVÉ\s+PAR\s*:/i.test(it.str));

    if (!concuItem && !verifiedItem) continue;

    // For each label, look for the name value slightly below it (names are at label.y - 6 typically)
    const isLabel = (s: string) =>
      /^(CON[ÇC]U|DESSIN[EÉ]|V[EÉ]RIFI[EÉ]|APPROUV[EÉ]|SCEAU|PROJET|TITRE|CLIENT|[EÉ]CHELLE|DATE|DESSIN|FEUILLE|FORMAT|R[EÉ]VISIONS|IMPRIM[EÉ])[\s:,]/i.test(s)
      || /^N\/A$/.test(s);

    const findNameNearLabel = (labelItem: PositionedItem | undefined): string | null => {
      if (!labelItem) return null;

      // Names appear at same X ±10px, Y slightly below (label.y - name.y ≈ 6px in these PDFs)
      const candidates = items.filter(it => {
        const yDiff = labelItem.y - it.y; // positive = below in PDF coordinate space
        return yDiff > 0 && yDiff <= 15   // must be below the label
          && Math.abs(it.x - labelItem.x) < 20  // very close horizontally (same column)
          && !isLabel(it.str)
          && it.str.trim().length > 3
          && !/^N\/A$|^\d{2}-\d{2}-\d{4}$/.test(it.str.trim());
      }).sort((a, b) => b.y - a.y);  // closest below first

      if (candidates.length > 0) return candidates[0].str.trim();
      return null;
    };

    const concuPar = findNameNearLabel(concuItem);
    const dessinePar = findNameNearLabel(dessineItem);
    const verifiePar = findNameNearLabel(verifiedItem);
    const approuvePar = findNameNearLabel(approuveItem);

    if (concuPar || verifiePar) {
      return { concuPar, dessinePar, verifiePar, approuvePar };
    }
  }

  // Fallback: look for known name patterns in all text
  const allRaw = pages.map(p => p.rawText).join(' ');
  const namePattern = /\b(DEL\s+BOSCO[,\s]+RICCARDO|St-Pierre[,\s]+Alexis|Del\s+Bosco[,\s]+Riccardo)\b/gi;
  const names = [...allRaw.matchAll(namePattern)].map(m => m[0].trim());
  const unique = [...new Set(names)];

  return {
    concuPar: unique[0] || null,
    dessinePar: unique[1] || null,
    verifiePar: unique[0] || null,
    approuvePar: unique[0] || null
  };
}

/**
 * Extract date from title block.
 * The date appears after the DATE label in sorted text: "DATE : ... 09-04-2026"
 */
function extractDate(pages: PageText[]): string | null {
  for (const page of pages) {
    // Look for date pattern DD-MM-YYYY in sorted text
    const m = page.sortedText.match(/\b(\d{2})-(\d{2})-(\d{4})\b/);
    if (m) {
      return `${m[3]}-${m[2]}-${m[1]}`;
    }
    // Also check raw text
    const m2 = page.rawText.match(/\b(\d{2})-(\d{2})-(\d{4})\b/);
    if (m2) {
      return `${m2[3]}-${m2[2]}-${m2[1]}`;
    }
  }
  return null;
}

// ─── Bench Plan Parser ──────────────────────────────────────────────────────

function parseBenchPlan(
  pages: PageText[]
): Partial<JournalTir> & { _explosifs?: ExplosifRow[]; _warnings?: string[] } {
  const allRaw = pages.map(p => p.rawText).join('\n\n');
  const allSorted = pages.map(p => p.sortedText).join('\n\n');
  const allItems = pages.flatMap(p => p.items);
  const result: Partial<JournalTir> & { _explosifs?: ExplosifRow[]; _warnings?: string[] } = {};
  const warnings: string[] = [];

  // ── Station ───────────────────────────────────────────────────
  const stationMatch = allRaw.match(/STATION\s+([\w\s]+?)[\s–\-]+LOT\s+(\w+)/i)
    || allSorted.match(/STATION\s+([\w\s]+?)[\s–\-]+LOT\s+(\w+)/i);
  if (stationMatch) {
    result.station = stationMatch[1].trim().toUpperCase();
    result.contrat = stationMatch[2].trim();
    result.chantier = `Station ${result.station}`;
  }

  // ── Shot ID ───────────────────────────────────────────────────
  const tirShort = allRaw.match(/Tir\s+(\d+)\s+B-(\d+)/i);
  const tirLong = allRaw.match(/Tir\s+(\d+)\s*[–\-]\s*Banquette\s+(\d+)/i);
  if (tirShort) {
    result.numero_tir = `Tir ${tirShort[1]} B-${tirShort[2]}`;
  } else if (tirLong) {
    result.numero_tir = `Tir ${tirLong[1]} B-${tirLong[2]}`;
  }

  // Extract banquette number for multi-column scenario tables
  const banquetteNum = tirLong ? parseInt(tirLong[2]) : null;

  // ── Date ──────────────────────────────────────────────────────
  const date = extractDate(pages);
  if (date) result.date_tir = date;

  // ── Type de tir ───────────────────────────────────────────────
  result.type_tir = 'Banc';

  // ── Hole counts (Page A) ──────────────────────────────────────
  const tRousMasse = parseInt(extract(allRaw, /(\d+)\s+trous?\s+de\s+masse/i) || '0');
  const trousBouchon = parseInt(extract(allRaw, /(\d+)\s+trous?\s+(?:de\s+)?bouchon/i) || '0');
  const trousTampon = parseInt(extract(allRaw, /(\d+)\s+trous?\s+tampons?/i) || '0');
  const trousSatellite = parseInt(extract(allRaw, /(\d+)\s+trous?\s+satellite/i) || '0');

  // Total: masse + bouchon + tampon + satellite (avoid double-counting tampon/satellite if they're the same)
  let totalHoles = tRousMasse + trousBouchon;
  if (trousTampon > 0) totalHoles += trousTampon;
  if (trousSatellite > 0 && trousSatellite !== trousTampon) totalHoles += trousSatellite;
  if (totalHoles > 0) result.nb_trous = String(totalHoles);

  // ── Multi-scenario table detection ───────────────────────────
  // Detect if this is a multi-column comparison table (DWG-3002 style)
  const scenarioHeaderX = banquetteNum !== null ? getScenarioColumnX(banquetteNum, allItems) : null;
  const refX = scenarioHeaderX !== null ? getScenarioRefX(allItems, scenarioHeaderX) : null;
  const isMultiColumn = scenarioHeaderX !== null;

  // ── Profondeur (Page A then B) ────────────────────────────────
  // From Page A: "Prof. (forée): 2.1 m"
  const profForee = extract(allRaw, /Prof\.\s*\(for[eé]e\)\s*:\s*([\d.]+)\s*m/i);
  if (profForee) result.profondeur_prevue = profForee;

  // From Page B: "Profondeur moyenne des trous [m] 2.3"
  if (!result.profondeur_prevue) {
    const profOpts = isMultiColumn
      ? { minX: 100, refX }
      : { minX: 370 };
    const profMoy = findValueAtSameRow(allItems, /Profondeur\s+(?:moy(?:enne)?\s+des\s+trous)/i, profOpts);
    if (profMoy && /^[\d.]+$/.test(profMoy)) {
      result.profondeur_prevue = profMoy;
    }
  }

  // ── Drilling params (Page B) ─────────────────────────────────

  // Diameter: find the [mm] row value
  const diamOpts = isMultiColumn ? { minX: 100, refX } : {};
  const diamVal = findValueAtSameRow(allItems, /Diam[eè]tre\s+de\s+forage/i, diamOpts);
  if (diamVal && /^\d{2,3}$/.test(diamVal)) {
    result.diametre = diamVal;
  }
  // Fallback: pattern match from [mm] 51
  if (!result.diametre) {
    const diamFallback = extract(allSorted, /\[mm\]\s+(\d{2,3})\b/);
    if (diamFallback) result.diametre = diamFallback;
  }

  // Espacement
  if (isMultiColumn) {
    const espVal = findValueAtSameRow(allItems, /^Espacement$/i, { minX: 100, refX });
    if (espVal && /^[\d.]+$/.test(espVal)) result.espacement = espVal;
  } else {
    const espacementVal = findValueAtSameRow(allItems, /^Espacement$/i);
    if (espacementVal && /^[\d.]+$/.test(espacementVal)) {
      result.espacement = espacementVal;
    }
    if (!result.espacement) {
      const esp = extract(allSorted, /Espacement\s+\[m\]\s+([\d.]+)/i);
      if (esp) result.espacement = esp;
    }
  }

  // Fardeau (single-column tables only)
  if (!isMultiColumn) {
    const fardeauVal = findValueAtSameRow(allItems, /^Fardeau$/i);
    if (fardeauVal && /^[\d.]+$/.test(fardeauVal)) {
      result.fardeau = fardeauVal;
    }
    if (!result.fardeau) {
      const fard = extract(allSorted, /Fardeau\s+\[m\]\s+([\d.]+)/i);
      if (fard) result.fardeau = fard;
    }
  }

  // Sous-forage
  if (isMultiColumn) {
    const sfVal = findValueAtSameRow(allItems, /^Sous-forage$/i, { minX: 100, refX });
    if (sfVal && /^[\d.]+$/.test(sfVal)) result.sous_forage = sfVal;
  } else {
    const sousForVal = findValueAtSameRow(allItems, /^Sous-forage$/i);
    if (sousForVal && /^[\d.]+$/.test(sousForVal)) {
      result.sous_forage = sousForVal;
    }
    if (!result.sous_forage) {
      const sf = extract(allSorted, /Sous-forage\s+\[m\]\s+([\d.]+)/i);
      if (sf) result.sous_forage = sf;
    }
  }

  // Inclinaison
  if (/Vertical\s+\(90/i.test(allRaw)) result.inclinaison = '90';

  // ── Total explosive charge (Page B) ──────────────────────────
  if (isMultiColumn) {
    // For multi-column: use refX to select correct scenario column
    const ctVal = findValueAtSameRow(allItems, /Charge\s+explosive\s+totale/i, { minX: 100, refX });
    if (ctVal && /^\d+(\.\d+)?$/.test(ctVal)) result.total_explosif_kg = ctVal;
  } else {
    // Use position lookup: row "Charge explosive totale" → value at x > 400
    const chargeTotaleVal = findValueAtSameRow(
      allItems,
      /Charge\s+explosive\s+totale/i,
      { minX: 400 }
    );
    if (chargeTotaleVal && /^\d+(\.\d+)?$/.test(chargeTotaleVal)) {
      result.total_explosif_kg = chargeTotaleVal;
    }
    // Fallback pattern
    if (!result.total_explosif_kg) {
      const ctFallback = extract(allSorted, /Charge\s+explosive\s+totale\s+\[kg\]\s+(\d+)/i);
      if (ctFallback) result.total_explosif_kg = ctFallback;
    }
  }

  // ── Initiation system (Page B) ───────────────────────────────
  const sysMatch = allRaw.match(/(UNITRONIC|NONEL|i-kon|eDev|Daveytronic|EXEL)/i);
  if (sysMatch) {
    if (/UNITRONIC/i.test(sysMatch[1])) {
      result.type_detonateurs = 'Électronique (eDev)';
      result.detonateurs = 'UNITRONIC (Électronique)';
    } else if (/NONEL/i.test(sysMatch[1])) {
      result.type_detonateurs = 'Non-électrique (NONEL)';
      result.detonateurs = sysMatch[1];
    } else {
      result.detonateurs = sysMatch[1];
    }
  }

  // ── Number of detonators ─────────────────────────────────────
  if (isMultiColumn && refX !== null) {
    // For multi-column: use the scenario-specific charged hole counts at refX
    const COL_TOLERANCE = 40;
    const nbMasseLabelItem = allItems.find(it => /Nombre\s+de\s+trous\s+charg[eé]s/i.test(it.str));
    const nbBouchonLabelItem = allItems.find(it => /Trous\s+additionnels\s+charg[eé]s/i.test(it.str));

    if (nbMasseLabelItem) {
      const masseY = nbMasseLabelItem.y;
      // Use tight tolerance (4px) to avoid picking up charge totale row
      const masseRowItems = allItems
        .filter(it =>
          Math.abs(it.y - masseY) <= 4 &&
          it.x > 150 && /^\d+$/.test(it.str.trim())
        )
        .sort((a, b) => a.x - b.x);

      const masseAtRef = masseRowItems
        .filter(it => Math.abs(it.x - refX) <= COL_TOLERANCE)
        .sort((a, b) => Math.abs(a.x - refX) - Math.abs(b.x - refX))[0];

      let bouchonAtRef: PositionedItem | undefined;
      if (nbBouchonLabelItem) {
        const bouchonY = nbBouchonLabelItem.y;
        // Tight 4px tolerance to avoid bleeding into charge totale row
        const bouchonRowItems = allItems
          .filter(it =>
            Math.abs(it.y - bouchonY) <= 4 &&
            it.x > 150 && /^\d+$/.test(it.str.trim())
          )
          .sort((a, b) => a.x - b.x);
        bouchonAtRef = bouchonRowItems
          .filter(it => Math.abs(it.x - refX) <= COL_TOLERANCE)
          .sort((a, b) => Math.abs(a.x - refX) - Math.abs(b.x - refX))[0];
      }

      const masseCount = masseAtRef ? parseInt(masseAtRef.str) : 0;
      const bouchonCount = bouchonAtRef ? parseInt(bouchonAtRef.str) : 0;
      const nbDet = masseCount + bouchonCount;
      if (nbDet > 0) {
        result.nb_detonateurs = String(nbDet);
      }
    }

    // Fallback to page 1 hole counts (masse + bouchon)
    if (!result.nb_detonateurs) {
      const nbFromPage1 = tRousMasse + trousBouchon;
      if (nbFromPage1 > 0) result.nb_detonateurs = String(nbFromPage1);
    }
  } else {
    // Single-column: sum all charged holes
    const nbTrousRow = findAllValuesAtRow(allItems, /Nombre\s+de\s+trous\s+charg[eé]s/i, { minX: 360 });
    const bouchonRow = findAllValuesAtRow(allItems, /Trous\s+additionnels\s+charg[eé]s/i, { minX: 360 });

    const sumNums = (vals: string[]) => vals
      .map(v => parseInt(v) || 0)
      .reduce((a, b) => a + b, 0);

    const nbCharged = sumNums(nbTrousRow) + sumNums(bouchonRow);
    if (nbCharged > 0) {
      result.nb_detonateurs = String(nbCharged);
      if (!result.nb_trous) result.nb_trous = String(nbCharged);
    }
  }

  // ── Vibrations (Page D) ───────────────────────────────────────
  const ppv = parsePPV(allRaw);
  if (ppv.length > 0) {
    const maxPPV = Math.max(...ppv.map(v => v.value));
    const ppvStr = ppv
      .map(v => v.label && v.label !== 'P' ? `${v.label}: ${v.value}` : `${v.value}`)
      .join(', ');
    result.vibrations_ppv = `${maxPPV} (max) — ${ppvStr} mm/s`;
  }

  // ── Firing sequence (Page C) ─────────────────────────────────
  const isoMatch = allRaw.match(/ISO\s+CONTOUR\s+(\d+)\s*MS/i);
  if (isoMatch) result.sequence_delais = `ISO Contour ${isoMatch[1]}ms`;

  // ── Personnel ─────────────────────────────────────────────────
  const personnel = extractPersonnel(pages);

  if (personnel.verifiePar) result.superviseur = personnel.verifiePar;

  // Drawing number
  const dessinNo = extract(allRaw, /(\d{7}-\d{6}-[\dA-Z]+-DWG-\d{4})/)
    || extract(allSorted, /(\d{7}-\d{6}-[\dA-Z]+-DWG-\d{4})/);

  const notes: string[] = [];
  if (personnel.concuPar) notes.push(`Conçu par: ${personnel.concuPar}`);
  if (personnel.dessinePar) notes.push(`Dessiné par: ${personnel.dessinePar}`);
  if (personnel.verifiePar) notes.push(`Vérifié par: ${personnel.verifiePar}`);
  if (personnel.approuvePar) notes.push(`Approuvé par: ${personnel.approuvePar}`);
  if (dessinNo) notes.push(`Plan de tir: ${dessinNo.trim()}`);
  if (notes.length > 0) result.remarques = notes.join('\n');

  // ── Explosifs (Page B) ────────────────────────────────────────
  const explosifs = parseBenchExplosives(allRaw, allSorted, allItems, totalHoles, isMultiColumn, refX);
  if (explosifs.length > 0) result._explosifs = explosifs;

  result._warnings = warnings;
  return result;
}

/** Parse explosive products from bench plan Page B */
function parseBenchExplosives(
  allRaw: string,
  allSorted: string,
  allItems: PositionedItem[],
  nbChargedTotal: number = 0,
  isMultiColumn: boolean = false,
  refX: number | null = null
): ExplosifRow[] {
  const explosifs: ExplosifRow[] = [];

  // Build map of explosif index → properties by finding labelled rows
  const explMap = new Map<string, { type: string; diametre: string; poids: string }>();

  if (isMultiColumn && refX !== null) {
    // Multi-column table: find explosif type/diameter/weight for each explosif index
    const COL_TOLERANCE = 40;

    for (let i = 1; i <= 4; i++) {
      const typeLabelItem = allItems.find(it => new RegExp(`Type\\s+Explosif\\s+${i}\\b`, 'i').test(it.str));
      if (!typeLabelItem) continue;

      // Find type name at refX
      const typeY = typeLabelItem.y;
      const typeItems = allItems.filter(it =>
        Math.abs(it.y - typeY) <= 6 && it.x > 100 &&
        Math.abs(it.x - refX) <= COL_TOLERANCE &&
        /powerditch|powerfrac|powergel|senatel|dynomax|riobel/i.test(it.str)
      );
      const typeAtRef = typeItems.length > 0
        ? [...typeItems].sort((a, b) => Math.abs(a.x - refX) - Math.abs(b.x - refX))[0]
        : null;

      if (!typeAtRef) continue; // Not used in this scenario column

      const typeName = typeAtRef.str.trim();

      // Diameter
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
        const diamAtRef = [...diamItems].sort((a, b) =>
          Math.abs(a.x - refX) - Math.abs(b.x - refX)
        )[0];
        diameter = diamAtRef?.str.trim() || '';
      }

      // Weight
      let weight = '';
      const explosifSubItem = allItems.find(it =>
        new RegExp(`^Explosif\\s+${i}$`, 'i').test(it.str.trim()) &&
        it.y < typeY && (typeY - it.y) <= 50
      );
      if (explosifSubItem) {
        const subY = explosifSubItem.y;
        const kgUnItem = allItems.find(it =>
          Math.abs(it.y - subY) <= 8 && /\[kg\/un\]/i.test(it.str)
        );
        if (kgUnItem) {
          const weightY = kgUnItem.y;
          const weightItems = allItems.filter(it =>
            Math.abs(it.y - weightY) <= 4 && it.x > kgUnItem.x &&
            Math.abs(it.x - refX) <= COL_TOLERANCE &&
            /^[\d.]+$/.test(it.str.trim()) && parseFloat(it.str) < 5
          );
          const weightAtRef = [...weightItems].sort((a, b) =>
            Math.abs(a.x - refX) - Math.abs(b.x - refX)
          )[0];
          weight = weightAtRef?.str.trim() || '';
        }
      }

      // Fallback weight: scan nearby rows for decimal values at refX
      if (!weight) {
        const nearbyWeightItems = allItems.filter(it =>
          it.y < typeY && (typeY - it.y) <= 80 && it.x > 100 &&
          Math.abs(it.x - refX) <= COL_TOLERANCE &&
          /^0?\.\d+$|^\d\.\d+$/.test(it.str.trim()) &&
          parseFloat(it.str) < 2
        );
        const weightAtRef = [...nearbyWeightItems]
          .sort((a, b) => Math.abs(a.x - refX) - Math.abs(b.x - refX))[0];
        weight = weightAtRef?.str.trim() || '';
      }

      explMap.set(String(i), { type: typeName, diametre: diameter, poids: weight });
    }
  } else {
    // Single-column table (DWG-3018 style)

    // Diameter rows: "Diamètre - Explosif N [mm] 32"
    for (const m of allRaw.matchAll(/Diam[eè]tre\s*-\s*Explosif\s+(\d+)[^[]*\[mm\]\s+(\d+)/gi)) {
      const idx = m[1];
      if (!explMap.has(idx)) explMap.set(idx, { type: '', diametre: m[2], poids: '' });
      else explMap.get(idx)!.diametre = m[2];
    }
    // Fallback: positional
    for (let i = 1; i <= 3; i++) {
      const val = findValueAtSameRow(allItems, new RegExp(`Diam[eè]tre\\s*-\\s*Explosif\\s+${i}`, 'i'));
      if (val && /^\d+$/.test(val)) {
        if (!explMap.has(String(i))) explMap.set(String(i), { type: '', diametre: val, poids: '' });
        else if (!explMap.get(String(i))!.diametre) explMap.get(String(i))!.diametre = val;
      }
    }

    // Weight rows: "Poids unitaire / bâton - Explosif N [kg/un] 0.22"
    for (const m of allRaw.matchAll(/Poids\s+unitaire[^-]*-\s*Explosif\s+(\d+)[^[]*\[kg\/un\]\s+([\d.]+)/gi)) {
      const idx = m[1];
      if (!explMap.has(idx)) explMap.set(idx, { type: '', diametre: '', poids: m[2] });
      else explMap.get(idx)!.poids = m[2];
    }

    // Product type names
    for (const m of allRaw.matchAll(/Type\s+Explosif\s+(\d+)[^a-z]*(Powerditch|PowerDitch|PowerFrac|Powergel|Senatel|Dynomax|RIOBEL)[^\n]*/gi)) {
      const idx = m[1];
      if (!explMap.has(idx)) explMap.set(idx, { type: m[2], diametre: '', poids: '' });
      else if (!explMap.get(idx)!.type) explMap.get(idx)!.type = m[2];
    }
    // Additional: look for product names that follow "Type Explosif N" in sorted text
    for (const m of allSorted.matchAll(/Type\s+Explosif\s+(\d+)\s+(Powerditch|PowerDitch|PowerFrac|Powergel|Senatel|Dynomax)/gi)) {
      const idx = m[1];
      if (!explMap.has(idx)) explMap.set(idx, { type: m[2], diametre: '', poids: '' });
      else if (!explMap.get(idx)!.type) explMap.get(idx)!.type = m[2];
    }
  } // end single-column else block

  // Nb trous charged by type (for single-column only; multi-column uses nbChargedTotal)
  let nbForExplosifs = nbChargedTotal;
  if (!isMultiColumn) {
    const nbTrousRow = findAllValuesAtRow(allItems, /Nombre\s+de\s+trous\s+charg[eé]s/i, { minX: 360 });
    const bouchonRow = findAllValuesAtRow(allItems, /Trous\s+additionnels\s+charg[eé]s/i, { minX: 360 });
    const nbMasseTampon = nbTrousRow.map(v => parseInt(v) || 0).reduce((a, b) => a + b, 0);
    const nbBouchon = bouchonRow.map(v => parseInt(v) || 0).reduce((a, b) => a + b, 0);
    if (nbMasseTampon + nbBouchon > 0) nbForExplosifs = nbMasseTampon + nbBouchon;
  }

  // QTY per hole for masse column (single-column only)
  const qtyMap = new Map<string, string[]>();
  if (!isMultiColumn) {
    for (const m of allRaw.matchAll(/QTY\s+Explosif\s+(\d+)\s+\[un\]\s+([\d.\s]+)/gi)) {
      const idx = m[1];
      const vals = m[2].trim().split(/\s+/).filter(v => /^[\d.]+$/.test(v));
      qtyMap.set(idx, vals);
    }
    // Fallback positional for QTY
    for (let i = 1; i <= 2; i++) {
      if (!qtyMap.has(String(i))) {
        const vals = findAllValuesAtRow(allItems, new RegExp(`QTY\\s+Explosif\\s+${i}`, 'i'), { minX: 380 });
        if (vals.length > 0) qtyMap.set(String(i), vals);
      }
    }
  }

  // Build ExplosifRow entries
  const sortedKeys = [...explMap.keys()].sort();
  for (const idx of sortedKeys) {
    const e = explMap.get(idx)!;
    if (!e.diametre && !e.type && !e.poids) continue;

    const qtyVals = qtyMap.get(idx) || [];
    // Masse column: skip first value if it's 0 or 1 (cut column), take highest non-zero
    const massQty = qtyVals.length >= 2
      ? qtyVals[1]
      : (qtyVals[0] || '');

    const nbTrous = nbForExplosifs > 0 ? String(nbForExplosifs) : '';

    const typeName = e.type
      ? `${e.type}${e.diametre ? ` ${e.diametre}mm` : ''}`
      : `Explosif ${idx}${e.diametre ? ` ${e.diametre}mm` : ''}`;

    const fabricant = detectFabricant(e.type);

    const exp: ExplosifRow = {
      id: `parsed-exp-${idx}-${Date.now()}`,
      type: /powerditch|powerfrac/i.test(e.type) ? 'Émulsion en cartouche' : 'Autre',
      fabricant: fabricant ? `${fabricant} — ${typeName}` : typeName,
      lot: '',
      quantite_par_trou: massQty || e.poids,
      nb_trous: nbTrous,
      total_kg: '',
      unite: 'kg'
    };

    if (exp.quantite_par_trou && nbTrous) {
      const qty = parseFloat(exp.quantite_par_trou);
      const nb = parseInt(nbTrous);
      if (!isNaN(qty) && !isNaN(nb)) {
        exp.total_kg = (qty * nb).toFixed(2);
      }
    }

    explosifs.push(exp);
  }

  // Fallback: if no explosifs found but we have charge total, create generic entry
  if (explosifs.length === 0) {
    const chargeTotal = extract(allSorted, /Charge\s+explos(?:ive|ifs?)\s+totale?\s+\[kg\]\s+(\d+(?:\.\d+)?)/i)
      || findValueAtSameRow(allItems, /Charge\s+explosive\s+totale/i, { minX: 400 });
    if (chargeTotal) {
      explosifs.push({
        id: `parsed-exp-generic-${Date.now()}`,
        type: 'Émulsion en cartouche',
        fabricant: 'Dyno Nobel',
        lot: '',
        quantite_par_trou: '',
        nb_trous: '',
        total_kg: chargeTotal,
        unite: 'kg'
      });
    }
  }

  return explosifs;
}

function detectFabricant(typeName: string): string {
  if (!typeName) return '';
  if (/powerditch|powerfrac|dyno/i.test(typeName)) return 'Dyno Nobel';
  if (/senatel|orica/i.test(typeName)) return 'Orica';
  if (/riobel|austin/i.test(typeName)) return 'Austin Powder';
  if (/emulex|maxam/i.test(typeName)) return 'Maxam';
  return '';
}

// ─── Tunnel Plan Parser ─────────────────────────────────────────────────────

function parseTunnelPlan(
  pages: PageText[]
): Partial<JournalTir> & { _explosifs?: ExplosifRow[]; _warnings?: string[] } {
  const allRaw = pages.map(p => p.rawText).join('\n\n');
  const allSorted = pages.map(p => p.sortedText).join('\n\n');
  const allItems = pages.flatMap(p => p.items);
  const result: Partial<JournalTir> & { _explosifs?: ExplosifRow[]; _warnings?: string[] } = {};
  const warnings: string[] = [];

  // Station
  const stationMatch = allRaw.match(/STATION\s+([\w\s]+?)[\s–\-]+LOT\s+(\w+)/i);
  if (stationMatch) {
    result.station = stationMatch[1].trim().toUpperCase();
    result.contrat = stationMatch[2].trim();
    result.chantier = `Station ${result.station}`;
  }

  // Shot ID
  const sdMatch = allRaw.match(/(SD\d+)\s*\((?:FULL|DEMI)\s+FACE\)/i);
  if (sdMatch) result.numero_tir = sdMatch[0].trim();

  // Date
  const date = extractDate(pages);
  if (date) result.date_tir = date;

  result.type_tir = 'Tunnel';

  // Hole counts
  const trousMasse = parseInt(extract(allRaw, /(\d+)\s+trous?\s+de\s+masse/i) || '0');
  const trousPerimet = parseInt(extract(allRaw, /(\d+)\s+trous?\s+p[eé]rim[eé]triques?/i) || '0');
  const trousLifters = parseInt(extract(allRaw, /(\d+)\s+trous?\s+lifters?/i) || '0');
  const trousMasseAllege = parseInt(extract(allRaw, /(\d+)\s+trous?\s+de\s+masse\s+all[eé]g[eé]s?/i) || '0');
  const total = trousMasse + trousPerimet + trousLifters + trousMasseAllege;
  if (total > 0) result.nb_trous = String(total);

  // Advance length
  const avancee = extract(allRaw, /avanc[eé]e[^:]*:\s*([\d.]+)\s*m/i)
    || findValueAtSameRow(allItems, /Longueur\s+d.avanc[eé]e/i);
  if (avancee && /^[\d.]+$/.test(avancee)) result.profondeur_prevue = avancee;

  // Diameter
  const diam = extract(allSorted, /\[mm\]\s+(51|76|102|64|38|45)/i);
  if (diam) result.diametre = diam;

  // Personnel
  const personnel = extractPersonnel(pages);
  if (personnel.verifiePar) result.superviseur = personnel.verifiePar;

  const dessinNo = extract(allRaw, /(\d{7}-\d{6}-[\dA-Z]+-DWG-\d{4})/);
  const notes: string[] = [];
  if (personnel.concuPar) notes.push(`Conçu par: ${personnel.concuPar}`);
  if (dessinNo) notes.push(`Plan de tir: ${dessinNo.trim()}`);
  if (notes.length > 0) result.remarques = notes.join('\n');

  // ISO contour
  const isoMatch = allRaw.match(/ISO[- ]CONTOURS?\s+\((\d+)MS\)/i);
  if (isoMatch) result.sequence_delais = `ISO Contour ${isoMatch[1]}ms`;

  warnings.push('Tunnel full face: tableau de chargement absent — explosifs à saisir manuellement');
  result._warnings = warnings;
  return result;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * Parse a blast plan PDF and return a partial JournalTir for form pre-filling.
 *
 * @param file - PDF File object from a file input
 * @returns ParsedBlastPlan with journalData and metadata
 */
export async function parseBlastPlanPDF(file: File): Promise<ParsedBlastPlan> {
  const pages = await extractAllPages(file);
  const allRaw = pages.map(p => p.rawText).join('\n\n');

  const documentType = detectDocumentType(allRaw);

  let raw: Partial<JournalTir> & { _explosifs?: ExplosifRow[]; _warnings?: string[] };
  if (documentType === 'tunnel_advance') {
    raw = parseTunnelPlan(pages);
  } else {
    raw = parseBenchPlan(pages);
  }

  const explosifs = raw._explosifs || [];
  const warnings = raw._warnings || [];
  const { _explosifs, _warnings, ...journalData } = raw;

  if (explosifs.length > 0) {
    journalData.explosifs = explosifs;
  }

  const dessinNo = extract(allRaw, /(\d{7}-\d{6}-[\dA-Z]+-DWG-\d{4})/) || '';

  // Count extracted fields
  let fieldsExtracted = 0;
  const countableFields: Array<keyof JournalTir> = [
    'numero_tir', 'date_tir', 'station', 'chantier', 'contrat', 'type_tir',
    'nb_trous', 'profondeur_prevue', 'diametre', 'espacement', 'fardeau',
    'sous_forage', 'inclinaison', 'detonateurs', 'type_detonateurs',
    'nb_detonateurs', 'total_explosif_kg', 'vibrations_ppv', 'sequence_delais',
    'superviseur', 'remarques'
  ];
  for (const f of countableFields) {
    const val = journalData[f];
    if (val && String(val).length > 0) fieldsExtracted++;
  }
  if (explosifs.length > 0) fieldsExtracted += explosifs.length;

  return {
    journalData,
    fieldsExtracted,
    documentType,
    dessinNo,
    warnings
  };
}

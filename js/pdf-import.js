/**
 * pdf-import.js — Journal de Tir PLB
 * PDF.js file import handler
 * Handles file input, drag-and-drop, and text extraction via PDF.js
 */

import { parsePDFText } from './parser.js';

let pdfjsLib = null;

/**
 * Initialize PDF.js with the local worker
 */
export async function initPDFJS() {
  if (pdfjsLib) return pdfjsLib;
  try {
    const mod = await import('../lib/pdf.min.mjs');
    pdfjsLib = mod;
    // Use local worker for offline/PWA support
    pdfjsLib.GlobalWorkerOptions.workerSrc = './lib/pdf.worker.min.mjs';
    console.log('PDF.js initialized, version:', pdfjsLib.version || '4.0.379');
    return pdfjsLib;
  } catch (err) {
    console.error('Failed to load PDF.js:', err);
    throw new Error('PDF.js non disponible. Vérifiez que lib/pdf.min.mjs est présent.');
  }
}

/**
 * Encode a PDF row's items as an X-position annotated string.
 * Format per row: "x1\tstr1\tx2\tstr2\t..." followed by newline.
 * Items within a row are sorted left-to-right by X.
 * This allows the parser to match column values by X-position proximity.
 *
 * Additionally, a human-readable version (items joined with spaces) is available
 * for all the standard regex-based parsing that does not need column awareness.
 */
function encodeRow(items) {
  // items is already sorted by x ascending
  return items.map(it => `${Math.round(it.x)}\t${it.str}`).join('\t');
}

/**
 * Extract text from a PDF File object using PDF.js
 * Returns a structured text string with X-position metadata for column-aware parsing.
 */
export async function extractTextFromPDF(file) {
  if (!file) throw new Error('Aucun fichier fourni');
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Veuillez sélectionner un fichier PDF.');
  }

  const lib = await initPDFJS();
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Group items into visual rows by Y position (within 3 units tolerance),
    // then sort each row left-to-right by X.
    // This correctly handles multi-column PDFs where labels and values
    // are in separate column blocks processed in non-visual order by pdfjs.
    const rows = [];
    for (const item of textContent.items) {
      if (!item.str.trim()) continue;
      const y = item.transform[5];
      const x = item.transform[4];
      let row = rows.find(r => Math.abs(r.y - y) <= 3);
      if (!row) { row = { y, items: [] }; rows.push(row); }
      row.items.push({ x, str: item.str });
    }
    rows.sort((a, b) => b.y - a.y); // top of page first (higher Y = higher on page)
    let lastRowY = null;
    let pageText = '';

    for (const row of rows) {
      if (lastRowY !== null && Math.abs(row.y - lastRowY) > 10) pageText += '\n';
      row.items.sort((a, b) => a.x - b.x);

      // Each row is encoded as tab-separated X/text pairs for column-aware parsing
      // followed by a plain-text version (space-joined) that regex patterns can use.
      // Format: "XPOS\ttext1\tXPOS\ttext2\t...\n"
      pageText += encodeRow(row.items) + '\n';
      lastRowY = row.y;
    }
    fullText += pageText + '\n';
  }

  if (!fullText.trim() || fullText.trim().length < 10) {
    throw new Error('Aucun texte extrait du PDF. Ce fichier est peut-être une image scannée (non supporté).');
  }

  return fullText;
}

/**
 * Full pipeline: file → PDF.js → parser → result object
 */
export async function importPDFFile(file, onProgress) {
  onProgress?.('Lecture du fichier…');
  const text = await extractTextFromPDF(file);
  onProgress?.('Analyse du plan de sautage…');
  const result = parsePDFText(text);
  return { text, result };
}

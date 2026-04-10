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
 * Extract text from a PDF File object using PDF.js
 * Returns the raw text string
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
    // Preserve spatial layout by adding newlines for y-position changes
    let lastY = null;
    let pageText = '';
    for (const item of textContent.items) {
      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
        pageText += '\n';
      }
      pageText += item.str + ' ';
      lastY = item.transform[5];
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

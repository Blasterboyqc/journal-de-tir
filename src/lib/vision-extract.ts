/**
 * vision-extract.ts
 *
 * Client-side Vision AI integration for Journal de Tir.
 *
 * Responsibilities:
 * 1. Extract a specific page from a PDF file as a high-quality base64 JPEG
 *    using pdfjs-dist + HTMLCanvasElement (browser environment)
 * 2. Send the image to the Vision AI API endpoint
 * 3. Return structured firing sequence data (holes, connections, metadata)
 *
 * Page C (firing sequence diagram) is typically page index 2 (3rd page, 0-indexed)
 * in the 4-page blast plan PDFs used by this project.
 */

import type { FiringSequence } from '$lib/db';

// ─── Configuration ─────────────────────────────────────────────────────────────

/**
 * The Vision AI API endpoint.
 * Override with VITE_VISION_API_URL environment variable for different environments.
 *
 * Production: https://journal-tir-api.vercel.app/api/vision-extract
 * Development: http://localhost:3000/api/vision-extract
 */
export const VISION_API_URL: string =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_VISION_API_URL) ||
  'https://journal-tir-api.vercel.app/api/vision-extract';

/**
 * Page index for the firing sequence page (Page C).
 * 0-indexed: 0=A, 1=B, 2=C (firing sequence), 3=D
 */
export const FIRING_SEQUENCE_PAGE_INDEX = 2;

/**
 * Render scale for PDF to canvas.
 * Higher = better quality but larger file size.
 * 2.5x is a good balance for Vision AI accuracy.
 */
export const PDF_RENDER_SCALE = 2.5;

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface VisionAPIRequest {
  image: string;       // base64 image data
  imageType: string;   // MIME type
  shotInfo?: {
    tirNumber?: number;
    banquette?: number;
    totalHoles?: number;
  };
}

export interface VisionAPIResponse {
  success: boolean;
  holes: Array<{
    id: number;
    x: number;
    y: number;
    delay_ms: number;
    type?: 'bouchon' | 'masse' | 'tampon';
  }>;
  connections: Array<{ from: number; to: number }>;
  metadata: {
    totalHolesDetected: number;
    delayRange: { min: number; max: number };
    confidence: number;
    model: string;
    processingTimeMs: number;
  };
  error?: string;
}

export interface ExtractResult {
  firingSequence: FiringSequence;
  pageImageBase64: string;  // The rendered page image (for preview)
}

// ─── PDF Page Rendering ────────────────────────────────────────────────────────

/**
 * Renders a specific page from a PDF File to a base64-encoded JPEG.
 * Uses pdfjs-dist with the browser's canvas element.
 *
 * @param file       The PDF File object
 * @param pageIndex  0-based page index (default: 2 = Page C)
 * @param scale      Rendering scale factor (default: 2.5 for ~550 DPI effective)
 * @returns          Base64 JPEG string and MIME type
 */
export async function renderPdfPageToBase64(
  file: File,
  pageIndex: number = FIRING_SEQUENCE_PAGE_INDEX,
  scale: number = PDF_RENDER_SCALE
): Promise<{ base64: string; imageType: string; width: number; height: number }> {
  // Dynamic import pdfjs-dist (it's already installed in the project)
  const pdfjsLib = await import('pdfjs-dist');

  // Configure worker (same pattern as pdf-parser.ts)
  const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  // Load the PDF
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    // Disable verbose logging
    verbosity: 0,
  }).promise;

  if (pageIndex >= pdfDoc.numPages) {
    throw new Error(
      `Page index ${pageIndex} out of range. PDF has ${pdfDoc.numPages} pages.`
    );
  }

  // Get the target page (pdfjs is 1-indexed)
  const page = await pdfDoc.getPage(pageIndex + 1);

  // Create a viewport at the desired scale
  const viewport = page.getViewport({ scale });

  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('Failed to get 2D canvas context');
  }

  // White background (PDF pages are typically white)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Render the PDF page into the canvas
  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  // Convert canvas to JPEG base64
  // Quality 0.92 = high quality, good for Vision AI
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

  // Extract base64 part (remove "data:image/jpeg;base64," prefix)
  const base64 = dataUrl.split(',')[1];

  return {
    base64,
    imageType: 'image/jpeg',
    width: canvas.width,
    height: canvas.height,
  };
}

// ─── Vision API Call ───────────────────────────────────────────────────────────

/**
 * Calls the Vision AI API with a base64 image.
 *
 * @param request  The API request with image and optional shot info
 * @param apiUrl   Optional override for the API URL
 * @returns        The parsed API response
 */
export async function callVisionAPI(
  request: VisionAPIRequest,
  apiUrl: string = VISION_API_URL
): Promise<VisionAPIResponse> {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(120_000), // 2 minute timeout for AI processing
  });

  let data: VisionAPIResponse;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error(`API returned invalid JSON (status ${response.status})`);
  }

  if (!response.ok) {
    throw new Error(data.error || `API error: HTTP ${response.status}`);
  }

  if (!data.success) {
    throw new Error(data.error || 'Vision API returned success: false');
  }

  return data;
}

// ─── Main Extraction Function ─────────────────────────────────────────────────

/**
 * Full extraction pipeline:
 * 1. Renders Page C from the PDF to a JPEG image
 * 2. Sends to Vision AI API
 * 3. Returns structured FiringSequence data
 *
 * @param file       The PDF File object (blast plan)
 * @param shotInfo   Optional hints for the AI (total holes, tir number, etc.)
 * @param apiUrl     Optional override for the API URL
 * @returns          ExtractResult with FiringSequence and page image
 */
export async function extractFiringSequence(
  file: File,
  shotInfo?: VisionAPIRequest['shotInfo'],
  apiUrl?: string
): Promise<ExtractResult> {
  // Step 1: Render Page C to image
  const imageData = await renderPdfPageToBase64(
    file,
    FIRING_SEQUENCE_PAGE_INDEX,
    PDF_RENDER_SCALE
  );

  // Step 2: Call Vision API
  const apiResponse = await callVisionAPI(
    {
      image: imageData.base64,
      imageType: imageData.imageType,
      shotInfo,
    },
    apiUrl
  );

  // Step 3: Build FiringSequence from API response
  const firingSequence: FiringSequence = {
    holes: apiResponse.holes,
    connections: apiResponse.connections,
    extractedAt: new Date().toISOString(),
    confidence: apiResponse.metadata?.confidence,
    model: apiResponse.metadata?.model,
    totalHolesDetected: apiResponse.metadata?.totalHolesDetected,
    delayRange: apiResponse.metadata?.delayRange,
  };

  return {
    firingSequence,
    pageImageBase64: imageData.base64,
  };
}

// ─── Utility Functions ─────────────────────────────────────────────────────────

/**
 * Groups holes by delay value for display purposes.
 * Returns a map of delay_ms → hole IDs.
 */
export function groupHolesByDelay(
  holes: FiringSequence['holes']
): Map<number, number[]> {
  const groups = new Map<number, number[]>();
  for (const hole of holes) {
    const key = hole.delay_ms;
    const existing = groups.get(key) ?? [];
    existing.push(hole.id);
    groups.set(key, existing);
  }
  // Sort by delay
  return new Map([...groups.entries()].sort((a, b) => a[0] - b[0]));
}

/**
 * Formats a delay value in milliseconds to a readable string.
 * e.g. 0 → "0 ms", 1500 → "1 500 ms", 2500 → "2 500 ms"
 */
export function formatDelay(ms: number): string {
  if (ms < 0) return '? ms';
  if (ms === 0) return '0 ms';
  return `${ms.toLocaleString('fr-CA')} ms`;
}

/**
 * Returns a summary string for the firing sequence.
 * e.g. "121 trous, délais 0–2500 ms, confiance 87%"
 */
export function summarizeFiringSequence(seq: FiringSequence): string {
  const parts: string[] = [];

  const count = seq.totalHolesDetected ?? seq.holes.length;
  parts.push(`${count} trou${count !== 1 ? 's' : ''}`);

  if (seq.delayRange) {
    parts.push(`délais ${seq.delayRange.min}–${seq.delayRange.max} ms`);
  }

  if (seq.confidence !== undefined) {
    parts.push(`confiance ${Math.round(seq.confidence * 100)}%`);
  }

  return parts.join(', ');
}

/**
 * Checks if the PDF file likely has a firing sequence page (Page C).
 * A quick heuristic: 4-page PDFs are bench blast plans with A/B/C/D pages.
 *
 * @param pdfFile  The PDF file to check
 * @returns        true if the PDF appears to have a Page C
 */
export async function pdfHasFiringSequencePage(pdfFile: File): Promise<boolean> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      verbosity: 0,
    }).promise;

    // Bench blast plans have 4 pages (A, B, C, D)
    // Tunnel advance plans have 3 pages
    return pdfDoc.numPages >= 3;
  } catch {
    return false;
  }
}

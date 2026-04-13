/**
 * vision-extract.ts
 *
 * Client-side Vision AI integration for Journal de Tir.
 * Calls Google Gemini API directly from the browser (no backend needed).
 *
 * Responsibilities:
 * 1. Extract a specific page from a PDF file as a high-quality base64 JPEG
 *    using pdfjs-dist + HTMLCanvasElement (browser environment)
 * 2. Send the image directly to Google Gemini Vision API
 * 3. Return structured firing sequence data (holes, connections, metadata)
 *
 * Page C (firing sequence diagram) is typically page index 2 (3rd page, 0-indexed)
 * in the 4-page blast plan PDFs used by this project.
 */

import type { FiringSequence } from '$lib/db';
import { getProfil } from '$lib/db';

// ─── Configuration ─────────────────────────────────────────────────────────────

/**
 * Gemini API endpoint (REST, no SDK needed).
 * Uses gemini-2.0-flash which is fast, free tier, and handles images well.
 */
export const GEMINI_API_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

// ─── Gemini Vision API Call ────────────────────────────────────────────────────

/**
 * Tries to extract a JSON object from text that may contain markdown code fences.
 * Gemini sometimes wraps JSON in ```json ... ``` blocks.
 */
function extractJsonFromText(text: string): string {
  // Try to extract from markdown code block
  const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (markdownMatch) {
    return markdownMatch[1].trim();
  }
  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  return text.trim();
}

/**
 * Calls Google Gemini Vision API directly from the browser.
 * API key is fetched from the user's profile in IndexedDB.
 *
 * @param base64Image   Base64-encoded image data (without data: prefix)
 * @param imageType     MIME type (e.g. 'image/jpeg')
 * @param apiKey        Gemini API key from profile
 * @param shotInfo      Optional context about the shot
 * @returns             Parsed VisionAPIResponse
 */
export async function callGeminiVisionAPI(
  base64Image: string,
  imageType: string,
  apiKey: string,
  shotInfo?: VisionAPIRequest['shotInfo']
): Promise<VisionAPIResponse> {
  const startTime = Date.now();

  const prompt = `Analyze this blast plan firing sequence diagram. Extract all drill holes with their positions and delay times.

Return a JSON object with this exact structure:
{
  "holes": [
    {"id": 1, "x": 0.15, "y": 0.3, "delay_ms": 0, "type": "bouchon"},
    {"id": 2, "x": 0.25, "y": 0.3, "delay_ms": 25, "type": "masse"}
  ],
  "connections": [
    {"from": 1, "to": 2}
  ],
  "metadata": {
    "totalHolesDetected": 144,
    "delayRange": {"min": 0, "max": 500},
    "confidence": 0.85,
    "model": "gemini-2.0-flash"
  }
}

Rules:
- x and y are normalized coordinates (0.0 to 1.0) representing position on the diagram
- delay_ms is the firing delay in milliseconds
- type can be: "bouchon" (buffer/contour holes), "masse" (production holes), "tampon" (cushion holes)
- connections show the firing sequence order (which hole fires after which)
- Include ALL holes visible in the diagram
- If delay values are shown on the diagram, use those exact values
- If hole numbers are visible, use those as IDs

${shotInfo ? `Additional context: Tir #${shotInfo.tirNumber || ''}, Banquette ${shotInfo.banquette || ''}, Expected ~${shotInfo.totalHoles || ''} holes` : ''}

Return ONLY the JSON object, no markdown, no explanation.`;

  const response = await fetch(
    `${GEMINI_API_BASE}?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: imageType,
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192
        }
      }),
      signal: AbortSignal.timeout(120_000), // 2 minute timeout
    }
  );

  if (!response.ok) {
    let errorMsg = `Gemini API error: HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData?.error?.message || errorMsg;
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMsg);
  }

  const geminiData = await response.json();

  // Extract the text content from Gemini response
  const textContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error('Gemini returned empty response');
  }

  // Parse JSON from response (handle possible markdown wrapping)
  let parsedData: any;
  try {
    const jsonText = extractJsonFromText(textContent);
    parsedData = JSON.parse(jsonText);
  } catch {
    throw new Error(`Gemini response is not valid JSON: ${textContent.substring(0, 200)}`);
  }

  const processingTimeMs = Date.now() - startTime;

  // Build VisionAPIResponse from Gemini parsed data
  const holes = Array.isArray(parsedData.holes) ? parsedData.holes : [];
  const connections = Array.isArray(parsedData.connections) ? parsedData.connections : [];
  const metadata = parsedData.metadata || {};

  const delayValues = holes.map((h: any) => h.delay_ms).filter((d: any) => typeof d === 'number');
  const delayRange = delayValues.length > 0
    ? { min: Math.min(...delayValues), max: Math.max(...delayValues) }
    : { min: 0, max: 0 };

  return {
    success: true,
    holes,
    connections,
    metadata: {
      totalHolesDetected: metadata.totalHolesDetected ?? holes.length,
      delayRange: metadata.delayRange ?? delayRange,
      confidence: metadata.confidence ?? 0.8,
      model: metadata.model ?? 'gemini-2.0-flash',
      processingTimeMs,
    },
  };
}

// ─── Main Extraction Function ─────────────────────────────────────────────────

/**
 * Full extraction pipeline:
 * 1. Gets Gemini API key from profile (IndexedDB)
 * 2. Renders Page C from the PDF to a JPEG image
 * 3. Sends to Gemini Vision API directly
 * 4. Returns structured FiringSequence data
 *
 * @param file       The PDF File object (blast plan)
 * @param shotInfo   Optional hints for the AI (total holes, tir number, etc.)
 * @returns          ExtractResult with FiringSequence and page image
 * @throws           Error with user-friendly message if no API key set
 */
export async function extractFiringSequence(
  file: File,
  shotInfo?: VisionAPIRequest['shotInfo']
): Promise<ExtractResult> {
  // Step 1: Get the Gemini API key from profile
  const profil = await getProfil();
  const apiKey = profil?.gemini_api_key?.trim();

  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  // Step 2: Render Page C to image
  const imageData = await renderPdfPageToBase64(
    file,
    FIRING_SEQUENCE_PAGE_INDEX,
    PDF_RENDER_SCALE
  );

  // Step 3: Call Gemini Vision API directly
  const apiResponse = await callGeminiVisionAPI(
    imageData.base64,
    imageData.imageType,
    apiKey,
    shotInfo
  );

  // Step 4: Build FiringSequence from API response
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

<script lang="ts">
  // DrillPatternEditor — Smart drill pattern editor for Page 2 — Plan de tir
  // Supports: tap-to-place (manual), templates, and Gemini Vision AI photo import
  // v2: Mobile-first UX with bottom sheet editor, move mode, bigger targets

  import { onMount } from 'svelte';
  import { getProfil, type DrillHole, type DrillConnection } from '$lib/db';

  let {
    holes = $bindable<DrillHole[]>([]),
    connections = $bindable<DrillConnection[]>([]),
    dataurl = $bindable(''),
    readonly = false,
  }: {
    holes?: DrillHole[];
    connections?: DrillConnection[];
    dataurl?: string;
    readonly?: boolean;
  } = $props();

  // ── Input mode ─────────────────────────────────────────────────────────────
  type InputMode = 'none' | 'manual' | 'template' | 'photo';
  let inputMode = $state<InputMode>('none');

  // ── Editor state ───────────────────────────────────────────────────────────
  let selectedHoleId = $state<number | null>(null);
  let editingHole = $state<DrillHole | null>(null);
  let showEditPanel = $state(false);

  // ── Move mode ──────────────────────────────────────────────────────────────
  let moveMode = $state(false);
  let movingHoleId = $state<number | null>(null);

  // ── Ripple feedback ────────────────────────────────────────────────────────
  let rippleX = $state(0);
  let rippleY = $state(0);
  let showRipple = $state(false);
  let rippleTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Template state ─────────────────────────────────────────────────────────
  type TemplateType = 'ligne' | 'grille' | 'vcut' | 'echelon';
  let templateType = $state<TemplateType>('grille');
  let templateRows = $state(3);
  let templateCols = $state(4);
  let templateSpacing = $state(3.5);   // m
  let templateFardeau = $state(3.0);   // m
  let templateDelay = $state(25);      // ms per hole increment

  // ── Photo / AI state ───────────────────────────────────────────────────────
  let photoImporting = $state(false);
  let photoError = $state('');
  let photoInput = $state<HTMLInputElement | null>(null);

  // ── Undo history ───────────────────────────────────────────────────────────
  type Snapshot = { holes: DrillHole[]; connections: DrillConnection[] };
  let undoStack: Snapshot[] = [];
  const MAX_UNDO = 20;

  // ── Canvas ref ─────────────────────────────────────────────────────────────
  let canvasEl: HTMLCanvasElement;
  let containerEl: HTMLDivElement;

  // ── Next hole id ───────────────────────────────────────────────────────────
  let nextId = $derived(holes.length > 0 ? Math.max(...holes.map(h => h.id)) + 1 : 1);

  // ── Delete confirmation state ──────────────────────────────────────────────
  let deleteConfirm = $state(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  function saveSnapshot() {
    undoStack.push({
      holes: holes.map(h => ({ ...h })),
      connections: connections.map(c => ({ ...c })),
    });
    if (undoStack.length > MAX_UNDO) undoStack.shift();
  }

  function undo() {
    if (undoStack.length === 0) return;
    const snap = undoStack.pop()!;
    holes = snap.holes;
    connections = snap.connections;
    renderToDataurl();
  }

  function clearAll() {
    if (!confirm('Effacer tous les trous?')) return;
    saveSnapshot();
    holes = [];
    connections = [];
    renderToDataurl();
  }

  function autoNumber() {
    saveSnapshot();
    holes = holes.map((h, i) => ({ ...h, label: String(i + 1) }));
    renderToDataurl();
  }

  function autoDelay() {
    saveSnapshot();
    holes = holes.map((h, i) => ({ ...h, delay_ms: i * 25 }));
    renderToDataurl();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CANVAS RENDERING
  // ═══════════════════════════════════════════════════════════════════════════

  const HOLE_R = 22;       // radius px (44px diameter — mobile-friendly)
  const GRID_COLOR = 'rgba(255,255,255,0.07)';
  const GRID_STEP = 24;
  const BG_COLOR = '#0f1117';
  const HOLE_FILL = '#4f6ef7';
  const HOLE_SELECTED_FILL = '#6c84f8';
  const HOLE_BORDER_SELECTED = '#ffffff';
  const CONN_COLOR = 'rgba(160,168,204,0.5)';
  const MOVE_BORDER = '#f5c518'; // yellow for move mode

  function getCanvasSize(): { w: number; h: number } {
    if (!containerEl) return { w: 300, h: 200 };
    const w = containerEl.clientWidth;
    const h = Math.round(w * (2 / 3));
    return { w, h };
  }

  function setupCanvas() {
    if (!canvasEl || !containerEl) return;
    const dpr = window.devicePixelRatio || 1;
    const { w, h } = getCanvasSize();
    canvasEl.width = Math.round(w * dpr);
    canvasEl.height = Math.round(h * dpr);
    canvasEl.style.width = `${w}px`;
    canvasEl.style.height = `${h}px`;
    const ctx = canvasEl.getContext('2d')!;
    ctx.scale(dpr, dpr);
    renderCanvas();
  }

  function renderCanvas() {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const w = canvasEl.width / dpr;
    const h = canvasEl.height / dpr;

    // Background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= w; x += GRID_STEP) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += GRID_STEP) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Move mode overlay border
    if (moveMode) {
      ctx.strokeStyle = MOVE_BORDER;
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, w - 4, h - 4);
    }

    // Connection lines (draw under holes)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = CONN_COLOR;
    ctx.lineWidth = 1.5;
    for (const conn of connections) {
      const from = holes.find(h => h.id === conn.from);
      const to = holes.find(h => h.id === conn.to);
      if (from && to) {
        ctx.beginPath();
        ctx.moveTo(from.x * w, from.y * h);
        ctx.lineTo(to.x * w, to.y * h);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // Holes
    for (const hole of holes) {
      const px = hole.x * w;
      const py = hole.y * h;
      const isSelected = hole.id === selectedHoleId || hole.id === movingHoleId;
      const isMoving = moveMode && hole.id === movingHoleId;

      // Glow for selected
      if (isSelected) {
        ctx.shadowColor = isMoving ? MOVE_BORDER : '#6c84f8';
        ctx.shadowBlur = 16;
      }

      // Circle fill
      ctx.beginPath();
      ctx.arc(px, py, HOLE_R, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? HOLE_SELECTED_FILL : HOLE_FILL;
      ctx.fill();

      // Border
      ctx.strokeStyle = isMoving
        ? MOVE_BORDER
        : isSelected
          ? HOLE_BORDER_SELECTED
          : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = isSelected ? 3 : 1.5;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Label (hole number) - bigger font
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${hole.label.length > 2 ? '12' : '14'}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hole.label, px, py);

      // Delay text below hole - bigger
      if (hole.delay_ms >= 0) {
        ctx.fillStyle = 'rgba(220,228,255,0.9)';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`${hole.delay_ms}ms`, px, py + HOLE_R + 4);
      }
    }

    ctx.textBaseline = 'alphabetic';
  }

  function renderToDataurl() {
    renderCanvas();
    if (canvasEl) {
      dataurl = canvasEl.toDataURL('image/png');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POINTER EVENTS (tap to add / tap to select)
  // ═══════════════════════════════════════════════════════════════════════════

  function canvasCoords(clientX: number, clientY: number): { nx: number; ny: number } {
    const rect = canvasEl.getBoundingClientRect();
    return {
      nx: (clientX - rect.left) / rect.width,
      ny: (clientY - rect.top) / rect.height,
    };
  }

  function holeAtPoint(nx: number, ny: number): DrillHole | null {
    const { w, h } = getCanvasSize();
    const px = nx * w;
    const py = ny * h;
    // Hit test with extra buffer for mobile touch
    const HIT = HOLE_R + 10;
    for (let i = holes.length - 1; i >= 0; i--) {
      const hx = holes[i].x * w;
      const hy = holes[i].y * h;
      if (Math.hypot(px - hx, py - hy) <= HIT) return holes[i];
    }
    return null;
  }

  function triggerRipple(clientX: number, clientY: number) {
    const rect = canvasEl.getBoundingClientRect();
    rippleX = clientX - rect.left;
    rippleY = clientY - rect.top;
    showRipple = true;
    if (rippleTimer) clearTimeout(rippleTimer);
    rippleTimer = setTimeout(() => { showRipple = false; }, 400);
  }

  function onPointerDown(e: PointerEvent) {
    if (readonly) return;
    e.preventDefault();
  }

  function onPointerUp(e: PointerEvent) {
    if (readonly) return;

    const { nx, ny } = canvasCoords(e.clientX, e.clientY);
    const hit = holeAtPoint(nx, ny);

    // ── Move mode: place hole at new position ──────────────────────────────
    if (moveMode && movingHoleId !== null) {
      if (hit && hit.id !== movingHoleId) {
        // Tapped on another hole — ignore, don't move onto existing hole
        return;
      }
      saveSnapshot();
      const clamp = (v: number) => Math.max(0.02, Math.min(0.98, v));
      holes = holes.map(h =>
        h.id === movingHoleId ? { ...h, x: clamp(nx), y: clamp(ny) } : h
      );
      triggerRipple(e.clientX, e.clientY);
      moveMode = false;
      movingHoleId = null;
      // Reopen edit panel for the moved hole
      const moved = holes.find(h => h.id === (editingHole?.id));
      if (moved) {
        editingHole = { ...moved };
        showEditPanel = true;
      }
      renderToDataurl();
      return;
    }

    if (hit) {
      // Tap on hole → open edit panel
      if (editingHole && editingHole.id === hit.id && showEditPanel) {
        // Already open for this hole — toggle off
        closeEditPanel();
      } else {
        openEditPanel(hit);
      }
    } else {
      if (showEditPanel) {
        // Tap on canvas while panel open → close panel
        closeEditPanel();
        return;
      }
      // Add new hole at tap location
      triggerRipple(e.clientX, e.clientY);
      addHoleAt(nx, ny);
    }

    renderCanvas();
  }

  function openEditPanel(hole: DrillHole) {
    selectedHoleId = hole.id;
    editingHole = { ...hole };
    showEditPanel = true;
    deleteConfirm = false;
    renderCanvas();
  }

  function closeEditPanel() {
    showEditPanel = false;
    editingHole = null;
    selectedHoleId = null;
    moveMode = false;
    movingHoleId = null;
    deleteConfirm = false;
    renderCanvas();
  }

  function addHoleAt(nx: number, ny: number) {
    saveSnapshot();
    const id = nextId;
    const newHole: DrillHole = {
      id,
      x: nx,
      y: ny,
      delay_ms: holes.length > 0 ? (holes[holes.length - 1].delay_ms + 25) : 0,
      label: String(id),
    };
    // Auto-connect to previous hole
    if (holes.length > 0) {
      connections = [...connections, { from: holes[holes.length - 1].id, to: id }];
    }
    holes = [...holes, newHole];
    // Auto-open edit panel for new hole
    selectedHoleId = id;
    editingHole = { ...newHole };
    showEditPanel = true;
    deleteConfirm = false;
    renderToDataurl();
  }

  function addHoleToolbar() {
    if (!containerEl) return;
    addHoleAt(0.5, 0.5);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EDIT PANEL ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  function saveHoleEdit() {
    if (!editingHole) return;
    saveSnapshot();
    holes = holes.map(h => h.id === editingHole!.id ? { ...editingHole! } : h);
    renderToDataurl();
    // Keep panel open so user can see updated values
    selectedHoleId = editingHole.id;
  }

  function adjustDelay(delta: number) {
    if (!editingHole) return;
    editingHole = {
      ...editingHole,
      delay_ms: Math.max(0, editingHole.delay_ms + delta),
    };
    // Auto-save the adjustment
    saveHoleEdit();
  }

  function enterMoveMode() {
    if (!editingHole) return;
    movingHoleId = editingHole.id;
    moveMode = true;
    showEditPanel = false;
    renderCanvas();
  }

  function deleteHoleConfirm() {
    deleteConfirm = true;
  }

  function deleteHole() {
    if (!editingHole) return;
    saveSnapshot();
    const id = editingHole.id;
    holes = holes.filter(h => h.id !== id);
    connections = connections.filter(c => c.from !== id && c.to !== id);
    closeEditPanel();
    renderToDataurl();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEMPLATE GENERATION
  // ═══════════════════════════════════════════════════════════════════════════

  function generateTemplate() {
    saveSnapshot();
    const newHoles: DrillHole[] = [];
    const newConns: DrillConnection[] = [];

    const rows = Math.max(1, Math.min(20, templateRows));
    const cols = Math.max(1, Math.min(20, templateCols));
    const delay = Math.max(0, templateDelay);

    function makeHole(id: number, nx: number, ny: number, seq: number): DrillHole {
      return {
        id,
        x: Math.max(0.05, Math.min(0.95, nx)),
        y: Math.max(0.05, Math.min(0.95, ny)),
        delay_ms: seq * delay,
        label: String(id),
      };
    }

    let id = 1;
    let seq = 0;

    if (templateType === 'ligne') {
      for (let c = 0; c < cols; c++) {
        const nx = cols === 1 ? 0.5 : 0.1 + (c / (cols - 1)) * 0.8;
        const ny = 0.5;
        newHoles.push(makeHole(id, nx, ny, seq));
        if (id > 1) newConns.push({ from: id - 1, to: id });
        id++; seq++;
      }
    } else if (templateType === 'grille') {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nx = cols === 1 ? 0.5 : 0.1 + (c / (cols - 1)) * 0.8;
          const ny = rows === 1 ? 0.5 : 0.1 + (r / (rows - 1)) * 0.8;
          newHoles.push(makeHole(id, nx, ny, seq));
          if (c > 0) newConns.push({ from: id - 1, to: id });
          id++; seq++;
        }
      }
    } else if (templateType === 'vcut') {
      const numRows = Math.max(2, rows);
      for (let r = 0; r < numRows; r++) {
        const ny = 0.15 + (r / (numRows - 1)) * 0.7;
        const nxL = 0.5 - 0.05 - (r / (numRows - 1)) * 0.35;
        newHoles.push(makeHole(id, nxL, ny, seq));
        id++; seq++;
        const nxR = 0.5 + 0.05 + (r / (numRows - 1)) * 0.35;
        newHoles.push(makeHole(id, nxR, ny, seq));
        id++; seq++;
      }
      for (let i = 1; i < newHoles.length; i++) {
        newConns.push({ from: newHoles[i-1].id, to: newHoles[i].id });
      }
    } else if (templateType === 'echelon') {
      const effectiveCols = cols;
      for (let r = 0; r < rows; r++) {
        const ny = rows === 1 ? 0.5 : 0.1 + (r / (rows - 1)) * 0.8;
        const offset = (r % 2 === 1) ? (effectiveCols > 1 ? 0.4 / (effectiveCols - 1) : 0) : 0;
        for (let c = 0; c < effectiveCols; c++) {
          const nx = effectiveCols === 1 ? 0.5 : 0.1 + offset + (c / (effectiveCols - 1)) * (0.8 - offset * 2);
          newHoles.push(makeHole(id, nx, ny, seq));
          if (c > 0) newConns.push({ from: id - 1, to: id });
          id++; seq++;
        }
      }
    }

    holes = newHoles;
    connections = newConns;
    inputMode = 'none';
    renderToDataurl();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GEMINI VISION IMPORT
  // ═══════════════════════════════════════════════════════════════════════════

  async function handlePhotoImport(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    photoError = '';
    photoImporting = true;

    try {
      const profil = await getProfil();
      const apiKey = (profil as any)?.gemini_api_key || '';

      if (!apiKey) {
        photoError = "Configure ta clé Gemini dans Profil";
        photoImporting = false;
        return;
      }

      const base64 = await fileToBase64(file);
      const mimeType = file.type || 'image/jpeg';

      const prompt = `Analyze this blast drill pattern image. Extract all drill holes with their positions and timing delays.
Return JSON only (no markdown): { "holes": [{"x": 0-1, "y": 0-1, "delay_ms": number, "label": "string"}] }
x=0 is left, x=1 is right, y=0 is top, y=1 is bottom.
If delays are visible, include them. If not, set delay_ms to -1.
Normalize positions to 0-1 range based on the image boundaries.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: base64,
                  }
                }
              ]
            }]
          })
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Erreur API: ${response.status}`);
      }

      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Réponse invalide de Gemini");

      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.holes || !Array.isArray(parsed.holes)) {
        throw new Error("Format de réponse inattendu");
      }

      saveSnapshot();

      const newHoles: DrillHole[] = parsed.holes.map((h: any, i: number) => ({
        id: i + 1,
        x: Math.max(0.05, Math.min(0.95, Number(h.x) || 0.5)),
        y: Math.max(0.05, Math.min(0.95, Number(h.y) || 0.5)),
        delay_ms: Number(h.delay_ms) >= 0 ? Number(h.delay_ms) : 0,
        label: h.label ? String(h.label) : String(i + 1),
      }));

      const newConns: DrillConnection[] = [];
      for (let i = 1; i < newHoles.length; i++) {
        newConns.push({ from: newHoles[i-1].id, to: newHoles[i].id });
      }

      holes = newHoles;
      connections = newConns;
      inputMode = 'none';
      renderToDataurl();

    } catch (err: any) {
      photoError = err?.message || "Erreur lors de l'importation";
    } finally {
      photoImporting = false;
      if (photoInput) photoInput.value = '';
    }
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  onMount(() => {
    const ro = new ResizeObserver(() => setupCanvas());
    if (containerEl) ro.observe(containerEl);
    setupCanvas();
    return () => ro.disconnect();
  });

  $effect(() => {
    const _h = holes;
    const _c = connections;
    renderCanvas();
  });

  $effect(() => {
    const _s = selectedHoleId;
    const _m = moveMode;
    renderCanvas();
  });

  $effect(() => {
    if (canvasEl && holes.length > 0 && !dataurl) {
      renderToDataurl();
    }
  });
</script>

<!-- ══════════════════════════════════════════════════════════════════════════
     TEMPLATE
     ══════════════════════════════════════════════════════════════════════════ -->
<div style="width: 100%;">

  {#if !readonly}
  <!-- ── Input method selector ────────────────────────────────────────────── -->
  <div style="display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap;">
    <button
      onclick={() => inputMode = inputMode === 'photo' ? 'none' : 'photo'}
      style="
        flex: 1; min-width: 90px;
        padding: 10px 8px; border-radius: 8px; font-size: 12px; font-weight: 600;
        cursor: pointer; font-family: inherit; border: 1px solid;
        text-align: center;
        {inputMode === 'photo'
          ? 'background: var(--accent-glow); border-color: var(--accent); color: var(--accent2);'
          : 'background: var(--card2); border-color: var(--border); color: var(--text2);'}
      "
    >📸 Photo IA</button>

    <button
      onclick={() => inputMode = inputMode === 'template' ? 'none' : 'template'}
      style="
        flex: 1; min-width: 90px;
        padding: 10px 8px; border-radius: 8px; font-size: 12px; font-weight: 600;
        cursor: pointer; font-family: inherit; border: 1px solid;
        text-align: center;
        {inputMode === 'template'
          ? 'background: var(--accent-glow); border-color: var(--accent); color: var(--accent2);'
          : 'background: var(--card2); border-color: var(--border); color: var(--text2);'}
      "
    >📐 Gabarit</button>

    <button
      onclick={() => { inputMode = 'none'; }}
      style="
        flex: 1; min-width: 90px;
        padding: 10px 8px; border-radius: 8px; font-size: 12px; font-weight: 600;
        cursor: pointer; font-family: inherit; border: 1px solid;
        text-align: center;
        {inputMode === 'none'
          ? 'background: var(--accent-glow); border-color: var(--accent); color: var(--accent2);'
          : 'background: var(--card2); border-color: var(--border); color: var(--text2);'}
      "
    >👆 Manuel</button>
  </div>

  <!-- ── Photo import panel ──────────────────────────────────────────────── -->
  {#if inputMode === 'photo'}
  <div style="
    background: var(--card2); border: 1px solid var(--border); border-radius: 8px;
    padding: 12px; margin-bottom: 10px;
  ">
    <div style="font-size: 12px; font-weight: 700; color: var(--text2); margin-bottom: 8px;">
      📸 Importer une photo du plan de tir
    </div>
    <div style="font-size: 11px; color: var(--text3); margin-bottom: 10px; line-height: 1.5;">
      Prenez une photo de votre plan papier. L'IA Gemini extraira les trous et délais automatiquement.
    </div>

    {#if photoError}
      <div style="
        padding: 8px 10px; background: var(--red-dim); border: 1px solid var(--red);
        border-radius: 6px; font-size: 12px; color: var(--red); margin-bottom: 10px;
      ">
        ⚠️ {photoError}
        {#if photoError.includes('Gemini')}
          <div style="margin-top: 4px; font-size: 11px; color: var(--text3);">
            → Ajoutez votre clé API dans l'onglet <strong>Profil</strong>
          </div>
        {/if}
      </div>
    {/if}

    {#if photoImporting}
      <div style="
        padding: 12px; text-align: center;
        background: var(--card); border: 1px solid var(--border); border-radius: 6px;
        font-size: 12px; color: var(--text2);
      ">
        ⏳ Analyse en cours avec Gemini...
      </div>
    {:else}
      <label style="
        display: block; padding: 14px;
        background: var(--card); border: 2px dashed var(--border2); border-radius: 8px;
        text-align: center; cursor: pointer; font-size: 13px; color: var(--text3);
        transition: border-color 0.2s;
      ">
        📷 Appuyez pour prendre ou sélectionner une photo
        <input
          bind:this={photoInput}
          type="file"
          accept="image/*"
          onchange={handlePhotoImport}
          style="display: none;"
        >
      </label>
    {/if}
  </div>
  {/if}

  <!-- ── Template panel ─────────────────────────────────────────────────── -->
  {#if inputMode === 'template'}
  <div style="
    background: var(--card2); border: 1px solid var(--border); border-radius: 8px;
    padding: 12px; margin-bottom: 10px;
  ">
    <div style="font-size: 12px; font-weight: 700; color: var(--text2); margin-bottom: 10px;">
      📐 Choisir un gabarit de patron
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 12px;">
      {#each [
        { id: 'ligne' as TemplateType, icon: '─', label: 'Ligne droite', desc: '1 rangée' },
        { id: 'grille' as TemplateType, icon: '⊞', label: 'Grille', desc: 'Rectangulaire' },
        { id: 'vcut' as TemplateType, icon: '∨', label: 'V-cut / Bouchon', desc: 'Coupe en V' },
        { id: 'echelon' as TemplateType, icon: '≋', label: 'Échelon', desc: 'Rangées décalées' },
      ] as tpl}
        <button
          onclick={() => templateType = tpl.id}
          style="
            padding: 10px 8px; border-radius: 8px; font-size: 11px; font-weight: 600;
            cursor: pointer; font-family: inherit; border: 1px solid; text-align: center;
            {templateType === tpl.id
              ? 'background: var(--accent-glow); border-color: var(--accent); color: var(--accent2);'
              : 'background: var(--card); border-color: var(--border); color: var(--text2);'}
          "
        >
          <div style="font-size: 18px; margin-bottom: 4px;">{tpl.icon}</div>
          <div style="font-size: 12px;">{tpl.label}</div>
          <div style="font-size: 10px; color: var(--text3); font-weight: 400; margin-top: 1px;">{tpl.desc}</div>
        </button>
      {/each}
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      {#if templateType !== 'ligne'}
        <div>
          <label for="tpl-rows" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;">Rangées</label>
          <input
            id="tpl-rows"
            type="number" min="1" max="20"
            bind:value={templateRows}
            style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;"
          >
        </div>
      {/if}
      <div>
        <label for="tpl-cols" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;">{templateType === 'ligne' ? 'Nb trous' : 'Trous/rangée'}</label>
        <input
          id="tpl-cols"
          type="number" min="1" max="20"
          bind:value={templateCols}
          style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;"
        >
      </div>
      <div>
        <label for="tpl-spacing" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;">Espacement (m)</label>
        <input
          id="tpl-spacing"
          type="number" min="0.1" step="0.1"
          bind:value={templateSpacing}
          style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;"
        >
      </div>
      <div>
        <label for="tpl-fardeau" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;">Fardeau (m)</label>
        <input
          id="tpl-fardeau"
          type="number" min="0.1" step="0.1"
          bind:value={templateFardeau}
          style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;"
        >
      </div>
      <div>
        <label for="tpl-delay" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;">Délai de base (ms)</label>
        <input
          id="tpl-delay"
          type="number" min="0" step="5"
          bind:value={templateDelay}
          style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;"
        >
      </div>
    </div>

    <button
      onclick={generateTemplate}
      style="
        width: 100%; padding: 13px; border-radius: 8px; font-size: 14px; font-weight: 700;
        background: var(--accent); color: #fff; border: none; cursor: pointer; font-family: inherit;
      "
    >
      ✨ Générer le patron
    </button>
  </div>
  {/if}
  {/if}

  <!-- ── Move mode banner ────────────────────────────────────────────────── -->
  {#if moveMode}
    <div style="
      background: #f5c518; color: #000; padding: 10px 14px; border-radius: 8px;
      margin-bottom: 8px; font-size: 13px; font-weight: 700; text-align: center;
    ">
      📍 Touchez le nouvel emplacement pour déplacer le trou
      <button
        onclick={() => { moveMode = false; movingHoleId = null; showEditPanel = true; renderCanvas(); }}
        style="
          margin-left: 10px; padding: 4px 10px; border-radius: 6px; font-size: 12px;
          background: rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.3); color: #000;
          cursor: pointer; font-family: inherit; font-weight: 600;
        "
      >Annuler</button>
    </div>
  {/if}

  <!-- ── Canvas ──────────────────────────────────────────────────────────── -->
  <div
    bind:this={containerEl}
    style="
      position: relative; width: 100%; border-radius: 8px; overflow: hidden;
      border: {moveMode ? '2px solid #f5c518' : '1px solid var(--border)'};
      cursor: {readonly ? 'default' : moveMode ? 'crosshair' : 'pointer'};
      touch-action: none;
    "
  >
    <canvas
      bind:this={canvasEl}
      style="display: block; width: 100%; touch-action: none;"
      onpointerdown={readonly ? undefined : onPointerDown}
      onpointerup={readonly ? undefined : onPointerUp}
      onpointercancel={readonly ? undefined : onPointerUp}
    ></canvas>

    <!-- Ripple feedback -->
    {#if showRipple}
      <div style="
        position: absolute;
        left: {rippleX - 20}px;
        top: {rippleY - 20}px;
        width: 40px; height: 40px;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        pointer-events: none;
        animation: ripple-anim 0.4s ease-out forwards;
      "></div>
    {/if}

    <!-- Empty state overlay -->
    {#if holes.length === 0 && !readonly && !moveMode}
      <div style="
        position: absolute; inset: 0;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        pointer-events: none;
      ">
        <div style="font-size: 28px; margin-bottom: 8px; opacity: 0.3;">💥</div>
        <div style="font-size: 13px; color: var(--text3); opacity: 0.6; text-align: center; padding: 0 20px;">
          Touchez pour placer des trous<br>ou choisissez un gabarit ci-dessus
        </div>
      </div>
    {/if}
  </div>

  <!-- ── Info bar below canvas ──────────────────────────────────────────── -->
  {#if holes.length > 0 && !moveMode}
    <div style="
      display: flex; align-items: center; gap: 6px;
      padding: 6px 4px; font-size: 11px; color: var(--text3);
    ">
      <span>{holes.length} trou{holes.length > 1 ? 's' : ''}</span>
      {#if selectedHoleId !== null && showEditPanel}
        {#each holes.filter(h => h.id === selectedHoleId) as h}
          <span style="color: var(--accent2);">· Trou {h.label} — panneau ouvert</span>
        {/each}
      {:else if !readonly}
        <span>· Touchez un trou pour le modifier</span>
      {/if}
    </div>
  {/if}

  <!-- ── Toolbar ─────────────────────────────────────────────────────────── -->
  {#if !readonly && !moveMode}
  <div style="
    display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;
  ">
    <button
      onclick={addHoleToolbar}
      title="Ajouter un trou au centre"
      style="
        flex: 1; min-width: 60px;
        padding: 9px 6px; border-radius: 8px; font-size: 11px; font-weight: 600;
        background: var(--card2); border: 1px solid var(--border); color: var(--text2);
        cursor: pointer; font-family: inherit; text-align: center;
      "
    >➕ Trou</button>

    <button
      onclick={autoNumber}
      title="Renuméroter tous les trous"
      disabled={holes.length === 0}
      style="
        flex: 1; min-width: 60px;
        padding: 9px 6px; border-radius: 8px; font-size: 11px; font-weight: 600;
        background: var(--card2); border: 1px solid var(--border);
        color: {holes.length === 0 ? 'var(--text3)' : 'var(--text2)'};
        cursor: {holes.length === 0 ? 'default' : 'pointer'}; font-family: inherit; text-align: center;
      "
    >🔢 Numéros</button>

    <button
      onclick={autoDelay}
      title="Délais automatiques (+25ms par trou)"
      disabled={holes.length === 0}
      style="
        flex: 1; min-width: 60px;
        padding: 9px 6px; border-radius: 8px; font-size: 11px; font-weight: 600;
        background: var(--card2); border: 1px solid var(--border);
        color: {holes.length === 0 ? 'var(--text3)' : 'var(--text2)'};
        cursor: {holes.length === 0 ? 'default' : 'pointer'}; font-family: inherit; text-align: center;
      "
    >🔄 Délais</button>

    <button
      onclick={undo}
      title="Annuler"
      disabled={undoStack.length === 0}
      style="
        flex: 1; min-width: 60px;
        padding: 9px 6px; border-radius: 8px; font-size: 11px; font-weight: 600;
        background: var(--card2); border: 1px solid var(--border);
        color: {undoStack.length === 0 ? 'var(--text3)' : 'var(--text2)'};
        cursor: {undoStack.length === 0 ? 'default' : 'pointer'}; font-family: inherit; text-align: center;
      "
    >↩ Annuler</button>

    <button
      onclick={clearAll}
      title="Effacer tout"
      disabled={holes.length === 0}
      style="
        flex: 1; min-width: 60px;
        padding: 9px 6px; border-radius: 8px; font-size: 11px; font-weight: 600;
        background: var(--red-dim); border: 1px solid var(--red);
        color: {holes.length === 0 ? 'var(--text3)' : 'var(--red)'};
        cursor: {holes.length === 0 ? 'default' : 'pointer'}; font-family: inherit; text-align: center;
      "
    >🗑️ Vider</button>
  </div>
  {/if}

</div>

<!-- ══════════════════════════════════════════════════════════════════════════
     BOTTOM SHEET EDIT PANEL
     ══════════════════════════════════════════════════════════════════════════ -->
{#if showEditPanel && editingHole && !readonly}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Modifier le trou"
    style="
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
      background: var(--card);
      border-top: 2px solid var(--border2);
      border-radius: 20px 20px 0 0;
      padding: 0 0 env(safe-area-inset-bottom, 0);
      box-shadow: 0 -8px 40px rgba(0,0,0,0.6);
      max-height: 80vh;
      overflow-y: auto;
    "
  >
    <!-- Handle -->
    <div style="
      width: 40px; height: 4px; background: var(--border2); border-radius: 2px;
      margin: 10px auto 0;
    "></div>

    <!-- Panel header -->
    <div style="
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px 8px;
      border-bottom: 1px solid var(--border);
    ">
      <div style="font-size: 16px; font-weight: 800; color: var(--text);">
        ✏️ Trou {editingHole.label}
      </div>
      <button
        onclick={closeEditPanel}
        style="
          background: var(--card2); border: 1px solid var(--border);
          border-radius: 20px; padding: 5px 12px;
          font-size: 13px; font-weight: 600; color: var(--text2);
          cursor: pointer; font-family: inherit;
        "
      >✕ Fermer</button>
    </div>

    <div style="padding: 14px 16px;">

      <!-- DELAY row with big +/- buttons -->
      <div style="margin-bottom: 14px;">
        <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
          Délai (ms)
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <!-- Quick decrement buttons -->
          <button
            onclick={() => adjustDelay(-25)}
            style="
              padding: 10px 14px; border-radius: 10px; font-size: 14px; font-weight: 800;
              background: var(--card2); border: 1px solid var(--border); color: var(--text2);
              cursor: pointer; font-family: inherit; min-width: 52px;
            "
          >−25</button>
          <button
            onclick={() => adjustDelay(-5)}
            style="
              padding: 10px 14px; border-radius: 10px; font-size: 14px; font-weight: 800;
              background: var(--card2); border: 1px solid var(--border); color: var(--text2);
              cursor: pointer; font-family: inherit; min-width: 44px;
            "
          >−5</button>

          <!-- Large number input -->
          <input
            type="number"
            min="0"
            step="1"
            bind:value={editingHole.delay_ms}
            oninput={saveHoleEdit}
            style="
              flex: 1; text-align: center;
              padding: 12px 8px; border-radius: 10px;
              background: var(--card2); border: 2px solid var(--accent);
              color: var(--text); font-size: 22px; font-weight: 800;
              font-family: inherit;
            "
          >

          <!-- Quick increment buttons -->
          <button
            onclick={() => adjustDelay(5)}
            style="
              padding: 10px 14px; border-radius: 10px; font-size: 14px; font-weight: 800;
              background: var(--card2); border: 1px solid var(--border); color: var(--text2);
              cursor: pointer; font-family: inherit; min-width: 44px;
            "
          >+5</button>
          <button
            onclick={() => adjustDelay(25)}
            style="
              padding: 10px 14px; border-radius: 10px; font-size: 14px; font-weight: 800;
              background: var(--card2); border: 1px solid var(--border); color: var(--text2);
              cursor: pointer; font-family: inherit; min-width: 52px;
            "
          >+25</button>
        </div>
      </div>

      <!-- LABEL row -->
      <div style="margin-bottom: 16px;">
        <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
          Étiquette / Numéro
        </div>
        <input
          type="text"
          maxlength="6"
          bind:value={editingHole.label}
          oninput={saveHoleEdit}
          style="
            width: 100%; padding: 12px 14px; border-radius: 10px;
            background: var(--card2); border: 1px solid var(--border);
            color: var(--text); font-size: 18px; font-weight: 700;
            font-family: inherit; box-sizing: border-box;
          "
        >
      </div>

      <!-- Action buttons -->
      <div style="display: flex; gap: 8px;">
        <!-- Move button -->
        <button
          onclick={enterMoveMode}
          style="
            flex: 1; padding: 12px 8px; border-radius: 10px; font-size: 13px; font-weight: 700;
            background: var(--card2); border: 1px solid var(--border); color: var(--text2);
            cursor: pointer; font-family: inherit; text-align: center;
          "
        >📍 Déplacer</button>

        <!-- Delete button -->
        {#if !deleteConfirm}
          <button
            onclick={deleteHoleConfirm}
            style="
              flex: 1; padding: 12px 8px; border-radius: 10px; font-size: 13px; font-weight: 700;
              background: var(--red-dim); border: 1px solid var(--red); color: var(--red);
              cursor: pointer; font-family: inherit; text-align: center;
            "
          >🗑️ Supprimer</button>
        {:else}
          <button
            onclick={deleteHole}
            style="
              flex: 1; padding: 12px 8px; border-radius: 10px; font-size: 13px; font-weight: 700;
              background: var(--red); border: none; color: #fff;
              cursor: pointer; font-family: inherit; text-align: center;
            "
          >⚠️ Confirmer</button>
          <button
            onclick={() => deleteConfirm = false}
            style="
              padding: 12px 10px; border-radius: 10px; font-size: 13px; font-weight: 600;
              background: var(--card2); border: 1px solid var(--border); color: var(--text2);
              cursor: pointer; font-family: inherit;
            "
          >✕</button>
        {/if}
      </div>

    </div>
  </div>

  <!-- Tap backdrop (only visible) — clicking the canvas already handles close -->
{/if}

<style>
  @keyframes ripple-anim {
    0%   { transform: scale(0.5); opacity: 1; }
    100% { transform: scale(3); opacity: 0; }
  }
</style>

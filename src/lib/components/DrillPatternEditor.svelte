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
  // CANVAS RENDERING — Engineer plan style (professional, light background)
  // ═══════════════════════════════════════════════════════════════════════════

  const GRID_COLOR = 'rgba(0,0,0,0.07)';
  const GRID_STEP = 28;
  const BG_COLOR = '#f8f9fa';           // Light gray — professional plan background
  const BORDER_COLOR = '#2e7d32';       // Dark green border around blast zone (like reference)
  const MOVE_BORDER = '#e65100';        // Orange for move mode (visible on light bg)

  // Delay zone colors — vibrant, clearly readable on white/light background
  const ZONE_COLORS = [
    '#757575', // Zone 0 (0–15%): bouchon / gray
    '#00838f', // Zone 1 (15–30%): inner ring / teal-cyan
    '#388e3c', // Zone 2 (30–55%): production / green
    '#f9a825', // Zone 3 (55–80%): contour / amber-yellow
    '#bf360c', // Zone 4 (80–100%): trim/edge / deep brown-orange
  ];

  // Zone fill colors — slightly lighter for filled hole circles
  const ZONE_FILL_COLORS = [
    '#9e9e9e',
    '#00acc1',
    '#43a047',
    '#fdd835',
    '#e64a19',
  ];

  // Zone labels for legend
  const ZONE_LABELS = [
    'Bouchon',
    'Anneau int.',
    'Production',
    'Contour',
    'Bordure',
  ];

  // Zone thresholds (percentage of max delay)
  const ZONE_THRESHOLDS = [0.15, 0.30, 0.55, 0.80, 1.0];

  // Derived legend state — which zones are used (for HTML legend below canvas)
  let usedZoneLegend = $state<number[]>([]);

  function getDelayZone(delayMs: number, maxDelay: number): number {
    if (maxDelay <= 0) return 2; // default to production zone
    const ratio = delayMs / maxDelay;
    for (let i = 0; i < ZONE_THRESHOLDS.length; i++) {
      if (ratio <= ZONE_THRESHOLDS[i]) return i;
    }
    return ZONE_THRESHOLDS.length - 1;
  }

  function getZoneColor(zone: number, isSelected: boolean, isMoving: boolean): string {
    if (isMoving) return MOVE_BORDER;
    return ZONE_FILL_COLORS[zone] ?? ZONE_FILL_COLORS[2];
  }

  // Compute hole radius based on count
  function getHoleRadius(count: number, canvasW: number): number {
    if (count > 120) return Math.max(3, Math.min(5, canvasW / 100));
    if (count > 80)  return Math.max(4, Math.min(6, canvasW / 80));
    if (count > 50)  return Math.max(5, Math.min(7, canvasW / 70));
    if (count > 20)  return Math.max(6, Math.min(8, canvasW / 60));
    return Math.max(8, Math.min(11, canvasW / 50));
  }

  // Label font size based on hole count
  function getLabelFontSize(count: number): number {
    if (count > 120) return 7;
    if (count > 80)  return 8;
    if (count > 50)  return 9;
    if (count > 20)  return 9;
    return 10;
  }

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

  // ── Convex Hull (Graham scan) ────────────────────────────────────────────
  type Point = { x: number; y: number };

  function cross(O: Point, A: Point, B: Point): number {
    return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
  }

  function convexHull(points: Point[]): Point[] {
    const n = points.length;
    if (n < 3) return [...points];
    const sorted = [...points].sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);
    const lower: Point[] = [];
    for (const p of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
        lower.pop();
      lower.push(p);
    }
    const upper: Point[] = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
        upper.pop();
      upper.push(p);
    }
    upper.pop();
    lower.pop();
    return [...lower, ...upper];
  }

  // Expand a convex hull outward by `margin` pixels
  function expandHull(hull: Point[], margin: number): Point[] {
    if (hull.length === 0) return hull;
    // Compute centroid
    const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
    const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
    return hull.map(p => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const len = Math.hypot(dx, dy) || 1;
      return { x: p.x + (dx / len) * margin, y: p.y + (dy / len) * margin };
    });
  }

  // Draw a smooth closed path through hull points using cubic bezier curves
  function drawSmoothHull(ctx: CanvasRenderingContext2D, hull: Point[]) {
    if (hull.length < 2) return;
    if (hull.length === 2) {
      ctx.beginPath();
      ctx.moveTo(hull[0].x, hull[0].y);
      ctx.lineTo(hull[1].x, hull[1].y);
      ctx.closePath();
      return;
    }
    const n = hull.length;
    ctx.beginPath();
    // Catmull-Rom → cubic bezier conversion for smooth closed curve
    for (let i = 0; i < n; i++) {
      const p0 = hull[(i - 1 + n) % n];
      const p1 = hull[i];
      const p2 = hull[(i + 1) % n];
      const p3 = hull[(i + 2) % n];
      if (i === 0) ctx.moveTo(p1.x, p1.y);
      // Catmull-Rom tension 0.5
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
    ctx.closePath();
  }

  function renderCanvas() {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const w = canvasEl.width / dpr;
    const h = canvasEl.height / dpr;

    // Compute max delay for zone calculation
    const maxDelay = holes.length > 0 ? Math.max(...holes.map(h => h.delay_ms)) : 0;

    // Hole radius — adaptive to count
    const HOLE_R = getHoleRadius(holes.length, w);
    const BOUCHON_R = Math.max(3, Math.round(HOLE_R * 0.75));

    // Label font size — adaptive to count
    const fontSize = getLabelFontSize(holes.length);

    // ── Background ──────────────────────────────────────────────────────────
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, w, h);

    // ── Subtle grid ─────────────────────────────────────────────────────────
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= w; x += GRID_STEP) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += GRID_STEP) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // ── Contour lines (convex hull per zone) — drawn BEFORE holes ───────────
    if (holes.length >= 2) {
      // Group holes by zone
      const zonePoints: Map<number, Point[]> = new Map();
      for (const hole of holes) {
        const zone = getDelayZone(hole.delay_ms, maxDelay);
        if (!zonePoints.has(zone)) zonePoints.set(zone, []);
        zonePoints.get(zone)!.push({ x: hole.x * w, y: hole.y * h });
      }

      // Draw contour for each zone (outermost first so inner zones render on top)
      const sortedZones = [...zonePoints.keys()].sort((a, b) => b - a);
      for (const zone of sortedZones) {
        const pts = zonePoints.get(zone)!;
        if (pts.length < 2) continue;

        const zoneColor = ZONE_COLORS[zone] ?? ZONE_COLORS[2];
        const hull = convexHull(pts);

        // Expand hull outward by HOLE_R + 4 so contour line frames the holes
        const margin = HOLE_R + 5;
        const expanded = expandHull(hull, margin);

        // Filled region — very light tint of the zone color
        ctx.save();
        drawSmoothHull(ctx, expanded);
        ctx.fillStyle = zoneColor + '18'; // ~10% opacity fill tint
        ctx.fill();
        ctx.restore();

        // Contour stroke line
        ctx.save();
        drawSmoothHull(ctx, expanded);
        ctx.strokeStyle = zoneColor;
        ctx.lineWidth = holes.length > 80 ? 1.2 : 1.8;
        ctx.setLineDash([]);
        ctx.stroke();
        ctx.restore();
      }
    }

    // ── Pattern border rectangle (drawn around all holes) ───────────────────
    if (holes.length >= 2) {
      const MARGIN = HOLE_R + 14;
      const bMinX = Math.min(...holes.map(hole => hole.x * w)) - MARGIN;
      const bMaxX = Math.max(...holes.map(hole => hole.x * w)) + MARGIN;
      const bMinY = Math.min(...holes.map(hole => hole.y * h)) - MARGIN;
      const bMaxY = Math.max(...holes.map(hole => hole.y * h)) + MARGIN;

      ctx.strokeStyle = BORDER_COLOR;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(
        Math.max(4, bMinX),
        Math.max(4, bMinY),
        Math.min(w - 8, bMaxX) - Math.max(4, bMinX),
        Math.min(h - 8, bMaxY) - Math.max(4, bMinY)
      );
      ctx.setLineDash([]);
    }

    // Move mode overlay border
    if (moveMode) {
      ctx.strokeStyle = MOVE_BORDER;
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.strokeRect(2, 2, w - 4, h - 4);
    }

    // ── Holes (solid filled circles with border) ─────────────────────────────
    for (const hole of holes) {
      const px = hole.x * w;
      const py = hole.y * h;
      const isSelected = hole.id === selectedHoleId || hole.id === movingHoleId;
      const isMoving = moveMode && hole.id === movingHoleId;
      const zone = getDelayZone(hole.delay_ms, maxDelay);
      const fillColor = getZoneColor(zone, isSelected, isMoving);
      const strokeColor = isMoving ? MOVE_BORDER : ZONE_COLORS[zone] ?? ZONE_COLORS[2];
      const r = zone === 0 ? BOUCHON_R : HOLE_R;

      // Glow/highlight for selected hole
      if (isSelected) {
        ctx.shadowColor = isMoving ? MOVE_BORDER : (ZONE_COLORS[zone] ?? ZONE_COLORS[2]);
        ctx.shadowBlur = 10;
      }

      // Circle fill
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = isMoving ? '#ff5722' : fillColor;
      ctx.fill();

      // Circle border — darker shade for definition on light background
      ctx.strokeStyle = isSelected ? '#1a1a1a' : strokeColor;
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }

    // ── Labels drawn AFTER all holes (always on top) ────────────────────────
    const labelBoxes: { x: number; y: number; w: number; h: number }[] = [];

    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    ctx.textBaseline = 'middle';

    for (const hole of holes) {
      if (hole.delay_ms < 0) continue;

      const px = hole.x * w;
      const py = hole.y * h;
      const zone = getDelayZone(hole.delay_ms, maxDelay);
      const r = zone === 0 ? BOUCHON_R : HOLE_R;
      const labelStr = String(hole.delay_ms);

      const textW = ctx.measureText(labelStr).width;
      const PAD = 2;
      const boxW = textW + PAD * 2;
      const boxH = fontSize + PAD * 2;
      const gap = 3;

      // Try positions: right, left, above, below
      const candidates = [
        { x: px + r + gap,             y: py },
        { x: px - r - gap - boxW,      y: py },
        { x: px - boxW / 2,            y: py - r - gap - boxH / 2 },
        { x: px - boxW / 2,            y: py + r + gap + boxH / 2 },
      ];

      let chosen: { x: number; y: number } | null = null;
      for (const cand of candidates) {
        const box = { x: cand.x - PAD, y: cand.y - boxH / 2 - PAD, w: boxW + PAD, h: boxH + PAD };
        if (box.x < 2 || box.x + box.w > w - 2 || box.y < 2 || box.y + box.h > h - 2) continue;
        const overlaps = labelBoxes.some(b =>
          box.x < b.x + b.w && box.x + box.w > b.x &&
          box.y < b.y + b.h && box.y + box.h > b.y
        );
        if (!overlaps) {
          chosen = cand;
          labelBoxes.push(box);
          break;
        }
      }

      if (!chosen) {
        chosen = candidates[0];
        labelBoxes.push({ x: chosen.x - PAD, y: chosen.y - boxH / 2 - PAD, w: boxW + PAD, h: boxH + PAD });
      }

      const lx = chosen.x;
      const ly = chosen.y;

      // No background pill on light background — just dark text directly
      const zoneTextColor = ZONE_COLORS[zone] ?? ZONE_COLORS[2];
      ctx.fillStyle = zoneTextColor;
      ctx.textAlign = 'left';
      ctx.fillText(labelStr, lx, ly);
    }

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    // Update HTML legend state
    if (holes.length > 0) {
      const usedSet = new Set(holes.map(h => getDelayZone(h.delay_ms, maxDelay)));
      usedZoneLegend = [...usedSet].sort();
    } else {
      usedZoneLegend = [];
    }
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
    // Use generous hit radius regardless of visual size — important for mobile touch
    const holeR = getHoleRadius(holes.length, w);
    const HIT = Math.max(holeR + 14, 20);
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

  <!-- ── Zone legend (HTML, below canvas) ───────────────────────────────── -->
  {#if usedZoneLegend.length > 0}
    <div style="
      display: flex; flex-wrap: wrap; gap: 6px 10px; padding: 4px 4px 6px;
      font-size: 10px; color: var(--text3);
    ">
      {#each usedZoneLegend as zi}
        <span style="display: flex; align-items: center; gap: 4px;">
          <span style="
            display: inline-block; width: 10px; height: 10px; border-radius: 50%;
            background: {ZONE_FILL_COLORS[zi]}; border: 1.5px solid {ZONE_COLORS[zi]}; flex-shrink: 0;
          "></span>
          <span>{ZONE_LABELS[zi]}</span>
        </span>
      {/each}
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

<script lang="ts">
  // Freehand drawing canvas for Page 2 — Plan de tir / Registre de forage
  // Supports touch, mouse, undo, clear, and exports as data URL

  let {
    dataurl = $bindable(''),
    readonly = false,
  }: {
    dataurl?: string;
    readonly?: boolean;
  } = $props();

  let canvas: HTMLCanvasElement;
  let container: HTMLDivElement;

  // Drawing state
  let isDrawing = $state(false);
  let color = $state('#4f6ef7');  // default: accent blue
  let lineWidth = $state(2);
  let tool = $state<'pen' | 'eraser'>('pen');

  // Undo stack — store snapshots of canvas image data
  let undoStack: ImageData[] = [];
  const MAX_UNDO = 20;

  // Colors palette
  const colors = ['#4f6ef7', '#e8eaf6', '#e74c3c', '#2ecc71', '#f39c12', '#000000'];

  function getCtx(): CanvasRenderingContext2D | null {
    return canvas?.getContext('2d') ?? null;
  }

  function setupCanvas() {
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = Math.round(w * 0.65);

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = getCtx();
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Fill background with dark grid
    drawBackground(ctx, w, h);

    // Restore existing drawing if any
    if (dataurl) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, w, h);
      img.src = dataurl;
    }
  }

  function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Dark background
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 0.5;
    const step = 20;
    for (let x = 0; x <= w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  function saveSnapshot() {
    const ctx = getCtx();
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const snapshot = ctx.getImageData(0, 0, Math.round(w * dpr), Math.round(h * dpr));
    undoStack.push(snapshot);
    if (undoStack.length > MAX_UNDO) undoStack.shift();
  }

  function undo() {
    if (undoStack.length === 0) return;
    const ctx = getCtx();
    if (!ctx) return;
    const snapshot = undoStack.pop();
    if (snapshot) {
      ctx.putImageData(snapshot, 0, 0);
      exportDataUrl();
    }
  }

  function clearCanvas() {
    if (!confirm('Effacer tout le dessin?')) return;
    saveSnapshot();
    const ctx = getCtx();
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    drawBackground(ctx, w, h);
    exportDataUrl();
  }

  function exportDataUrl() {
    if (!canvas) return;
    dataurl = canvas.toDataURL('image/png');
  }

  function getPoint(e: MouseEvent | Touch): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function startStroke(x: number, y: number) {
    if (readonly) return;
    saveSnapshot();
    const ctx = getCtx();
    if (!ctx) return;
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 6 : lineWidth;
    ctx.strokeStyle = tool === 'eraser' ? '#111827' : color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function continueStroke(x: number, y: number) {
    if (!isDrawing) return;
    const ctx = getCtx();
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function endStroke() {
    if (!isDrawing) return;
    isDrawing = false;
    exportDataUrl();
  }

  // Mouse events
  function onMouseDown(e: MouseEvent) {
    const { x, y } = getPoint(e);
    startStroke(x, y);
  }
  function onMouseMove(e: MouseEvent) {
    if (!isDrawing) return;
    const { x, y } = getPoint(e);
    continueStroke(x, y);
  }
  function onMouseUp() { endStroke(); }

  // Touch events
  function onTouchStart(e: TouchEvent) {
    e.preventDefault();
    if (e.touches.length !== 1) return;
    const { x, y } = getPoint(e.touches[0]);
    startStroke(x, y);
  }
  function onTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (e.touches.length !== 1 || !isDrawing) return;
    const { x, y } = getPoint(e.touches[0]);
    continueStroke(x, y);
  }
  function onTouchEnd() { endStroke(); }

  $effect(() => {
    if (container && canvas) {
      setupCanvas();
    }
  });

  $effect(() => {
    const ro = new ResizeObserver(() => setupCanvas());
    if (container) ro.observe(container);
    return () => ro.disconnect();
  });
</script>

<div style="width: 100%;">
  <!-- Toolbar -->
  {#if !readonly}
  <div style="
    display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;
  ">
    <!-- Tool selector -->
    <div style="display: flex; gap: 4px;">
      {#each [{ id: 'pen', icon: '✏️', label: 'Crayon' }, { id: 'eraser', icon: '⬜', label: 'Efface' }] as t}
        <button
          onclick={() => tool = t.id as 'pen' | 'eraser'}
          title={t.label}
          style="
            padding: 6px 10px; border-radius: 6px; font-size: 13px;
            background: {tool === t.id ? 'var(--accent-glow)' : 'var(--card2)'};
            border: 1px solid {tool === t.id ? 'var(--accent)' : 'var(--border)'};
            color: {tool === t.id ? 'var(--accent2)' : 'var(--text3)'};
            cursor: pointer; font-family: inherit;
          "
        >{t.icon}</button>
      {/each}
    </div>

    <!-- Color palette -->
    <div style="display: flex; gap: 4px; align-items: center;">
      {#each colors as c}
        <button
          onclick={() => { color = c; tool = 'pen'; }}
          title={c}
          style="
            width: 22px; height: 22px; border-radius: 50%;
            background: {c};
            border: 2px solid {color === c && tool === 'pen' ? 'white' : 'transparent'};
            cursor: pointer;
            outline: {color === c && tool === 'pen' ? '1px solid rgba(255,255,255,0.4)' : 'none'};
          "
        ></button>
      {/each}
    </div>

    <!-- Line width -->
    <div style="display: flex; gap: 4px; align-items: center;">
      {#each [1, 2, 4, 8] as w}
        <button
          onclick={() => lineWidth = w}
          title={`${w}px`}
          style="
            width: 28px; height: 28px; border-radius: 6px;
            background: {lineWidth === w ? 'var(--accent-glow)' : 'var(--card2)'};
            border: 1px solid {lineWidth === w ? 'var(--accent)' : 'var(--border)'};
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
          "
        >
          <div style="width: {Math.min(w * 3, 18)}px; height: {w}px; background: var(--text2); border-radius: 2px;"></div>
        </button>
      {/each}
    </div>

    <div style="flex: 1;"></div>

    <!-- Undo / Clear -->
    <button
      onclick={undo}
      disabled={undoStack.length === 0}
      title="Annuler"
      style="
        padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
        background: var(--card2); border: 1px solid var(--border);
        color: {undoStack.length === 0 ? 'var(--text3)' : 'var(--text2)'};
        cursor: {undoStack.length === 0 ? 'default' : 'pointer'};
        font-family: inherit;
      "
    >↩ Annuler</button>
    <button
      onclick={clearCanvas}
      title="Effacer tout"
      style="
        padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
        background: var(--red-dim); border: 1px solid var(--red);
        color: var(--red); cursor: pointer; font-family: inherit;
      "
    >✕ Effacer</button>
  </div>
  {/if}

  <!-- Canvas -->
  <div
    bind:this={container}
    style="
      width: 100%; border-radius: 8px; overflow: hidden;
      border: 1px solid var(--border);
      cursor: {readonly ? 'default' : (tool === 'eraser' ? 'cell' : 'crosshair')};
    "
  >
    <canvas
      bind:this={canvas}
      style="display: block; width: 100%; touch-action: none;"
      onmousedown={onMouseDown}
      onmousemove={onMouseMove}
      onmouseup={onMouseUp}
      onmouseleave={onMouseUp}
      ontouchstart={onTouchStart}
      ontouchmove={onTouchMove}
      ontouchend={onTouchEnd}
    ></canvas>
  </div>
</div>

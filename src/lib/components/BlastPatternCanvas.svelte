<script lang="ts">
  import type { FiringSequence, FiringHole } from '$lib/db';

  let {
    firingSequence,
    title = 'Séquence de tir',
    shotInfo = '',
    interactive = true,
    showAnimation = true,
    showExport = true,
  }: {
    firingSequence: FiringSequence;
    title?: string;
    shotInfo?: string;
    interactive?: boolean;
    showAnimation?: boolean;
    showExport?: boolean;
  } = $props();

  // ─── Canvas state ──────────────────────────────────────────────────────────
  let canvas: HTMLCanvasElement;
  let container: HTMLDivElement;

  // Viewport transform
  let panX = $state(0);
  let panY = $state(0);
  let zoom = $state(1);

  // Interaction state
  let isDragging = $state(false);
  let dragStartX = 0;
  let dragStartY = 0;
  let lastPanX = 0;
  let lastPanY = 0;

  // Touch pinch state
  let lastPinchDist = 0;
  let lastPinchMidX = 0;
  let lastPinchMidY = 0;

  // Tooltip state
  let tooltip = $state<{ hole: FiringHole; screenX: number; screenY: number } | null>(null);

  // Animation state
  let animating = $state(false);
  let animSpeed = $state(1);  // 0.5, 1, 2, 5
  let animTime = $state(0);   // current simulated ms
  let animMaxTime = $derived(
    firingSequence.holes.length > 0
      ? Math.max(...firingSequence.holes.map(h => h.delay_ms)) + 800
      : 1000
  );
  let animFrameId: number | null = null;
  let animLastTs: number | null = null;

  // Fired holes set (for animation)
  let firedHoles = $state(new Set<number>());
  let pulsingHoles = $state(new Map<number, number>()); // id → pulse time remaining (ms)

  // ─── Derived values ────────────────────────────────────────────────────────

  const delayMin = $derived(
    firingSequence.delayRange?.min ??
    (firingSequence.holes.length > 0 ? Math.min(...firingSequence.holes.map(h => h.delay_ms)) : 0)
  );
  const delayMax = $derived(
    firingSequence.delayRange?.max ??
    (firingSequence.holes.length > 0 ? Math.max(...firingSequence.holes.map(h => h.delay_ms)) : 1000)
  );

  // ─── Color mapping ─────────────────────────────────────────────────────────

  /**
   * Map a normalized t (0–1) to a bright gradient color:
   * blue → cyan → green → yellow → orange → red
   */
  function delayColor(delay: number, alpha = 1): string {
    const range = delayMax - delayMin;
    const t = range > 0 ? Math.max(0, Math.min(1, (delay - delayMin) / range)) : 0;

    // Color stops: [t, r, g, b]
    const stops: [number, number, number, number][] = [
      [0.00,  64, 120, 255],   // blue
      [0.20,   0, 220, 255],   // cyan
      [0.40,  50, 220,  80],   // green
      [0.60, 255, 230,   0],   // yellow
      [0.80, 255, 130,   0],   // orange
      [1.00, 255,  40,  40],   // red
    ];

    let r = 255, g = 255, b = 255;
    for (let i = 0; i < stops.length - 1; i++) {
      const [t0, r0, g0, b0] = stops[i];
      const [t1, r1, g1, b1] = stops[i + 1];
      if (t >= t0 && t <= t1) {
        const f = (t - t0) / (t1 - t0);
        r = Math.round(r0 + (r1 - r0) * f);
        g = Math.round(g0 + (g1 - g0) * f);
        b = Math.round(b0 + (b1 - b0) * f);
        break;
      }
    }
    return alpha < 1 ? `rgba(${r},${g},${b},${alpha})` : `rgb(${r},${g},${b})`;
  }

  // ─── Canvas rendering ──────────────────────────────────────────────────────

  function getCanvasSize(): { w: number; h: number } {
    if (!container) return { w: 800, h: 500 };
    const w = container.clientWidth || 800;
    // Aspect ratio: use 16:10 base, capped
    const h = Math.min(Math.round(w * 0.6), 560);
    return { w, h };
  }

  function worldToScreen(x: number, y: number, w: number, h: number) {
    // Margin for labels/legend
    const margin = 40;
    const drawW = w - margin * 2;
    const drawH = h - margin * 2;
    const sx = margin + x * drawW * zoom + panX;
    const sy = margin + y * drawH * zoom + panY;
    return { sx, sy };
  }

  function screenToWorld(sx: number, sy: number, w: number, h: number) {
    const margin = 40;
    const drawW = w - margin * 2;
    const drawH = h - margin * 2;
    const x = (sx - panX - margin) / (drawW * zoom);
    const y = (sy - panY - margin) / (drawH * zoom);
    return { x, y };
  }

  function render() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const { w, h } = getCanvasSize();

    // Resize canvas if needed
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    drawGrid(ctx, w, h);

    // Connection lines
    drawConnections(ctx, w, h);

    // Holes
    drawHoles(ctx, w, h);

    // Legend
    drawLegend(ctx, w, h);

    ctx.restore();
  }

  function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;

    const margin = 40;
    const drawW = w - margin * 2;
    const drawH = h - margin * 2;

    // Draw 10x10 grid
    for (let i = 0; i <= 10; i++) {
      const gx = margin + (i / 10) * drawW * zoom + panX;
      const gy = margin + (i / 10) * drawH * zoom + panY;

      // Vertical
      ctx.beginPath();
      ctx.moveTo(gx, margin);
      ctx.lineTo(gx, h - margin);
      ctx.stroke();

      // Horizontal
      ctx.beginPath();
      ctx.moveTo(margin, gy);
      ctx.lineTo(w - margin, gy);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawConnections(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (!firingSequence.connections || firingSequence.connections.length === 0) return;

    const holeMap = new Map(firingSequence.holes.map(h => [h.id, h]));

    ctx.save();
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);

    for (const conn of firingSequence.connections) {
      const from = holeMap.get(conn.from);
      const to = holeMap.get(conn.to);
      if (!from || !to) continue;

      const { sx: x1, sy: y1 } = worldToScreen(from.x, from.y, w, h);
      const { sx: x2, sy: y2 } = worldToScreen(to.x, to.y, w, h);

      const color = delayColor((from.delay_ms + to.delay_ms) / 2, 0.4);
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawHoles(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const margin = 40;

    // Clip to drawing area
    ctx.save();
    ctx.beginPath();
    ctx.rect(margin - 2, margin - 2, w - margin * 2 + 4, h - margin * 2 + 4);
    ctx.clip();

    for (const hole of firingSequence.holes) {
      const { sx, sy } = worldToScreen(hole.x, hole.y, w, h);
      const color = delayColor(hole.delay_ms);

      // Determine radius based on type
      let radius = 5;
      if (hole.type === 'bouchon') radius = 7;
      else if (hole.type === 'masse') radius = 5.5;
      else if (hole.type === 'tampon') radius = 4.5;

      const isFired = firedHoles.has(hole.id);
      const pulseT = pulsingHoles.get(hole.id);
      const isPulsing = pulseT !== undefined && pulseT > 0;

      // Glow / pulse effect
      if (isPulsing && pulseT !== undefined) {
        const glowAlpha = Math.max(0, pulseT / 600);
        const glowRadius = radius + 10 * (1 - pulseT / 600);
        ctx.save();
        ctx.globalAlpha = glowAlpha * 0.7;
        const grd = ctx.createRadialGradient(sx, sy, radius, sx, sy, glowRadius + radius);
        grd.addColorStop(0, color);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(sx, sy, glowRadius + radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (hole.type === 'tampon') {
        // Ring/outline style for tampon
        ctx.save();
        if (isFired) {
          ctx.globalAlpha = 0.9;
        } else if (animating) {
          ctx.globalAlpha = 0.25;
        }
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        // Thin inner fill
        ctx.fillStyle = delayColor(hole.delay_ms, 0.2);
        ctx.fill();
        ctx.restore();
      } else {
        // Filled circle for bouchon and masse
        ctx.save();
        if (isFired) {
          ctx.globalAlpha = 1;
        } else if (animating) {
          ctx.globalAlpha = 0.22;
        }

        // Shadow/glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;

        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Border
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      }

      // Delay label — only show when not animating or when hole is fired
      if (!animating || isFired) {
        ctx.save();
        ctx.globalAlpha = animating ? (isFired ? 1 : 0.15) : 0.85;
        ctx.font = `bold 8px -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const labelMs = hole.delay_ms >= 1000
          ? `${(hole.delay_ms / 1000).toFixed(1)}s`
          : `${hole.delay_ms}`;

        // Background pill
        const textMetrics = ctx.measureText(labelMs);
        const tw = textMetrics.width + 4;
        const th = 10;
        const lx = sx;
        const ly = sy - radius - 7;

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.roundRect(lx - tw / 2, ly - th / 2, tw, th, 3);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.fillText(labelMs, lx, ly);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  function drawLegend(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const margin = 40;
    const barW = Math.min(w - margin * 2, 300);
    const barH = 8;
    const bx = margin;
    const by = h - 22;

    // Gradient bar
    const grd = ctx.createLinearGradient(bx, by, bx + barW, by);
    const stops = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    for (const s of stops) {
      grd.addColorStop(s, delayColor(delayMin + (delayMax - delayMin) * s));
    }
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.roundRect(bx, by, barW, barH, 3);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, barW, barH, 3);
    ctx.stroke();

    // Labels
    ctx.font = '9px -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${delayMin} ms`, bx, by + barH + 2);

    ctx.textAlign = 'right';
    ctx.fillText(`${delayMax} ms`, bx + barW, by + barH + 2);

    ctx.textAlign = 'center';
    ctx.fillText('Délai', bx + barW / 2, by + barH + 2);

    // Hole count info
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${firingSequence.holes.length} trous`, w - margin + 36, h - 8);

    // Animation progress bar
    if (animating || animTime > 0) {
      const pct = Math.min(1, animTime / animMaxTime);
      const progressW = barW * pct;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.roundRect(bx, by - 5, barW, 2, 1);
      ctx.fill();

      ctx.fillStyle = '#a78bfa';
      ctx.beginPath();
      ctx.roundRect(bx, by - 5, progressW, 2, 1);
      ctx.fill();
    }
  }

  // ─── Animation ─────────────────────────────────────────────────────────────

  function startAnimation() {
    if (animating) return;
    animating = true;
    animTime = 0;
    firedHoles = new Set();
    pulsingHoles = new Map();
    animLastTs = null;
    scheduleFrame();
  }

  function pauseAnimation() {
    animating = false;
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  function stopAnimation() {
    pauseAnimation();
    animTime = 0;
    firedHoles = new Set();
    pulsingHoles = new Map();
    render();
  }

  function scheduleFrame() {
    animFrameId = requestAnimationFrame(animFrame);
  }

  function animFrame(ts: number) {
    if (!animating) return;

    if (animLastTs === null) animLastTs = ts;
    const dtReal = ts - animLastTs;
    animLastTs = ts;

    // Advance simulated time
    const dtSim = dtReal * animSpeed;
    animTime = animTime + dtSim;

    // Update pulsing holes — decay
    const newPulsing = new Map<number, number>();
    for (const [id, t] of pulsingHoles) {
      const remaining = t - dtReal;
      if (remaining > 0) newPulsing.set(id, remaining);
    }

    // Fire holes that have reached their delay
    for (const hole of firingSequence.holes) {
      if (hole.delay_ms <= animTime && !firedHoles.has(hole.id)) {
        firedHoles = new Set([...firedHoles, hole.id]);
        newPulsing.set(hole.id, 600); // pulse for 600ms
      }
    }
    pulsingHoles = newPulsing;

    render();

    if (animTime < animMaxTime) {
      scheduleFrame();
    } else {
      animating = false;
      animFrameId = null;
      // Show all holes fired
      firedHoles = new Set(firingSequence.holes.map(h => h.id));
      render();
    }
  }

  // ─── Interaction ───────────────────────────────────────────────────────────

  function getCanvasPoint(e: MouseEvent | Touch): { cx: number; cy: number } {
    if (!canvas) return { cx: 0, cy: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      cx: (e.clientX - rect.left),
      cy: (e.clientY - rect.top),
    };
  }

  function findHoleAt(cx: number, cy: number): FiringHole | null {
    if (!canvas) return null;
    const { w, h } = getCanvasSize();
    const hitRadius = 14;
    for (const hole of firingSequence.holes) {
      const { sx, sy } = worldToScreen(hole.x, hole.y, w, h);
      const dx = cx - sx;
      const dy = cy - sy;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        return hole;
      }
    }
    return null;
  }

  function onMouseMove(e: MouseEvent) {
    if (!interactive) return;
    if (isDragging) {
      panX = lastPanX + (e.clientX - dragStartX);
      panY = lastPanY + (e.clientY - dragStartY);
      tooltip = null;
      render();
      return;
    }
    const { cx, cy } = getCanvasPoint(e);
    const hole = findHoleAt(cx, cy);
    if (hole) {
      const rect = canvas.getBoundingClientRect();
      tooltip = {
        hole,
        screenX: rect.left + cx,
        screenY: rect.top + cy,
      };
      canvas.style.cursor = 'pointer';
    } else {
      tooltip = null;
      canvas.style.cursor = 'grab';
    }
  }

  function onMouseDown(e: MouseEvent) {
    if (!interactive) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    lastPanX = panX;
    lastPanY = panY;
    canvas.style.cursor = 'grabbing';
    tooltip = null;
  }

  function onMouseUp() {
    isDragging = false;
    if (canvas) canvas.style.cursor = 'grab';
  }

  function onWheel(e: WheelEvent) {
    if (!interactive) return;
    e.preventDefault();
    const { cx, cy } = getCanvasPoint(e);
    const factor = e.deltaY < 0 ? 1.12 : 0.88;
    const newZoom = Math.max(0.3, Math.min(8, zoom * factor));

    // Zoom toward cursor
    const zoomRatio = newZoom / zoom;
    panX = cx - zoomRatio * (cx - panX);
    panY = cy - zoomRatio * (cy - panY);
    zoom = newZoom;
    render();
  }

  function onTouchStart(e: TouchEvent) {
    if (!interactive) return;
    if (e.touches.length === 1) {
      const t = e.touches[0];
      isDragging = true;
      dragStartX = t.clientX;
      dragStartY = t.clientY;
      lastPanX = panX;
      lastPanY = panY;
    } else if (e.touches.length === 2) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      lastPinchDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      lastPinchMidX = (t0.clientX + t1.clientX) / 2;
      lastPinchMidY = (t0.clientY + t1.clientY) / 2;
    }
    tooltip = null;
  }

  function onTouchMove(e: TouchEvent) {
    if (!interactive) return;
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      const t = e.touches[0];
      panX = lastPanX + (t.clientX - dragStartX);
      panY = lastPanY + (t.clientY - dragStartY);
      render();
    } else if (e.touches.length === 2) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const midX = (t0.clientX + t1.clientX) / 2;
      const midY = (t0.clientY + t1.clientY) / 2;

      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const cx = midX - rect.left;
        const cy = midY - rect.top;

        const factor = dist / lastPinchDist;
        const newZoom = Math.max(0.3, Math.min(8, zoom * factor));
        const zoomRatio = newZoom / zoom;
        panX = cx - zoomRatio * (cx - panX);
        panY = cy - zoomRatio * (cy - panY);
        zoom = newZoom;
      }

      lastPinchDist = dist;
      lastPinchMidX = midX;
      lastPinchMidY = midY;
      render();
    }
  }

  function onTouchEnd(e: TouchEvent) {
    if (e.touches.length === 0) {
      isDragging = false;
      // Check for tap on hole
      if (interactive && e.changedTouches.length === 1) {
        const t = e.changedTouches[0];
        const { cx, cy } = getCanvasPoint(t);
        const hole = findHoleAt(cx, cy);
        if (hole) {
          const rect = canvas.getBoundingClientRect();
          tooltip = {
            hole,
            screenX: rect.left + cx,
            screenY: rect.top + cy,
          };
        } else {
          tooltip = null;
        }
      }
    }
  }

  function resetView() {
    panX = 0;
    panY = 0;
    zoom = 1;
    render();
  }

  // ─── Export ────────────────────────────────────────────────────────────────

  function exportPNG() {
    if (!canvas) return;

    // Render a clean frame first (stop animation temporarily)
    const wasAnimating = animating;
    if (wasAnimating) pauseAnimation();

    // Create an off-screen canvas with header
    const dpr = window.devicePixelRatio || 1;
    const { w, h } = getCanvasSize();
    const headerH = 48;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = Math.round(w * dpr);
    exportCanvas.height = Math.round((h + headerH) * dpr);

    const ectx = exportCanvas.getContext('2d');
    if (!ectx) return;

    ectx.scale(dpr, dpr);

    // Header background
    ectx.fillStyle = '#0f1117';
    ectx.fillRect(0, 0, w, headerH);

    // Title
    ectx.font = 'bold 15px -apple-system, sans-serif';
    ectx.fillStyle = '#e8eaf6';
    ectx.textAlign = 'left';
    ectx.textBaseline = 'middle';
    ectx.fillText(`💥 ${title}`, 14, 16);

    if (shotInfo) {
      ectx.font = '11px -apple-system, sans-serif';
      ectx.fillStyle = '#6b7299';
      ectx.fillText(shotInfo, 14, 34);
    }

    // Date top right
    ectx.font = '10px -apple-system, sans-serif';
    ectx.fillStyle = '#6b7299';
    ectx.textAlign = 'right';
    ectx.fillText(new Date().toLocaleDateString('fr-CA'), w - 14, 24);

    // Hole count
    ectx.font = '10px -apple-system, sans-serif';
    ectx.fillStyle = '#a78bfa';
    ectx.textAlign = 'right';
    ectx.fillText(`${firingSequence.holes.length} trous`, w - 14, 36);

    // Divider
    ectx.strokeStyle = '#2d3148';
    ectx.lineWidth = 1;
    ectx.beginPath();
    ectx.moveTo(0, headerH - 1);
    ectx.lineTo(w, headerH - 1);
    ectx.stroke();

    // Copy main canvas
    ectx.drawImage(canvas, 0, headerH, w, h);

    // Download
    exportCanvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blast-pattern-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');

    if (wasAnimating) startAnimation();
  }

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  $effect(() => {
    // Re-render whenever firingSequence changes
    if (firingSequence && canvas) {
      render();
    }
  });

  $effect(() => {
    // Set up resize observer
    if (!container) return;

    const ro = new ResizeObserver(() => {
      render();
    });
    ro.observe(container);

    return () => ro.disconnect();
  });

  $effect(() => {
    // Initial render after canvas is mounted
    if (canvas) {
      render();
    }
  });

  $effect(() => {
    // Cleanup animation on destroy
    return () => {
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
      }
    };
  });

  // Speed options
  const speedOptions = [
    { label: '0.5×', value: 0.5 },
    { label: '1×', value: 1 },
    { label: '2×', value: 2 },
    { label: '5×', value: 5 },
  ];

  // Type label helper
  function typeLabel(type?: string) {
    if (type === 'bouchon') return '○ Bouchon';
    if (type === 'masse') return '● Masse';
    if (type === 'tampon') return '◑ Tampon';
    return '● Trou';
  }
</script>

<div style="width: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;">

  <!-- Canvas container -->
  <div
    bind:this={container}
    style="
      position: relative; width: 100%; background: #111827;
      border-radius: 10px; overflow: hidden;
      border: 1px solid #2d3148;
    "
  >
    <canvas
      bind:this={canvas}
      style="display: block; width: 100%; cursor: {isDragging ? 'grabbing' : 'grab'}; touch-action: none;"
      onmousemove={onMouseMove}
      onmousedown={onMouseDown}
      onmouseup={onMouseUp}
      onmouseleave={onMouseUp}
      onwheel={onWheel}
      ontouchstart={onTouchStart}
      ontouchmove={onTouchMove}
      ontouchend={onTouchEnd}
    ></canvas>

    <!-- Reset view button -->
    {#if interactive}
      <button
        onclick={resetView}
        title="Réinitialiser la vue"
        style="
          position: absolute; top: 8px; right: 8px;
          width: 28px; height: 28px; border-radius: 6px;
          background: rgba(30,33,48,0.85); border: 1px solid #2d3148;
          color: #a0a8cc; cursor: pointer; font-size: 14px;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(4px);
        "
      >⊡</button>
    {/if}
  </div>

  <!-- Tooltip (rendered outside canvas as HTML overlay) -->
  {#if tooltip}
    {@const hole = tooltip.hole}
    <div style="
      position: fixed;
      left: {tooltip.screenX + 12}px;
      top: {tooltip.screenY - 20}px;
      z-index: 1000;
      background: #1e2130;
      border: 1px solid #2d3148;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 12px;
      color: #e8eaf6;
      pointer-events: none;
      min-width: 130px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    ">
      <div style="font-weight: 700; color: #a78bfa; margin-bottom: 4px;">Trou #{hole.id}</div>
      <div style="color: #a0a8cc; margin-bottom: 2px;">{typeLabel(hole.type)}</div>
      <div style="
        font-size: 14px; font-weight: 700;
        color: {(() => {
          const range = delayMax - delayMin;
          const t = range > 0 ? Math.max(0, Math.min(1, (hole.delay_ms - delayMin) / range)) : 0;
          const stops: [number, number, number, number][] = [
            [0.00, 64, 120, 255], [0.20, 0, 220, 255], [0.40, 50, 220, 80],
            [0.60, 255, 230, 0], [0.80, 255, 130, 0], [1.00, 255, 40, 40],
          ];
          let r = 255, g = 255, b = 255;
          for (let i = 0; i < stops.length - 1; i++) {
            const [t0, r0, g0, b0] = stops[i];
            const [t1, r1, g1, b1] = stops[i + 1];
            if (t >= t0 && t <= t1) {
              const f = (t - t0) / (t1 - t0);
              r = Math.round(r0 + (r1 - r0) * f);
              g = Math.round(g0 + (g1 - g0) * f);
              b = Math.round(b0 + (b1 - b0) * f);
              break;
            }
          }
          return `rgb(${r},${g},${b})`;
        })()};
        margin-bottom: 4px;
      ">{hole.delay_ms} ms</div>
      <div style="font-size: 10px; color: #6b7299;">
        X: {hole.x.toFixed(3)} · Y: {hole.y.toFixed(3)}
      </div>
    </div>
  {/if}

  <!-- Controls bar -->
  <div style="
    display: flex; align-items: center; gap: 8px; margin-top: 8px; flex-wrap: wrap;
  ">
    <!-- Animation controls -->
    {#if showAnimation}
      <div style="display: flex; align-items: center; gap: 6px; flex: 1; flex-wrap: wrap;">
        {#if !animating}
          <button
            onclick={startAnimation}
            style="
              padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600;
              background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.4);
              color: #a78bfa; cursor: pointer; font-family: inherit;
            "
          >▶ Animer</button>
          {#if animTime > 0}
            <button
              onclick={stopAnimation}
              style="
                padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
                background: transparent; border: 1px solid #2d3148;
                color: #6b7299; cursor: pointer; font-family: inherit;
              "
            >↺</button>
          {/if}
        {:else}
          <button
            onclick={pauseAnimation}
            style="
              padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600;
              background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.4);
              color: #a78bfa; cursor: pointer; font-family: inherit;
            "
          >⏸ Pause</button>
          <button
            onclick={stopAnimation}
            style="
              padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
              background: transparent; border: 1px solid #2d3148;
              color: #6b7299; cursor: pointer; font-family: inherit;
            "
          >⏹</button>
        {/if}

        <!-- Speed selector -->
        <div style="display: flex; align-items: center; gap: 4px;">
          {#each speedOptions as opt}
            <button
              onclick={() => { animSpeed = opt.value; }}
              style="
                padding: 4px 8px; border-radius: 5px; font-size: 11px; font-weight: 600;
                background: {animSpeed === opt.value ? 'rgba(139,92,246,0.25)' : 'transparent'};
                border: 1px solid {animSpeed === opt.value ? 'rgba(139,92,246,0.5)' : '#2d3148'};
                color: {animSpeed === opt.value ? '#a78bfa' : '#6b7299'};
                cursor: pointer; font-family: inherit;
              "
            >{opt.label}</button>
          {/each}
        </div>

        <!-- Progress indicator -->
        {#if animating || animTime > 0}
          <span style="font-size: 11px; color: #6b7299; margin-left: 4px;">
            {Math.round(animTime)} / {Math.round(animMaxTime)} ms
          </span>
        {/if}
      </div>
    {/if}

    <!-- Export button -->
    {#if showExport}
      <button
        onclick={exportPNG}
        style="
          padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
          background: transparent; border: 1px solid #2d3148;
          color: #6b7299; cursor: pointer; font-family: inherit;
          white-space: nowrap;
        "
      >💾 Sauvegarder image</button>
    {/if}
  </div>
</div>

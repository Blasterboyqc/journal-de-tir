<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { saveJournal, getProfil, genNumeroTir, type ExplosifRow, type GardienRow, type FiringSequence } from '$lib/db';
  import { showToast } from '$lib/stores/app';
  import { parseBlastPlanPDF } from '$lib/pdf-parser';
  import { extractFiringSequence, summarizeFiringSequence } from '$lib/vision-extract';
  import BlastPatternCanvas from '$lib/components/BlastPatternCanvas.svelte';
  import { validateJournal } from '$lib/validation';

  // ─── State ────────────────────────────────────────────────────────────────

  let saving = $state(false);
  let importing = $state(false);
  let visionExtracting = $state(false);
  let activeSection = $state(0);
  let sigCanvas = $state<HTMLCanvasElement | null>(null);
  let sigCtx: CanvasRenderingContext2D | null = null;
  let sigDrawing = false;
  let sigLastX = 0, sigLastY = 0;
  let pdfFileInput = $state<HTMLInputElement | null>(null);

  // Freehand drawing canvas (patron de forage)
  let drawCanvas = $state<HTMLCanvasElement | null>(null);
  let drawCtx: CanvasRenderingContext2D | null = null;
  let drawDrawing = false;
  let drawLastX = 0, drawLastY = 0;
  let drawColor = $state('#ffffff');
  let drawLineWidth = $state(3);
  let drawHistory = $state<ImageData[]>([]);

  // Preview mode
  let showPreview = $state(false);

  // Import summary state
  let importSummary = $state<{
    autoFilled: { field: string; label: string; value: string }[];
    fieldsExtracted: number;
    documentType: string;
    warnings: string[];
    explosifsCount: number;
  } | null>(null);
  let importSummaryExpanded = $state(true);

  // Field source tracking: 'pdf' | 'vision' | 'manual' | 'changed'
  let fieldSources = $state<Record<string, 'pdf' | 'vision' | 'changed'>>({});

  // Form data — all ASP sections A-J
  let form = $state({
    numero_tir: genNumeroTir(),
    statut: 'brouillon' as 'brouillon' | 'complete' | 'archive',

    // Section A — Identification du chantier
    date_tir: new Date().toISOString().split('T')[0],
    heure_tir: (() => {
      const now = new Date();
      const m = Math.round(now.getMinutes() / 15) * 15;
      const h = now.getHours() + Math.floor(m / 60);
      return String(h % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
    })(),
    nom_entreprise: '',
    adresse_entreprise: '',
    chantier: '',
    donneur_ouvrage: '',
    station: '',
    contrat: '',
    nb_volees_quotidiennes: '',

    // Section B — Boutefeu
    boutefeu_prenom: '',
    boutefeu_nom: '',
    boutefeu_certificat: '',
    boutefeu_permis_sq: '',
    superviseur: '',
    employeur: '',

    // Section C — Conditions climatiques
    temperature: '',
    meteo: 'Ensoleillé',
    meteo_ensoleille: false,
    meteo_nuageux: false,
    meteo_pluie: false,
    meteo_neige: false,
    vent_direction_vitesse: '',
    conditions_roc: 'Sec',
    geologie: '',
    type_roc: 'Roc dur',

    // Section D — Données sur le forage
    type_tir: 'Banc',
    nb_trous: '',
    diametre: '',
    espacement: '',
    fardeau: '',
    profondeur_prevue: '',
    profondeur_reelle: '',
    hauteur_collet: '',
    nature_bourre: '',
    hauteur_mort_terrain: '',
    sous_forage: '',
    inclinaison: '90',
    orientation: '',
    vibrations_valeur_respecter: '',
    vibrations_ppv: '',
    vibrations_sismographes: '',
    nb_trous_predecoupage: '',
    type_pare_eclats: '',
    pare_eclats_dimension: '',
    pare_eclats_nombre: '',

    // Section E — Distances des structures
    dist_batiment: '',
    dist_pont: '',
    dist_route: '',
    dist_ligne_electrique: '',
    dist_structure_souterraine: '',

    // Section F — Explosifs / Détonateurs
    detonateurs: '',
    type_detonateurs: 'Non-électrique (NONEL)',
    sequence_delais: '',
    nb_detonateurs: '',
    type_emulsion_pompee: '',
    volume_roc_m3: '',
    facteur_chargement: '',

    // Section G — Recommandations
    camera_video: '' as '' | 'Oui' | 'Non',
    ecaillage_securite: '' as '' | 'Oui' | 'Non',
    detecteur_co_bnq: '' as '' | 'Oui' | 'Non',

    // Sécurité opérationnelle
    zone_securite_m: '',
    signaux_utilises: '3 coups de klaxon (Attention), 1 coup (Tir), 2 coups (Tout clair)',
    procedures_suivies: false,
    zone_evacuee: false,
    communication_etablie: false,
    inspection_avant: false,

    // Section H — Résultats du sautage
    heure_mise_a_feu: '',
    concentration_co_ppm: '',
    fracturation_exigee: '' as '' | 'Oui' | 'Non',
    bris_hors_profil: '' as '' | 'Oui' | 'Non',
    trous_rates: 'non',
    nb_trous_rates: '',
    projection: '' as '' | 'Oui' | 'Non',
    projection_distance_pierres: '',
    description_dommages: '',
    fragmentation: '',
    projection_max_m: '',
    bruit_db: '',
    fumee_couleur: '',
    description_rates: '',
    procedures_rates: '',
    resultats_generaux: '',

    // Récap
    total_explosif_kg: '',
    total_detonateurs: '',
    ratio_poudre: '',

    // Section I — Remarques
    remarques: '',

    // Section J — Signature
    signature_data: '',
    signature_date: new Date().toISOString().split('T')[0],

    // Plan du patron de forage (dessin libre)
    patron_forage_dataurl: '',
  });

  let explosifs = $state<ExplosifRow[]>([]);
  let gardiens = $state<GardienRow[]>([]);

  // Vision AI — Firing Sequence (Phase 2)
  let firingSequence = $state<FiringSequence | null>(null);
  let visionPdfFile = $state<File | null>(null);
  let visionShowPreview = $state(false);

  // Validation state (derived)
  let validationResult = $derived(validateJournal({
    ...form,
    explosifs,
  }));

  // ─── Section config ───────────────────────────────────────────────────────

  const sections = [
    '① Identification',
    '② Boutefeu',
    '③ Conditions',
    '④ Forage',
    '⑤ Explosifs',
    '⑥ Sécurité',
    '⑦ Résultats',
    '⑧ Signature',
  ];

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  onMount(async () => {
    const profil = await getProfil();
    if (profil) {
      form.boutefeu_prenom = profil.prenom;
      form.boutefeu_nom = profil.nom;
      form.boutefeu_certificat = profil.certificat_cstc;
      form.boutefeu_permis_sq = profil.permis_sq;
      form.employeur = profil.employeur;
      form.nom_entreprise = profil.employeur;
      form.chantier = profil.chantier_actuel;
    }
    setTimeout(() => { initSig(); initDraw(); }, 100);
  });

  // ─── Signature canvas ─────────────────────────────────────────────────────

  function initSig() {
    if (!sigCanvas) return;
    sigCtx = sigCanvas.getContext('2d');
    if (!sigCtx) return;
    sigCtx.strokeStyle = '#4f6ef7';
    sigCtx.lineWidth = 2.5;
    sigCtx.lineCap = 'round';
    sigCtx.lineJoin = 'round';
  }

  function getPos(e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e instanceof TouchEvent) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: ((e as MouseEvent).clientX - rect.left) * scaleX, y: ((e as MouseEvent).clientY - rect.top) * scaleY };
  }

  function startDraw(e: MouseEvent | TouchEvent) {
    if (!sigCtx || !sigCanvas) return;
    e.preventDefault();
    sigDrawing = true;
    const pos = getPos(e, sigCanvas);
    sigLastX = pos.x;
    sigLastY = pos.y;
  }

  function draw(e: MouseEvent | TouchEvent) {
    if (!sigDrawing || !sigCtx || !sigCanvas) return;
    e.preventDefault();
    const pos = getPos(e, sigCanvas);
    sigCtx.beginPath();
    sigCtx.moveTo(sigLastX, sigLastY);
    sigCtx.lineTo(pos.x, pos.y);
    sigCtx.stroke();
    sigLastX = pos.x;
    sigLastY = pos.y;
  }

  function endDraw() {
    sigDrawing = false;
    if (sigCanvas) {
      form.signature_data = sigCanvas.toDataURL('image/png');
    }
  }

  function clearSig() {
    if (!sigCtx || !sigCanvas) return;
    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    form.signature_data = '';
  }

  // ─── Freehand Drawing Canvas (patron de forage) ────────────────────────────

  function initDraw() {
    if (!drawCanvas) return;
    drawCtx = drawCanvas.getContext('2d');
    if (!drawCtx) return;
    // Dark background
    drawCtx.fillStyle = '#1a1a2e';
    drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
    drawCtx.strokeStyle = drawColor;
    drawCtx.lineWidth = drawLineWidth;
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    // Restore existing drawing if any
    if (form.patron_forage_dataurl) {
      const img = new Image();
      img.onload = () => { drawCtx?.drawImage(img, 0, 0); };
      img.src = form.patron_forage_dataurl;
    }
  }

  function startDrawFreehand(e: MouseEvent | TouchEvent) {
    if (!drawCtx || !drawCanvas) return;
    e.preventDefault();
    drawDrawing = true;
    // Save state for undo
    const snapshot = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
    drawHistory = [...drawHistory, snapshot];
    if (drawHistory.length > 30) drawHistory = drawHistory.slice(-30);
    const pos = getPos(e, drawCanvas);
    drawLastX = pos.x;
    drawLastY = pos.y;
    // Apply current color/width
    drawCtx.strokeStyle = drawColor;
    drawCtx.lineWidth = drawLineWidth;
  }

  function drawFreehand(e: MouseEvent | TouchEvent) {
    if (!drawDrawing || !drawCtx || !drawCanvas) return;
    e.preventDefault();
    const pos = getPos(e, drawCanvas);
    drawCtx.beginPath();
    drawCtx.moveTo(drawLastX, drawLastY);
    drawCtx.lineTo(pos.x, pos.y);
    drawCtx.stroke();
    drawLastX = pos.x;
    drawLastY = pos.y;
  }

  function endDrawFreehand() {
    drawDrawing = false;
    if (drawCanvas) {
      form.patron_forage_dataurl = drawCanvas.toDataURL('image/png');
    }
  }

  function undoDraw() {
    if (!drawCtx || !drawCanvas || drawHistory.length === 0) return;
    const prev = drawHistory[drawHistory.length - 1];
    drawHistory = drawHistory.slice(0, -1);
    drawCtx.putImageData(prev, 0, 0);
    form.patron_forage_dataurl = drawCanvas.toDataURL('image/png');
  }

  function clearDraw() {
    if (!drawCtx || !drawCanvas) return;
    drawCtx.fillStyle = '#1a1a2e';
    drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
    drawHistory = [];
    form.patron_forage_dataurl = '';
  }

  $effect(() => {
    // Re-init draw when section 3 becomes active (canvas may have been rendered)
    if (activeSection === 3 && !drawCtx) {
      setTimeout(() => initDraw(), 50);
    }
  });

  // ─── Explosifs ────────────────────────────────────────────────────────────

  function addExplosif() {
    explosifs = [...explosifs, {
      id: Date.now().toString(),
      type: '',
      fabricant: '',
      lot: '',
      quantite_par_trou: '',
      nb_trous: '',
      total_kg: '',
      unite: 'kg'
    }];
  }

  function removeExplosif(id: string) {
    explosifs = explosifs.filter(e => e.id !== id);
    recalcTotal();
  }

  function recalcTotal() {
    let total = 0;
    explosifs.forEach(e => {
      const t = parseFloat(e.total_kg) || 0;
      total += t;
    });
    form.total_explosif_kg = total > 0 ? total.toFixed(2) : '';
    form.total_detonateurs = form.nb_detonateurs;
    const nTrous = parseInt(form.nb_trous) || 0;
    const prof = parseFloat(form.profondeur_reelle || form.profondeur_prevue) || 0;
    const esp = parseFloat(form.espacement) || 0;
    const fard = parseFloat(form.fardeau) || 0;
    if (total > 0 && esp > 0 && fard > 0 && prof > 0) {
      const tonnage = esp * fard * prof * nTrous * 2.5;
      form.ratio_poudre = tonnage > 0 ? (total / tonnage).toFixed(3) : '';
    }
  }

  function recalcExplosifRow(e: ExplosifRow) {
    const qtt = parseFloat(e.quantite_par_trou) || 0;
    const n = parseInt(e.nb_trous) || 0;
    if (qtt > 0 && n > 0) {
      e.total_kg = (qtt * n).toFixed(2);
    }
    recalcTotal();
  }

  // ─── Gardiens ─────────────────────────────────────────────────────────────

  function addGardien() {
    gardiens = [...gardiens, { id: Date.now().toString(), nom: '', poste: '' }];
  }

  function removeGardien(id: string) {
    gardiens = gardiens.filter(g => g.id !== id);
  }

  // ─── Save ─────────────────────────────────────────────────────────────────

  async function saveAsDraft() {
    await doSave('brouillon');
  }

  async function saveAsComplete() {
    if (!validationResult.valid) {
      showToast(`❌ ${validationResult.errors[0]}`, 'error');
      // Navigate to problematic section
      const firstErrSection = validationResult.sectionStatus.findIndex(s => s.status === 'error');
      if (firstErrSection >= 0) activeSection = firstErrSection;
      return;
    }
    await doSave('complete');
  }

  async function doSave(statut: 'brouillon' | 'complete' | 'archive') {
    if (saving) return;
    saving = true;
    try {
      const now = new Date().toISOString();
      // Svelte 5 $state() creates Proxy objects that IndexedDB cannot serialize.
      // Use $state.snapshot() to get plain, cloneable objects before saving to Dexie.
      const formSnap = $state.snapshot(form);
      const explosifsSnap = $state.snapshot(explosifs);
      const gardiensSnap = $state.snapshot(gardiens);
      const firingSnap = firingSequence ? $state.snapshot(firingSequence) : undefined;
      const id = await saveJournal({
        ...formSnap,
        statut,
        explosifs: explosifsSnap,
        gardiens: gardiensSnap,
        firingSequence: firingSnap,
        createdAt: now,
        updatedAt: now,
      });
      showToast(statut === 'complete' ? '✅ Journal complété et sauvegardé!' : '💾 Brouillon sauvegardé', 'success');
      setTimeout(() => goto(base + `/journal/${id}`), 500);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      saving = false;
    }
  }

  // ─── Field source helpers ─────────────────────────────────────────────────

  function markFieldSource(field: string, source: 'pdf' | 'vision') {
    fieldSources[field] = source;
  }

  function onFieldChange(field: string) {
    if (fieldSources[field] === 'pdf' || fieldSources[field] === 'vision') {
      fieldSources[field] = 'changed';
    }
  }

  function fieldBorderStyle(field: string): string {
    const src = fieldSources[field];
    if (src === 'pdf') return 'border-left: 3px solid #3b82f6 !important;';
    if (src === 'vision') return 'border-left: 3px solid #a855f7 !important;';
    if (src === 'changed') return 'border-left: 3px solid #22c55e !important;';
    return '';
  }

  // ─── PDF Import ───────────────────────────────────────────────────────────

  async function importFromPDF(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    visionPdfFile = file;
    firingSequence = null;
    visionShowPreview = false;
    importSummary = null;
    importSummaryExpanded = true;
    fieldSources = {};

    importing = true;
    try {
      const result = await parseBlastPlanPDF(file);
      const data = result.journalData;

      const autoFilled: { field: string; label: string; value: string }[] = [];

      function applyField(field: string, label: string, val: string | undefined, force = false) {
        if (!val) return;
        const existing = (form as Record<string, string>)[field];
        if (force || !existing) {
          (form as Record<string, string>)[field] = val;
          markFieldSource(field, 'pdf');
          autoFilled.push({ field, label, value: val.substring(0, 60) });
        }
      }

      applyField('numero_tir', 'Numéro de tir', data.numero_tir, true);
      applyField('date_tir', 'Date du tir', data.date_tir, true);
      applyField('station', 'Localisation / chaînage', data.station);
      applyField('chantier', 'Localisation du chantier', data.chantier);
      applyField('contrat', 'No. contrat', data.contrat);
      applyField('type_tir', 'Type de tir', data.type_tir, true);
      applyField('nb_trous', 'Nombre de trous', data.nb_trous, true);
      applyField('diametre', 'Diamètre de forage', data.diametre);
      applyField('profondeur_prevue', 'Profondeur prévue', data.profondeur_prevue);
      applyField('espacement', 'Espacement', data.espacement);
      applyField('fardeau', 'Fardeau', data.fardeau);
      applyField('sous_forage', 'Sous-forage', data.sous_forage);
      applyField('inclinaison', 'Inclinaison', data.inclinaison);
      applyField('detonateurs', 'Marque détonateurs', data.detonateurs);
      applyField('type_detonateurs', 'Type détonateurs', data.type_detonateurs, true);
      applyField('nb_detonateurs', 'Nb détonateurs', data.nb_detonateurs, true);
      applyField('sequence_delais', 'Séquence délais', data.sequence_delais);
      applyField('vibrations_ppv', 'Vibrations PPV', data.vibrations_ppv);

      if (data.superviseur && !form.superviseur) {
        form.superviseur = data.superviseur;
        markFieldSource('superviseur', 'pdf');
        autoFilled.push({ field: 'superviseur', label: 'Superviseur', value: data.superviseur });
      }
      if (data.remarques) {
        form.remarques = form.remarques
          ? form.remarques + '\n\n' + data.remarques
          : data.remarques;
        markFieldSource('remarques', 'pdf');
        autoFilled.push({ field: 'remarques', label: 'Remarques', value: data.remarques.substring(0, 60) });
      }

      let explosifsCount = 0;
      if (data.explosifs && data.explosifs.length > 0) {
        explosifs = data.explosifs.map(e => ({ ...e, id: Date.now().toString() + Math.random() }));
        explosifsCount = explosifs.length;
        recalcTotal();
        autoFilled.push({ field: 'explosifs', label: 'Produits explosifs', value: `${explosifsCount} produit(s) importé(s)` });
      }

      const typeLabel = result.documentType === 'bench' ? 'banquette'
        : result.documentType === 'tunnel_advance' ? 'foncée' : 'inconnu';

      importSummary = {
        autoFilled,
        fieldsExtracted: result.fieldsExtracted,
        documentType: typeLabel,
        warnings: result.warnings || [],
        explosifsCount,
      };

      showToast(`📋 ${result.fieldsExtracted} champs remplis automatiquement (plan de ${typeLabel})`, 'success');
      activeSection = 0;
    } catch (err) {
      console.error('PDF import error:', err);
      showToast('❌ Erreur lors de l\'analyse du PDF', 'error');
    } finally {
      importing = false;
      if (pdfFileInput) pdfFileInput.value = '';
    }
  }

  // ─── Vision AI Extraction ─────────────────────────────────────────────────

  async function runVisionExtract() {
    if (!visionPdfFile) {
      showToast('⚠️ Importez d\'abord un plan de tir PDF', 'info');
      return;
    }
    if (visionExtracting) return;

    visionExtracting = true;
    try {
      showToast('🤖 Analyse Vision AI en cours... (peut prendre 15-30 sec)', 'info');

      const shotInfo = {
        tirNumber: form.numero_tir ? parseInt(form.numero_tir.replace(/\D/g, '').slice(-4)) || undefined : undefined,
        totalHoles: form.nb_trous ? parseInt(form.nb_trous) || undefined : undefined,
      };

      const result = await extractFiringSequence(visionPdfFile, shotInfo);
      firingSequence = result.firingSequence;
      visionShowPreview = true;

      // Mark sequence_delais as vision-sourced
      if (result.firingSequence.holes.length > 0) {
        markFieldSource('sequence_delais', 'vision');
      }

      const confidence = Math.round((result.firingSequence.confidence ?? 0) * 100);
      const holeCount = result.firingSequence.holes.length;
      showToast(`🎯 Séquence extraite: ${holeCount} trous détectés (confiance ${confidence}%)`, 'success');

    } catch (err: unknown) {
      console.error('Vision extraction error:', err);
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      if (msg.includes('fetch') || msg.includes('ECONNREFUSED') || msg.includes('Failed to fetch')) {
        showToast('❌ API Vision inaccessible. Vérifiez l\'URL ou déployez l\'API.', 'error');
      } else if (msg.includes('GEMINI_API_KEY') || msg.includes('API key')) {
        showToast('❌ Clé API Gemini manquante. Configurez GEMINI_API_KEY sur le serveur.', 'error');
      } else if (msg.includes('quota') || msg.includes('429')) {
        showToast('⏳ Quota Gemini dépassé. Attendez une minute et réessayez.', 'error');
      } else {
        showToast(`❌ Erreur Vision AI: ${msg.substring(0, 80)}`, 'error');
      }
    } finally {
      visionExtracting = false;
    }
  }

  // ─── Validation section badge helper ─────────────────────────────────────

  function sectionBadge(i: number): string {
    if (!validationResult.sectionStatus[i]) return '';
    const s = validationResult.sectionStatus[i];
    if (s.status === 'error') return '❌';
    if (s.status === 'warning') return '⚠️';
    return '';
  }
</script>

<div style="padding: 12px 12px 0;">

  <!-- Hidden PDF file input -->
  <input
    bind:this={pdfFileInput}
    type="file"
    accept=".pdf,application/pdf"
    style="display: none;"
    onchange={importFromPDF}
  />

  <!-- Header -->
  <div style="
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 12px 14px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px;
  ">
    <div style="flex: 1;">
      <div style="font-size: 16px; font-weight: 800; color: var(--text);">✏️ Nouveau journal de tir</div>
      <div style="font-size: 11px; color: var(--text3);">{form.numero_tir}</div>
    </div>
    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
      <button
        onclick={() => pdfFileInput?.click()}
        class="btn btn-secondary btn-sm"
        disabled={importing}
        style="background: var(--accent-glow); border-color: var(--accent); color: var(--accent2);"
        title="Importer un plan de tir PDF pour remplir automatiquement le formulaire"
      >
        {importing ? '⏳ Analyse...' : '📄 Importer PDF'}
      </button>
      {#if visionPdfFile}
        <button
          onclick={runVisionExtract}
          class="btn btn-secondary btn-sm"
          disabled={visionExtracting}
          style="background: rgba(139,92,246,0.12); border-color: rgba(139,92,246,0.4); color: #a78bfa;"
          title="Extraire la séquence de tir via Vision AI"
        >
          {visionExtracting ? '🤖 Vision AI...' : firingSequence ? '✅ Séquence extraite' : '🔍 Séquence de tir'}
        </button>
      {/if}
      <button onclick={saveAsDraft} class="btn btn-secondary btn-sm" disabled={saving}>
        💾 Brouillon
      </button>
    </div>
  </div>

  <!-- ── Import Summary Panel ─────────────────────────────────────────────── -->
  {#if importSummary}
    <div style="
      background: var(--card); border: 1px solid rgba(79,110,247,0.4);
      border-radius: var(--radius); margin-bottom: 12px; overflow: hidden;
    ">
      <!-- Summary header -->
      <button
        onclick={() => importSummaryExpanded = !importSummaryExpanded}
        style="
          width: 100%; display: flex; align-items: center; gap: 10px; padding: 11px 14px;
          background: rgba(79,110,247,0.08); border: none; cursor: pointer;
          font-family: inherit; text-align: left;
        "
      >
        <span style="font-size: 14px;">📋</span>
        <div style="flex: 1;">
          <span style="font-size: 13px; font-weight: 700; color: var(--accent2);">
            Import PDF — {importSummary.fieldsExtracted} champs remplis automatiquement
          </span>
          <span style="font-size: 11px; color: var(--text3); margin-left: 8px;">
            Plan de {importSummary.documentType}
            {importSummary.explosifsCount > 0 ? ` · ${importSummary.explosifsCount} produit(s) explosif(s)` : ''}
          </span>
        </div>
        <!-- Legend -->
        <div style="display: flex; gap: 8px; align-items: center; font-size: 10px; color: var(--text3);">
          <span style="display: flex; align-items: center; gap: 3px;">
            <span style="width: 10px; height: 10px; background: #3b82f6; border-radius: 2px; display: inline-block;"></span> PDF
          </span>
          <span style="display: flex; align-items: center; gap: 3px;">
            <span style="width: 10px; height: 10px; background: #a855f7; border-radius: 2px; display: inline-block;"></span> Vision
          </span>
          <span style="display: flex; align-items: center; gap: 3px;">
            <span style="width: 10px; height: 10px; background: #22c55e; border-radius: 2px; display: inline-block;"></span> Modifié
          </span>
        </div>
        <span style="font-size: 12px; color: var(--text3);">{importSummaryExpanded ? '▲' : '▼'}</span>
      </button>

      {#if importSummaryExpanded}
        <div style="padding: 12px 14px;">
          <!-- Auto-filled fields list -->
          {#if importSummary.autoFilled.length > 0}
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;">
              {#each importSummary.autoFilled as item}
                <div style="
                  display: flex; align-items: center; gap: 5px;
                  background: var(--card2); border: 1px solid var(--border);
                  border-radius: 6px; padding: 4px 8px; font-size: 11px;
                ">
                  <span style="color: var(--accent2); font-weight: 600;">{item.label}:</span>
                  <span style="color: var(--text2); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{item.value}</span>
                </div>
              {/each}
            </div>
          {/if}

          <!-- Warnings -->
          {#if importSummary.warnings.length > 0}
            <div style="border-top: 1px solid var(--border); padding-top: 8px; margin-top: 4px;">
              <div style="font-size: 11px; font-weight: 700; color: #f59e0b; margin-bottom: 6px;">⚠️ Avertissements</div>
              {#each importSummary.warnings as warning}
                <div style="font-size: 11px; color: var(--text3); margin-bottom: 3px;">• {warning}</div>
              {/each}
            </div>
          {/if}

          <!-- Reminder to review -->
          <div style="
            font-size: 11px; color: var(--text3); margin-top: 8px;
            padding: 8px 10px; background: var(--card2); border-radius: 6px; line-height: 1.5;
          ">
            💡 Les champs <span style="color: #3b82f6; font-weight: 600;">bleus</span> ont été remplis par le PDF parser ·
            <span style="color: #a855f7; font-weight: 600;">violets</span> par Vision AI ·
            <span style="color: #22c55e; font-weight: 600;">verts</span> ont été modifiés manuellement après import.
            Vérifiez et corrigez au besoin.
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- ── Section tabs with validation badges ─────────────────────────────── -->
  <div style="
    display: flex; gap: 6px; overflow-x: auto; padding-bottom: 10px;
    scrollbar-width: none; margin-bottom: 12px;
  ">
    {#each sections as sec, i}
      {@const badge = sectionBadge(i)}
      <button
        onclick={() => activeSection = i}
        style="
          flex-shrink: 0; padding: 7px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;
          cursor: pointer; border: 1px solid {activeSection === i ? 'var(--accent)' : 'var(--border)'};
          background: {activeSection === i ? 'var(--accent-glow)' : 'var(--card2)'};
          color: {activeSection === i ? 'var(--accent2)' : 'var(--text3)'};
          white-space: nowrap; font-family: inherit; position: relative;
        "
      >{sec}{badge ? ` ${badge}` : ''}</button>
    {/each}
  </div>

  <!-- ────────────────────────────────────────────────────────────────────── -->
  <!-- SECTION 1: IDENTIFICATION (ASP sections A+B) -->
  <!-- ────────────────────────────────────────────────────────────────────── -->
  {#if activeSection === 0}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">①</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Identification du chantier</h3>
      <span style="font-size: 10px; color: var(--text3);">ASP Sections A+B</span>
    </div>
    <div class="card-body">
      <!-- A1: Nom de l'entreprise -->
      <div class="form-row cols1">
        <div class="form-group">
          <label>[A1] Nom de l'entreprise</label>
          <input type="text" bind:value={form.nom_entreprise}
            oninput={() => onFieldChange('nom_entreprise')}
            style={fieldBorderStyle('nom_entreprise')}
            placeholder="Raison sociale de l'entreprise">
        </div>
      </div>
      <!-- A2: Adresse -->
      <div class="form-row cols1">
        <div class="form-group">
          <label>[A2] Adresse (optionnel)</label>
          <input type="text" bind:value={form.adresse_entreprise}
            oninput={() => onFieldChange('adresse_entreprise')}
            style={fieldBorderStyle('adresse_entreprise')}
            placeholder="Adresse de l'entreprise">
        </div>
      </div>
      <!-- A3: Localisation du chantier -->
      <div class="form-row cols1">
        <div class="form-group">
          <label>[A3] Localisation du chantier <span style="color:var(--red)">*</span></label>
          <input type="text" bind:value={form.chantier}
            oninput={() => onFieldChange('chantier')}
            style={fieldBorderStyle('chantier')}
            placeholder="ex: PLB Metro — Secteur Anjou">
        </div>
      </div>
      <!-- A4: Donneur d'ouvrage -->
      <div class="form-row cols1">
        <div class="form-group">
          <label>[A4] Donneur d'ouvrage</label>
          <input type="text" bind:value={form.donneur_ouvrage}
            oninput={() => onFieldChange('donneur_ouvrage')}
            style={fieldBorderStyle('donneur_ouvrage')}
            placeholder="Maître d'ouvrage / client">
        </div>
      </div>
      <div class="divider"></div>
      <!-- B1+B2+B3+B4 -->
      <div class="form-row">
        <div class="form-group">
          <label>[B1] Localisation / chaînage</label>
          <input type="text" bind:value={form.station}
            oninput={() => onFieldChange('station')}
            style={fieldBorderStyle('station')}
            placeholder="ex: Station ST-085, ch. 1+250">
        </div>
        <div class="form-group">
          <label>No. contrat</label>
          <input type="text" bind:value={form.contrat}
            oninput={() => onFieldChange('contrat')}
            style={fieldBorderStyle('contrat')}
            placeholder="ex: C-2024-1234">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>[B2] Date du tir <span style="color:var(--red)">*</span></label>
          <input type="date" bind:value={form.date_tir}
            oninput={() => onFieldChange('date_tir')}
            style={fieldBorderStyle('date_tir')}>
        </div>
        <div class="form-group">
          <label>[B3] Heure prévue</label>
          <input type="time" bind:value={form.heure_tir}
            oninput={() => onFieldChange('heure_tir')}
            style={fieldBorderStyle('heure_tir')}>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>[B4] Nombre de volées quotidiennes</label>
          <input type="number" bind:value={form.nb_volees_quotidiennes}
            style={fieldBorderStyle('nb_volees_quotidiennes')}
            placeholder="ex: 2">
        </div>
        <div class="form-group">
          <label>Numéro de tir</label>
          <input type="text" bind:value={form.numero_tir}
            oninput={() => onFieldChange('numero_tir')}
            style={fieldBorderStyle('numero_tir')}
            placeholder="TIR-XXXXXX">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Statut</label>
          <select bind:value={form.statut}>
            <option value="brouillon">Brouillon</option>
            <option value="complete">Complété</option>
            <option value="archive">Archivé</option>
          </select>
        </div>
      </div>
    </div>
  </div>
  {/if}

  <!-- ────────────────────────────────────────────────────────────────────── -->
  <!-- SECTION 2: BOUTEFEU (ASP Section J signature) -->
  <!-- ────────────────────────────────────────────────────────────────────── -->
  {#if activeSection === 1}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">②</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Boutefeu et permis</h3>
      <span style="font-size: 10px; color: var(--text3);">ASP Section J</span>
    </div>
    <div class="card-body">
      <div class="form-row">
        <div class="form-group">
          <label>[J1] Prénom <span style="color:var(--red)">*</span></label>
          <input type="text" bind:value={form.boutefeu_prenom} placeholder="Prénom">
        </div>
        <div class="form-group">
          <label>Nom <span style="color:var(--red)">*</span></label>
          <input type="text" bind:value={form.boutefeu_nom} placeholder="Nom de famille">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Certificat CSTC <span style="color:var(--red)">*</span></label>
          <input type="text" bind:value={form.boutefeu_certificat} placeholder="ex: BF-12345">
        </div>
        <div class="form-group">
          <label>Permis SQ <span style="color:var(--red)">*</span></label>
          <input type="text" bind:value={form.boutefeu_permis_sq} placeholder="ex: SQ-2024-XXX">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Superviseur</label>
          <input type="text" bind:value={form.superviseur}
            oninput={() => onFieldChange('superviseur')}
            style={fieldBorderStyle('superviseur')}
            placeholder="Nom du superviseur">
        </div>
        <div class="form-group">
          <label>Employeur</label>
          <input type="text" bind:value={form.employeur} placeholder="Entreprise">
        </div>
      </div>
    </div>
  </div>
  {/if}

  <!-- ────────────────────────────────────────────────────────────────────── -->
  <!-- SECTION 3: CONDITIONS (ASP Section C) -->
  <!-- ────────────────────────────────────────────────────────────────────── -->
  {#if activeSection === 2}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">③</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Conditions climatiques</h3>
      <span style="font-size: 10px; color: var(--text3);">ASP Section C</span>
    </div>
    <div class="card-body">
      <!-- C1: Température + C2-C5 météo checkboxes -->
      <div class="form-row">
        <div class="form-group">
          <label>[C1] Température (°C)</label>
          <input type="number" bind:value={form.temperature} placeholder="-10 à 40">
        </div>
      </div>

      <!-- C2-C5: Météo checkboxes (multi-select, ASP style) -->
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 8px;">Conditions météo (C2–C5)</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          {#each [
            { key: 'meteo_ensoleille' as const, label: '☀️ Ensoleillé' },
            { key: 'meteo_nuageux' as const, label: '☁️ Nuageux' },
            { key: 'meteo_pluie' as const, label: '🌧️ Pluie' },
            { key: 'meteo_neige' as const, label: '❄️ Neige' },
          ] as opt}
            <button
              onclick={() => { (form as any)[opt.key] = !(form as any)[opt.key]; }}
              style="
                padding: 9px 12px; border-radius: var(--radius-sm); text-align: center;
                border: 1px solid {(form as any)[opt.key] ? 'var(--accent)' : 'var(--border)'};
                background: {(form as any)[opt.key] ? 'var(--accent-glow)' : 'var(--card2)'};
                color: {(form as any)[opt.key] ? 'var(--accent2)' : 'var(--text3)'};
                font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
              "
            >{opt.label}</button>
          {/each}
        </div>
      </div>

      <!-- C6: Direction et vitesse des vents -->
      <div class="form-row cols1">
        <div class="form-group">
          <label>[C6] Direction et vitesse des vents</label>
          <input type="text" bind:value={form.vent_direction_vitesse}
            placeholder="ex: NE 20 km/h">
        </div>
      </div>

      <div class="divider"></div>

      <!-- Géologie (extra info) -->
      <div class="form-row">
        <div class="form-group">
          <label>Type de roc</label>
          <select bind:value={form.type_roc}>
            <option>Roc dur</option>
            <option>Roc tendre</option>
            <option>Calcaire</option>
            <option>Granite</option>
            <option>Schiste</option>
            <option>Grès</option>
            <option>Roc altéré</option>
            <option>Roc fracturé</option>
          </select>
        </div>
        <div class="form-group">
          <label>Conditions du roc</label>
          <select bind:value={form.conditions_roc}>
            <option>Sec</option>
            <option>Humide</option>
            <option>Trempé</option>
            <option>Fissures présentes</option>
            <option>Fractures majeures</option>
          </select>
        </div>
      </div>
      <div class="form-row cols1">
        <div class="form-group">
          <label>Géologie / Description du terrain</label>
          <textarea bind:value={form.geologie} placeholder="Description détaillée de la géologie..."></textarea>
        </div>
      </div>
    </div>
  </div>
  {/if}

  <!-- ────────────────────────────────────────────────────────────────────── -->
  <!-- SECTION 4: FORAGE (ASP Sections D + E) -->
  <!-- ────────────────────────────────────────────────────────────────────── -->
  {#if activeSection === 3}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">④</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Données sur le forage</h3>
      <span style="font-size: 10px; color: var(--text3);">ASP Sections D+E</span>
    </div>
    <div class="card-body">

      <div class="form-row">
        <div class="form-group">
          <label>Type de tir <span style="color:var(--red)">*</span></label>
          <select bind:value={form.type_tir}>
            <option>Banc</option>
            <option>Tranchée</option>
            <option>Fossé</option>
            <option>Pré-découpage</option>
            <option>Secondaire</option>
            <option>Galerie</option>
            <option>Tunnel</option>
            <option>Cheminée</option>
            <option>Découpe</option>
          </select>
        </div>
        <div class="form-group">
          <label>[D1] Nombre de trous <span style="color:var(--red)">*</span></label>
          <input type="number" bind:value={form.nb_trous}
            oninput={() => onFieldChange('nb_trous')}
            style={fieldBorderStyle('nb_trous')}
            placeholder="ex: 24">
        </div>
      </div>

      <div class="form-row cols3">
        <div class="form-group">
          <label>[D1] Diamètre (mm)</label>
          <input type="number" bind:value={form.diametre}
            oninput={() => onFieldChange('diametre')}
            style={fieldBorderStyle('diametre')}
            placeholder="ex: 76">
        </div>
        <div class="form-group">
          <label>[D2] Espacement (m)</label>
          <input type="number" step="0.1" bind:value={form.espacement}
            oninput={() => onFieldChange('espacement')}
            style={fieldBorderStyle('espacement')}
            placeholder="ex: 1.8">
        </div>
        <div class="form-group">
          <label>[D2] Fardeau (m)</label>
          <input type="number" step="0.1" bind:value={form.fardeau}
            oninput={() => onFieldChange('fardeau')}
            style={fieldBorderStyle('fardeau')}
            placeholder="ex: 1.5">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>[D3] Profondeur prévue (m)</label>
          <input type="number" step="0.1" bind:value={form.profondeur_prevue}
            oninput={() => onFieldChange('profondeur_prevue')}
            style={fieldBorderStyle('profondeur_prevue')}
            placeholder="ex: 4.5">
        </div>
        <div class="form-group">
          <label>Profondeur réelle (m)</label>
          <input type="number" step="0.1" bind:value={form.profondeur_reelle} placeholder="ex: 4.3">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>[D4] Hauteur du collet (m)</label>
          <input type="number" step="0.1" bind:value={form.hauteur_collet}
            oninput={() => onFieldChange('hauteur_collet')}
            style={fieldBorderStyle('hauteur_collet')}
            placeholder="ex: 1.2">
        </div>
        <div class="form-group">
          <label>[D5] Hauteur mort terrain (m)</label>
          <input type="number" step="0.1" bind:value={form.hauteur_mort_terrain}
            oninput={() => onFieldChange('hauteur_mort_terrain')}
            style={fieldBorderStyle('hauteur_mort_terrain')}
            placeholder="ex: 0.5">
        </div>
      </div>

      <!-- D4b: Nature de la bourre (exclusive radio) -->
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 8px;">[D4b] Nature de la bourre</label>
        <div style="display: flex; gap: 8px;">
          {#each ['pierre nette', 'concassée'] as opt}
            <button
              onclick={() => form.nature_bourre = opt}
              style="
                flex: 1; padding: 9px; border-radius: var(--radius-sm);
                border: 1px solid {form.nature_bourre === opt ? 'var(--accent)' : 'var(--border)'};
                background: {form.nature_bourre === opt ? 'var(--accent-glow)' : 'var(--card2)'};
                color: {form.nature_bourre === opt ? 'var(--accent2)' : 'var(--text3)'};
                font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
              "
            >{opt}</button>
          {/each}
          <button
            onclick={() => form.nature_bourre = ''}
            style="
              padding: 9px 12px; border-radius: var(--radius-sm);
              border: 1px solid {form.nature_bourre === '' ? 'var(--accent)' : 'var(--border)'};
              background: {form.nature_bourre === '' ? 'var(--accent-glow)' : 'var(--card2)'};
              color: {form.nature_bourre === '' ? 'var(--accent2)' : 'var(--text3)'};
              font-size: 11px; cursor: pointer; font-family: inherit;
            "
          >—</button>
        </div>
      </div>

      <div class="form-row cols3">
        <div class="form-group">
          <label>Sous-forage (m)</label>
          <input type="number" step="0.1" bind:value={form.sous_forage}
            oninput={() => onFieldChange('sous_forage')}
            style={fieldBorderStyle('sous_forage')}
            placeholder="ex: 0.4">
        </div>
        <div class="form-group">
          <label>Inclinaison (°)</label>
          <input type="number" bind:value={form.inclinaison}
            oninput={() => onFieldChange('inclinaison')}
            style={fieldBorderStyle('inclinaison')}
            placeholder="90 = vertical">
        </div>
        <div class="form-group">
          <label>Orientation</label>
          <input type="text" bind:value={form.orientation} placeholder="ex: N45E">
        </div>
      </div>

      <!-- D6: Vibrations -->
      <div style="
        background: var(--card2); border: 1px solid var(--border);
        border-radius: var(--radius-sm); padding: 12px; margin-bottom: 12px;
      ">
        <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
          [D6] Vibrations
        </div>
        <div class="form-row cols3">
          <div class="form-group">
            <label>[D6a] Valeur à respecter</label>
            <input type="text" bind:value={form.vibrations_valeur_respecter}
              oninput={() => onFieldChange('vibrations_valeur_respecter')}
              style={fieldBorderStyle('vibrations_valeur_respecter')}
              placeholder="ex: 10 mm/s">
          </div>
          <div class="form-group">
            <label>[D6b] Valeur obtenue (PPV)</label>
            <input type="text" bind:value={form.vibrations_ppv}
              oninput={() => onFieldChange('vibrations_ppv')}
              style={fieldBorderStyle('vibrations_ppv')}
              placeholder="ex: 2.45 mm/s">
          </div>
        </div>
        <div class="form-row cols1">
          <div class="form-group">
            <label>[D6c] Emplacement des sismographes</label>
            <input type="text" bind:value={form.vibrations_sismographes}
              oninput={() => onFieldChange('vibrations_sismographes')}
              style={fieldBorderStyle('vibrations_sismographes')}
              placeholder="ex: Bâtiment résidentiel 85m N-E">
          </div>
        </div>
      </div>

      <!-- D7: Pré-découpage -->
      <div class="form-row cols1">
        <div class="form-group">
          <label>[D7] Nombre de trous de pré-découpage</label>
          <input type="text" bind:value={form.nb_trous_predecoupage}
            placeholder="ex: 8 trous (voir plan de tir)">
        </div>
      </div>

      <!-- D8: Pare-éclats -->
      <div class="form-row cols3">
        <div class="form-group">
          <label>[D8] Type de pare-éclats</label>
          <input type="text" bind:value={form.type_pare_eclats} placeholder="ex: Géotextile, sable">
        </div>
        <div class="form-group">
          <label>[D8b] Dimension</label>
          <input type="text" bind:value={form.pare_eclats_dimension} placeholder="ex: 4×6m">
        </div>
        <div class="form-group">
          <label>[D8c] Nombre</label>
          <input type="number" bind:value={form.pare_eclats_nombre} placeholder="ex: 3">
        </div>
      </div>

      <div class="divider"></div>

      <!-- Section E: Distances des structures -->
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
        [Section E] Distance des structures les plus près (en mètres)
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
        {#each [
          { key: 'dist_batiment' as const, label: '[E1] Bâtiment' },
          { key: 'dist_pont' as const, label: '[E2] Pont' },
          { key: 'dist_route' as const, label: '[E3] Route' },
          { key: 'dist_ligne_electrique' as const, label: '[E4] Ligne électrique' },
        ] as item}
          <div class="form-group">
            <label>{item.label} (m)</label>
            <input type="number" step="0.1" bind:value={(form as any)[item.key]}
              placeholder="distance en m">
          </div>
        {/each}
      </div>
      <div class="form-row cols1">
        <div class="form-group">
          <label>[E5] Structure sous-terraine (m)</label>
          <input type="number" step="0.1" bind:value={form.dist_structure_souterraine} placeholder="distance en m">
        </div>
      </div>

      <div class="divider"></div>

      <!-- Plan du patron de forage (dessin libre) -->
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
        Plan du patron de forage (dessiner ci-dessous)
      </div>

      <!-- Color + stroke toolbar -->
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
        <!-- Color picker -->
        <div style="display: flex; gap: 5px; align-items: center;">
          {#each [
            { color: '#ffffff', label: 'Blanc' },
            { color: '#ef4444', label: 'Rouge' },
            { color: '#3b82f6', label: 'Bleu' },
            { color: '#22c55e', label: 'Vert' },
            { color: '#facc15', label: 'Jaune' },
          ] as c}
            <button
              onclick={() => { drawColor = c.color; if (drawCtx) drawCtx.strokeStyle = c.color; }}
              title={c.label}
              style="
                width: 24px; height: 24px; border-radius: 50%; cursor: pointer;
                background: {c.color};
                border: 3px solid {drawColor === c.color ? '#fff' : 'transparent'};
                box-shadow: {drawColor === c.color ? '0 0 0 1px #4f6ef7' : 'none'};
                padding: 0; flex-shrink: 0;
              "
            ></button>
          {/each}
        </div>
        <!-- Stroke width -->
        <div style="display: flex; gap: 4px; align-items: center; margin-left: 4px;">
          {#each [
            { w: 2, label: 'Fin' },
            { w: 5, label: 'Moyen' },
            { w: 10, label: 'Épais' },
          ] as s}
            <button
              onclick={() => { drawLineWidth = s.w; if (drawCtx) drawCtx.lineWidth = s.w; }}
              title={s.label}
              style="
                padding: 4px 8px; border-radius: 6px; font-size: 11px; cursor: pointer;
                font-family: inherit; font-weight: 600;
                border: 1px solid {drawLineWidth === s.w ? 'var(--accent)' : 'var(--border)'};
                background: {drawLineWidth === s.w ? 'var(--accent-glow)' : 'var(--card2)'};
                color: {drawLineWidth === s.w ? 'var(--accent2)' : 'var(--text3)'};
              "
            >{s.label}</button>
          {/each}
        </div>
        <!-- Undo + Clear -->
        <div style="display: flex; gap: 4px; margin-left: auto;">
          <button
            onclick={undoDraw}
            disabled={drawHistory.length === 0}
            class="btn btn-secondary btn-sm"
            title="Annuler le dernier trait"
          >↩ Undo</button>
          <button onclick={clearDraw} class="btn btn-secondary btn-sm">✕ Effacer</button>
        </div>
      </div>

      <!-- Drawing canvas -->
      <div style="
        border: 2px solid var(--border); border-radius: var(--radius-sm);
        background: #1a1a2e; overflow: hidden; position: relative;
        touch-action: none;
      ">
        <canvas
          bind:this={drawCanvas}
          width="800"
          height="450"
          style="display: block; width: 100%; height: 300px; cursor: crosshair; touch-action: none;"
          onmousedown={startDrawFreehand}
          onmousemove={drawFreehand}
          onmouseup={endDrawFreehand}
          onmouseleave={endDrawFreehand}
          ontouchstart={startDrawFreehand}
          ontouchmove={drawFreehand}
          ontouchend={endDrawFreehand}
        ></canvas>
        {#if !form.patron_forage_dataurl}
          <div style="
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            pointer-events: none; color: rgba(255,255,255,0.2); font-size: 13px;
            text-align: center; line-height: 1.6;
          ">Dessinez le plan de forage ici<br>avec le doigt ou la souris</div>
        {/if}
      </div>
      {#if form.patron_forage_dataurl}
        <div style="font-size: 11px; color: var(--green); margin-top: 5px;">✅ Dessin enregistré</div>
      {/if}
    </div>
  </div>
  {/if}

  <!-- ────────────────────────────────────────────────────────────────────── -->
  <!-- SECTION 5: EXPLOSIFS (ASP Sections F + Vision AI) -->
  <!-- ────────────────────────────────────────────────────────────────────── -->
  {#if activeSection === 4}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">⑤</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Explosifs et détonateurs</h3>
      <span style="font-size: 10px; color: var(--text3);">ASP Section F</span>
    </div>
    <div class="card-body">

      <!-- Explosifs Table -->
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        [F1/F3] Produits explosifs
      </div>

      {#if explosifs.length === 0}
        <div style="padding: 16px; text-align: center; color: var(--text3); font-size: 13px; background: var(--card2); border-radius: var(--radius-sm); margin-bottom: 10px;">
          Aucun produit explosif ajouté
        </div>
      {:else}
        {#each explosifs as exp, idx}
          <div style="
            background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
            padding: 12px; margin-bottom: 8px;
          ">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 600; color: var(--text2);">Produit #{idx + 1}</span>
              <button onclick={() => removeExplosif(exp.id)} style="
                background: var(--red-dim); border: 1px solid var(--red); color: var(--red);
                border-radius: 6px; padding: 3px 8px; font-size: 11px; cursor: pointer; font-family: inherit;
              ">✕ Retirer</button>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Type d'explosif</label>
                <select bind:value={exp.type}>
                  <option value="">— Sélectionner —</option>
                  <option>ANFO</option>
                  <option>Émulsion en vrac</option>
                  <option>Émulsion en cartouche</option>
                  <option>Dynamite</option>
                  <option>Nitrate d'ammonium</option>
                  <option>Poudre NONEL</option>
                  <option>Amorce booster</option>
                  <option>Pentolite</option>
                  <option>Autre</option>
                </select>
              </div>
              <div class="form-group">
                <label>Fabricant</label>
                <input type="text" bind:value={exp.fabricant} placeholder="ex: Dyno Nobel">
              </div>
            </div>
            <div class="form-row cols3">
              <div class="form-group">
                <label>No. lot</label>
                <input type="text" bind:value={exp.lot} placeholder="ex: L24-XA">
              </div>
              <div class="form-group">
                <label>Qté/trou</label>
                <input type="number" step="0.01" bind:value={exp.quantite_par_trou}
                  oninput={() => recalcExplosifRow(exp)} placeholder="kg ou unité">
              </div>
              <div class="form-group">
                <label>Unité</label>
                <select bind:value={exp.unite}>
                  <option>kg</option>
                  <option>g</option>
                  <option>unité</option>
                  <option>m</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Nb de trous</label>
                <input type="number" bind:value={exp.nb_trous}
                  oninput={() => recalcExplosifRow(exp)} placeholder="Nb trous chargés">
              </div>
              <div class="form-group">
                <label>Total (kg)</label>
                <input type="number" step="0.01" bind:value={exp.total_kg}
                  oninput={recalcTotal} placeholder="Calculé auto">
              </div>
            </div>
          </div>
        {/each}
      {/if}

      <button onclick={addExplosif} class="btn btn-secondary btn-full" style="margin-bottom: 14px;">
        ➕ Ajouter un produit explosif
      </button>

      {#if form.total_explosif_kg}
        <div style="
          background: var(--green-dim); border: 1px solid rgba(46,204,113,0.3);
          border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 14px;
          font-size: 13px; color: var(--green);
        ">
          <strong>Total explosifs: {form.total_explosif_kg} kg</strong>
          {#if form.ratio_poudre}<span style="margin-left: 8px;">· Ratio: {form.ratio_poudre} kg/t</span>{/if}
        </div>
      {/if}

      <div class="divider"></div>

      <!-- F4: Type émulsion pompée -->
      <div class="form-row cols1">
        <div class="form-group">
          <label>[F4] Type d'émulsion pompée (s'il y a lieu)</label>
          <input type="text" bind:value={form.type_emulsion_pompee}
            placeholder="ex: Emulsion 70/30, pompe mobile">
        </div>
      </div>

      <!-- F5 + F6 -->
      <div class="form-row">
        <div class="form-group">
          <label>[F5] Volume de roc (m³)</label>
          <input type="number" step="0.1" bind:value={form.volume_roc_m3} placeholder="ex: 150">
        </div>
        <div class="form-group">
          <label>[F6] Facteur de chargement (kg/m³)</label>
          <input type="number" step="0.01" bind:value={form.facteur_chargement} placeholder="ex: 0.35">
        </div>
      </div>

      <div class="divider"></div>

      <!-- Détonateurs -->
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        [F2] Détonateurs et amorçage
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Type de détonateurs</label>
          <select bind:value={form.type_detonateurs}
            style={fieldBorderStyle('type_detonateurs')}>
            <option>Non-électrique (NONEL)</option>
            <option>Électrique</option>
            <option>Électronique (eDev)</option>
            <option>Mèche à retard</option>
            <option>Mèche ordinaire</option>
          </select>
        </div>
        <div class="form-group">
          <label>[F2] Nb détonateurs</label>
          <input type="number" bind:value={form.nb_detonateurs}
            oninput={() => onFieldChange('nb_detonateurs')}
            style={fieldBorderStyle('nb_detonateurs')}
            placeholder="Total">
        </div>
      </div>
      <div class="form-row cols1">
        <div class="form-group">
          <label>Marque / Modèle de détonateurs</label>
          <input type="text" bind:value={form.detonateurs}
            oninput={() => onFieldChange('detonateurs')}
            style={fieldBorderStyle('detonateurs')}
            placeholder="ex: Dyno Nobel Exel LP, MS 500ms">
        </div>
      </div>
      <div class="form-row cols1">
        <div class="form-group">
          <label>Séquence et délais de tir</label>
          <textarea bind:value={form.sequence_delais}
            style={fieldBorderStyle('sequence_delais')}
            oninput={() => onFieldChange('sequence_delais')}
            placeholder="ex: Rangée 1 (0ms) → Rangée 2 (17ms) → Rangée 3 (42ms)..."></textarea>
        </div>
      </div>

      <!-- Vision AI — Firing Sequence Extraction -->
      <div class="divider"></div>
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        Séquence de tir — Vision AI (Page C)
      </div>

      {#if !visionPdfFile}
        <div style="
          padding: 14px; border: 1px dashed var(--border); border-radius: var(--radius-sm);
          background: var(--card2); text-align: center; color: var(--text3); font-size: 12px;
        ">
          📄 Importez d'abord un plan de tir PDF pour activer l'extraction Vision AI
        </div>
      {:else if !firingSequence}
        <div style="
          padding: 14px; border: 1px dashed rgba(139,92,246,0.3); border-radius: var(--radius-sm);
          background: rgba(139,92,246,0.05);
        ">
          <div style="font-size: 13px; color: var(--text2); margin-bottom: 10px;">
            🤖 Extrayez automatiquement les positions et délais de chaque trou depuis le diagramme de séquence via Vision AI.
          </div>
          <button
            onclick={runVisionExtract}
            disabled={visionExtracting}
            style="
              width: 100%; padding: 10px 16px; border-radius: var(--radius-sm);
              background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.4);
              color: #a78bfa; font-size: 13px; font-weight: 600; cursor: pointer;
              font-family: inherit; transition: all .15s;
              opacity: {visionExtracting ? 0.7 : 1};
            "
          >
            {visionExtracting ? '🤖 Analyse Vision AI en cours...' : '🔍 Extraire séquence de tir (Vision AI)'}
          </button>
        </div>
      {:else}
        <div style="
          border: 1px solid rgba(139,92,246,0.3); border-radius: var(--radius-sm);
          background: rgba(139,92,246,0.05); overflow: hidden;
        ">
          <div style="
            padding: 10px 14px; background: rgba(139,92,246,0.1);
            border-bottom: 1px solid rgba(139,92,246,0.2);
            display: flex; align-items: center; gap: 8px; justify-content: space-between; flex-wrap: wrap;
          ">
            <div>
              <span style="font-size: 13px; font-weight: 700; color: #a78bfa;">✅ Séquence extraite</span>
              <span style="font-size: 11px; color: var(--text3); margin-left: 8px;">
                {summarizeFiringSequence(firingSequence)}
              </span>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
              <span style="
                font-size: 10px; font-weight: 600; padding: 2px 8px;
                background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3);
                border-radius: 20px; color: #a78bfa;
              ">{firingSequence.holes.length} trous</span>
              {#if firingSequence.delayRange}
                <span style="
                  font-size: 10px; font-weight: 600; padding: 2px 8px;
                  background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3);
                  border-radius: 20px; color: #a78bfa;
                ">{firingSequence.delayRange.min}–{firingSequence.delayRange.max} ms</span>
              {/if}
              {#if firingSequence.confidence}
                <span style="
                  font-size: 10px; font-weight: 600; padding: 2px 8px;
                  background: rgba(46,204,113,0.1); border: 1px solid rgba(46,204,113,0.3);
                  border-radius: 20px; color: #2ecc71;
                ">{Math.round(firingSequence.confidence * 100)}% confiance</span>
              {/if}
              <button
                onclick={runVisionExtract}
                disabled={visionExtracting}
                style="
                  padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
                  background: transparent; border: 1px solid var(--border);
                  color: var(--text3); cursor: pointer; font-family: inherit;
                "
              >🔄 Ré-extraire</button>
            </div>
          </div>

          <div style="padding: 12px 14px;">
            <BlastPatternCanvas
              firingSequence={firingSequence}
              title={form.numero_tir || 'Séquence de tir'}
              shotInfo="{form.chantier || ''}{form.chantier && form.date_tir ? ' · ' : ''}{form.date_tir || ''}"
              interactive={true}
              showAnimation={true}
              showExport={true}
            />
            <div style="
              margin-top: 8px; padding: 6px 10px; background: var(--card2);
              border-radius: var(--radius-sm); font-size: 10px; color: var(--text3);
              display: flex; gap: 8px; flex-wrap: wrap;
            ">
              <span>🤖 {firingSequence.model ?? 'Gemini'}</span>
              {#if firingSequence.extractedAt}
                <span>· {new Date(firingSequence.extractedAt).toLocaleString('fr-CA')}</span>
              {/if}
              {#if firingSequence.connections?.length}
                <span>· {firingSequence.connections.length} connexions</span>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
  {/if}

  <!-- ────────────────────────────────────────────────────────────────────── -->
  <!-- SECTION 6: SÉCURITÉ + Recommandations ASP (Section G) -->
  <!-- ────────────────────────────────────────────────────────────────────── -->
  {#if activeSection === 5}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">⑥</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Mesures de sécurité</h3>
      <span style="font-size: 10px; color: var(--text3);">ASP Section G</span>
    </div>
    <div class="card-body">

      <div class="form-row">
        <div class="form-group">
          <label>Zone de sécurité (m) <span style="color:var(--red)">*</span></label>
          <input type="number" bind:value={form.zone_securite_m} placeholder="ex: 200">
        </div>
        <div class="form-group">
          <label>Signaux utilisés</label>
          <input type="text" bind:value={form.signaux_utilises} placeholder="ex: 3 klaxons = Attention">
        </div>
      </div>

      <!-- Section G — Recommandations ASP (Oui/Non) -->
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; margin-top: 4px;">
        [Section G] Recommandations (bonnes pratiques)
      </div>

      {#each [
        { key: 'camera_video' as const, label: '[G1] Caméra vidéo' },
        { key: 'ecaillage_securite' as const, label: '[G2] Écaillage de sécurité' },
        { key: 'detecteur_co_bnq' as const, label: '[G3] Détecteur résidentiel de CO (norme BNQ)' },
      ] as item}
        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 6px; font-size: 12px;">{item.label}</label>
          <div style="display: flex; gap: 8px;">
            {#each ['Oui', 'Non'] as opt}
              <button
                onclick={() => { (form as any)[item.key] = (form as any)[item.key] === opt ? '' : opt; }}
                style="
                  flex: 1; padding: 8px; border-radius: var(--radius-sm);
                  border: 1px solid {(form as any)[item.key] === opt
                    ? (opt === 'Oui' ? 'var(--green)' : 'var(--red)')
                    : 'var(--border)'};
                  background: {(form as any)[item.key] === opt
                    ? (opt === 'Oui' ? 'var(--green-dim)' : 'var(--red-dim)')
                    : 'var(--card2)'};
                  color: {(form as any)[item.key] === opt
                    ? (opt === 'Oui' ? 'var(--green)' : 'var(--red)')
                    : 'var(--text3)'};
                  font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
                "
              >{opt === 'Oui' ? '✅ Oui' : '✕ Non'}</button>
            {/each}
          </div>
        </div>
      {/each}

      <div class="divider"></div>

      <!-- Checklist sécurité opérationnelle -->
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; margin-top: 4px;">
        Liste de vérification avant le tir
      </div>

      {#each [
        { key: 'procedures_suivies' as const, label: 'Procédures de sécurité respectées (CNESST / E-22)' },
        { key: 'zone_evacuee' as const, label: 'Zone de sécurité évacuée et sécurisée' },
        { key: 'communication_etablie' as const, label: 'Communication établie avec tous les postes' },
        { key: 'inspection_avant' as const, label: 'Inspection pré-tir complétée' },
      ] as item}
        <button
          onclick={() => { (form as any)[item.key] = !(form as any)[item.key]; }}
          style="
            width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px;
            background: {(form as any)[item.key] ? 'var(--green-dim)' : 'var(--card2)'};
            border: 1px solid {(form as any)[item.key] ? 'rgba(46,204,113,0.3)' : 'var(--border)'};
            border-radius: var(--radius-sm); margin-bottom: 6px; cursor: pointer;
            text-align: left; font-family: inherit; transition: all .15s;
          "
        >
          <div style="
            width: 20px; height: 20px; border-radius: 4px; flex-shrink: 0;
            background: {(form as any)[item.key] ? 'var(--green)' : 'transparent'};
            border: 2px solid {(form as any)[item.key] ? 'var(--green)' : 'var(--border2)'};
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; color: #fff;
          ">{(form as any)[item.key] ? '✓' : ''}</div>
          <span style="font-size: 13px; color: {(form as any)[item.key] ? 'var(--text)' : 'var(--text2)'};">
            {item.label}
          </span>
        </button>
      {/each}

      <!-- Gardiens -->
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; margin-top: 14px;">
        Gardiens de sécurité
      </div>

      {#each gardiens as g, idx}
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
          <input type="text" bind:value={g.nom} placeholder="Nom gardien #{idx+1}" style="flex: 1;">
          <input type="text" bind:value={g.poste} placeholder="Poste / position" style="flex: 1;">
          <button onclick={() => removeGardien(g.id)} style="
            background: var(--red-dim); border: 1px solid var(--red); color: var(--red);
            border-radius: 6px; padding: 8px 10px; cursor: pointer; font-family: inherit; flex-shrink: 0;
          ">✕</button>
        </div>
      {/each}

      <button onclick={addGardien} class="btn btn-secondary btn-sm">
        ➕ Ajouter un gardien
      </button>
    </div>
  </div>
  {/if}

  <!-- ────────────────────────────────────────────────────────────────────── -->
  <!-- SECTION 7: RÉSULTATS (ASP Section H + I) -->
  <!-- ────────────────────────────────────────────────────────────────────── -->
  {#if activeSection === 6}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">⑦</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Résultats du tir</h3>
      <span style="font-size: 10px; color: var(--text3);">ASP Sections H+I</span>
    </div>
    <div class="card-body">

      <!-- H1 + H2 -->
      <div class="form-row">
        <div class="form-group">
          <label>Heure de mise à feu <span style="color:var(--red)">*</span></label>
          <input type="time" bind:value={form.heure_mise_a_feu}>
        </div>
        <div class="form-group">
          <label>[H1] Concentration max. de CO</label>
          <input type="text" bind:value={form.concentration_co_ppm} placeholder="ex: 25 ppm">
        </div>
      </div>

      <!-- H2: Fracturation telle qu'exigée -->
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 6px; font-size: 12px;">[H2] Fracturation telle qu'exigée</label>
        <div style="display: flex; gap: 8px;">
          {#each ['Oui', 'Non'] as opt}
            <button
              onclick={() => form.fracturation_exigee = form.fracturation_exigee === opt ? '' : opt as any}
              style="
                flex: 1; padding: 8px; border-radius: var(--radius-sm);
                border: 1px solid {form.fracturation_exigee === opt
                  ? (opt === 'Oui' ? 'var(--green)' : 'var(--red)')
                  : 'var(--border)'};
                background: {form.fracturation_exigee === opt
                  ? (opt === 'Oui' ? 'var(--green-dim)' : 'var(--red-dim)')
                  : 'var(--card2)'};
                color: {form.fracturation_exigee === opt
                  ? (opt === 'Oui' ? 'var(--green)' : 'var(--red)')
                  : 'var(--text3)'};
                font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
              "
            >{opt === 'Oui' ? '✅ Oui' : '✕ Non'}</button>
          {/each}
        </div>
      </div>

      <!-- H3: Bris hors profil -->
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 6px; font-size: 12px;">[H3] Bris hors profil</label>
        <div style="display: flex; gap: 8px;">
          {#each ['Oui', 'Non'] as opt}
            <button
              onclick={() => form.bris_hors_profil = form.bris_hors_profil === opt ? '' : opt as any}
              style="
                flex: 1; padding: 8px; border-radius: var(--radius-sm);
                border: 1px solid {form.bris_hors_profil === opt
                  ? (opt === 'Oui' ? 'var(--red)' : 'var(--green)')
                  : 'var(--border)'};
                background: {form.bris_hors_profil === opt
                  ? (opt === 'Oui' ? 'var(--red-dim)' : 'var(--green-dim)')
                  : 'var(--card2)'};
                color: {form.bris_hors_profil === opt
                  ? (opt === 'Oui' ? 'var(--red)' : 'var(--green)')
                  : 'var(--text3)'};
                font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
              "
            >{opt === 'Oui' ? '⚠️ Oui' : '✅ Non'}</button>
          {/each}
        </div>
      </div>

      <!-- H4: Trous ratés -->
      <div style="margin-top: 8px; margin-bottom: 8px;">
        <label style="margin-bottom: 6px;">[H4] Trous ratés / canon / fond de trou ?</label>
        <div style="display: flex; gap: 8px;">
          {#each ['non', 'oui'] as opt}
            <button
              onclick={() => form.trous_rates = opt}
              style="
                flex: 1; padding: 9px 12px; border-radius: var(--radius-sm);
                border: 1px solid {form.trous_rates === opt ? (opt === 'oui' ? 'var(--red)' : 'var(--green)') : 'var(--border)'};
                background: {form.trous_rates === opt ? (opt === 'oui' ? 'var(--red-dim)' : 'var(--green-dim)') : 'var(--card2)'};
                color: {form.trous_rates === opt ? (opt === 'oui' ? 'var(--red)' : 'var(--green)') : 'var(--text2)'};
                font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; text-align: center;
              "
            >{opt === 'oui' ? '⚠️ Oui' : '✅ Non'}</button>
          {/each}
        </div>
      </div>

      {#if form.trous_rates === 'oui'}
        <div style="
          background: var(--red-dim); border: 1px solid rgba(231,76,60,0.3);
          border-radius: var(--radius-sm); padding: 12px; margin-bottom: 10px;
        ">
          <div class="form-row cols1">
            <div class="form-group">
              <label>Nombre de trous ratés</label>
              <input type="number" bind:value={form.nb_trous_rates} placeholder="Nombre">
            </div>
          </div>
          <div class="form-row cols1">
            <div class="form-group">
              <label>Description des ratés</label>
              <textarea bind:value={form.description_rates} placeholder="Description détaillée..."></textarea>
            </div>
          </div>
          <div class="form-row cols1">
            <div class="form-group">
              <label>Procédures appliquées</label>
              <textarea bind:value={form.procedures_rates} placeholder="Procédures suivies..."></textarea>
            </div>
          </div>
        </div>
      {/if}

      <!-- H5: Projection -->
      <div style="margin-bottom: 10px;">
        <label style="display: block; margin-bottom: 6px; font-size: 12px;">[H5] Projection</label>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          {#each ['Oui', 'Non'] as opt}
            <button
              onclick={() => form.projection = form.projection === opt ? '' : opt as any}
              style="
                flex: 1; padding: 8px; border-radius: var(--radius-sm);
                border: 1px solid {form.projection === opt
                  ? (opt === 'Oui' ? 'var(--red)' : 'var(--green)')
                  : 'var(--border)'};
                background: {form.projection === opt
                  ? (opt === 'Oui' ? 'var(--red-dim)' : 'var(--green-dim)')
                  : 'var(--card2)'};
                color: {form.projection === opt
                  ? (opt === 'Oui' ? 'var(--red)' : 'var(--green)')
                  : 'var(--text3)'};
                font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit;
              "
            >{opt === 'Oui' ? '⚠️ Oui' : '✅ Non'}</button>
          {/each}
        </div>
        {#if form.projection === 'Oui'}
          <div style="
            background: var(--red-dim); border: 1px solid rgba(231,76,60,0.3);
            border-radius: var(--radius-sm); padding: 12px;
          ">
            <div class="form-group" style="margin-bottom: 8px;">
              <label>[H5a] Distance et grosseur des pierres</label>
              <input type="text" bind:value={form.projection_distance_pierres}
                placeholder="ex: 15m, pierres 5-20 cm">
            </div>
            <div class="form-group">
              <label>[H5b] Description des dommages</label>
              <textarea bind:value={form.description_dommages}
                placeholder="Description des dommages causés..."></textarea>
            </div>
          </div>
        {/if}
      </div>

      <!-- Mesures supplémentaires -->
      <div class="form-row">
        <div class="form-group">
          <label>Fragmentation</label>
          <select bind:value={form.fragmentation}>
            <option value="">— Sélectionner —</option>
            <option>Excellente</option>
            <option>Bonne</option>
            <option>Acceptable</option>
            <option>Mauvaise</option>
          </select>
        </div>
        <div class="form-group">
          <label>Projection max (m)</label>
          <input type="number" step="0.1" bind:value={form.projection_max_m} placeholder="Distance max">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Bruit (dB)</label>
          <input type="number" step="0.1" bind:value={form.bruit_db} placeholder="ex: 134">
        </div>
        <div class="form-group">
          <label>Fumée (couleur)</label>
          <select bind:value={form.fumee_couleur}>
            <option value="">— Sélectionner —</option>
            <option>Blanche</option>
            <option>Grise</option>
            <option>Noire</option>
            <option>Orange (ratés)</option>
            <option>Aucune visible</option>
          </select>
        </div>
      </div>

      <div class="form-row cols1">
        <div class="form-group">
          <label>Observations générales</label>
          <textarea bind:value={form.resultats_generaux} placeholder="Observations globales du tir..."></textarea>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Récap quantités -->
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        Récapitulatif des quantités
      </div>
      <div class="form-row cols3">
        <div class="form-group">
          <label>Total explosifs (kg)</label>
          <input type="number" step="0.01" bind:value={form.total_explosif_kg} placeholder="Total kg">
        </div>
        <div class="form-group">
          <label>Total détonateurs</label>
          <input type="number" bind:value={form.total_detonateurs} placeholder="Nb total">
        </div>
        <div class="form-group">
          <label>Ratio poudre</label>
          <input type="number" step="0.001" bind:value={form.ratio_poudre} placeholder="kg/tonne">
        </div>
      </div>

      <div class="divider"></div>

      <!-- Section I — Remarques -->
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        [Section I] Remarques
      </div>
      <textarea bind:value={form.remarques}
        oninput={() => onFieldChange('remarques')}
        style="{fieldBorderStyle('remarques')} min-height: 80px;"
        placeholder="Remarques, observations spéciales, informations importantes..."></textarea>
    </div>
  </div>
  {/if}

  <!-- ────────────────────────────────────────────────────────────────────── -->
  <!-- SECTION 8: SIGNATURE (ASP Section J) -->
  <!-- ────────────────────────────────────────────────────────────────────── -->
  {#if activeSection === 7}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">⑧</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Signature et certification</h3>
      <span style="font-size: 10px; color: var(--text3);">ASP Section J</span>
    </div>
    <div class="card-body">
      <div style="
        background: rgba(79,110,247,0.08); border: 1px solid rgba(79,110,247,0.2);
        border-radius: var(--radius-sm); padding: 12px; margin-bottom: 14px;
        font-size: 12px; color: var(--accent2); line-height: 1.6;
      ">
        Je soussigné(e) certifie que les informations contenues dans ce journal de tir sont exactes et conformes aux exigences du Règlement E-22 sur les explosifs du Québec.
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>[J1] Nom du boutefeu</label>
          <input type="text" value="{form.boutefeu_prenom} {form.boutefeu_nom}" readonly
            style="background: var(--surface); opacity: 0.8;">
        </div>
        <div class="form-group">
          <label>Date de signature</label>
          <input type="date" bind:value={form.signature_date}>
        </div>
      </div>

      <div style="margin-top: 8px; margin-bottom: 6px;">
        <label>[J2] Signature du boutefeu (dessiner ci-dessous)</label>
        <div style="
          border: 2px solid var(--border); border-radius: var(--radius-sm);
          background: var(--surface); overflow: hidden; position: relative;
        ">
          <canvas
            bind:this={sigCanvas}
            width="600"
            height="160"
            style="display: block; width: 100%; height: 120px; cursor: crosshair; touch-action: none;"
            onmousedown={startDraw}
            onmousemove={draw}
            onmouseup={endDraw}
            onmouseleave={endDraw}
            ontouchstart={startDraw}
            ontouchmove={draw}
            ontouchend={endDraw}
          ></canvas>
          {#if !form.signature_data}
            <div style="
              position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
              pointer-events: none; color: var(--text3); font-size: 13px;
            ">Signez ici avec le doigt ou la souris</div>
          {/if}
        </div>
        <div style="display: flex; gap: 6px; margin-top: 6px;">
          <button onclick={clearSig} class="btn btn-secondary btn-sm">✕ Effacer</button>
          {#if form.signature_data}
            <span style="font-size: 12px; color: var(--green); align-self: center;">✅ Signature enregistrée</span>
          {/if}
        </div>
      </div>

      <!-- Note légale ASP -->
      <div style="
        margin-top: 16px; padding: 10px 12px; background: var(--card2);
        border-radius: var(--radius-sm); border-left: 3px solid rgba(79,110,247,0.5);
        font-size: 11px; color: var(--text3); line-height: 1.5;
      ">
        📜 <strong style="color: var(--text2);">Exigence légale ASP Construction :</strong>
        L'employeur doit conserver le journal de tir pendant une durée de <strong>3 ans</strong> et le rendre disponible en tout temps sur le lieu de travail.
        <br>Référence : art. 4.7.10, annexe 2.2 — Code de sécurité pour les travaux de construction (RSST/RSSTM).
      </div>
    </div>
  </div>

  <!-- Save buttons -->
  <div style="display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap;">
    <button onclick={saveAsDraft} class="btn btn-secondary" style="flex: 1; min-width: 120px;" disabled={saving}>
      💾 Sauvegarder brouillon
    </button>
    <button
      onclick={() => showPreview = true}
      class="btn btn-secondary"
      style="flex: 1; min-width: 100px; border-color: rgba(139,92,246,0.5); color: #a78bfa; background: rgba(139,92,246,0.1);"
    >
      👁️ Aperçu
    </button>
    <button onclick={saveAsComplete} class="btn btn-success" style="flex: 1; min-width: 120px;" disabled={saving || !validationResult.valid}>
      ✅ Compléter et sauvegarder
    </button>
  </div>

  <!-- Validation errors (if any) -->
  {#if !validationResult.valid}
    <div style="
      margin-top: 10px; padding: 12px 14px; background: var(--red-dim);
      border: 1px solid rgba(231,76,60,0.3); border-radius: var(--radius-sm);
    ">
      <div style="font-size: 12px; font-weight: 700; color: var(--red); margin-bottom: 6px;">
        ❌ Champs obligatoires manquants
      </div>
      {#each validationResult.errors as err}
        <div style="font-size: 12px; color: var(--text2); margin-bottom: 3px;">• {err}</div>
      {/each}
    </div>
  {/if}
  {/if}

  <!-- ── Navigation prev/next ────────────────────────────────────────────── -->
  <div style="display: flex; justify-content: space-between; margin-top: 16px; margin-bottom: 8px;">
    {#if activeSection > 0}
      <button onclick={() => activeSection--} class="btn btn-secondary">
        ← Section précédente
      </button>
    {:else}
      <div></div>
    {/if}
    {#if activeSection < sections.length - 1}
      <button onclick={() => { saveAsDraft(); activeSection++; }} class="btn btn-primary">
        Section suivante →
      </button>
    {:else}
      <button onclick={saveAsComplete} class="btn btn-success" disabled={saving}>
        ✅ Compléter
      </button>
    {/if}
  </div>

  <!-- ── Bottom status bar ──────────────────────────────────────────────── -->
  <div style="
    position: sticky; bottom: 0; left: 0; right: 0;
    background: var(--card); border-top: 1px solid var(--border);
    padding: 10px 14px; margin: 8px -12px 0;
    display: flex; align-items: center; gap: 10px;
    z-index: 100;
  ">
    <!-- Progress bar -->
    <div style="flex: 1; min-width: 0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span style="font-size: 11px; color: var(--text3);">
          {validationResult.filledCount}/{validationResult.totalCount} champs remplis
        </span>
        <span style="font-size: 11px; color: {validationResult.valid ? 'var(--green)' : (validationResult.errors.length > 0 ? 'var(--red)' : '#f59e0b')};">
          {validationResult.valid ? '✅ Prêt à compléter' : validationResult.errors.length > 0 ? `❌ ${validationResult.errors.length} erreur(s)` : `⚠️ ${validationResult.warnings.length} avertissement(s)`}
        </span>
      </div>
      <div style="height: 4px; background: var(--border); border-radius: 2px; overflow: hidden;">
        <div style="
          height: 100%; border-radius: 2px;
          width: {Math.round((validationResult.filledCount / validationResult.totalCount) * 100)}%;
          background: {validationResult.valid ? 'var(--green)' : validationResult.errors.length > 0 ? 'var(--accent)' : '#f59e0b'};
          transition: width 0.3s ease;
        "></div>
      </div>
    </div>

    <!-- Section status dots -->
    <div style="display: flex; gap: 4px; flex-shrink: 0;">
      {#each validationResult.sectionStatus as sec, i}
        <button
          onclick={() => activeSection = i}
          title="{sec.name}: {sec.status === 'error' ? `${sec.errorCount} erreur(s)` : sec.status === 'warning' ? `${sec.warningCount} avertissement(s)` : 'OK'}"
          style="
            width: 16px; height: 16px; border-radius: 50%; border: none; cursor: pointer;
            background: {sec.status === 'error' ? 'var(--red)' : sec.status === 'warning' ? '#f59e0b' : 'var(--green)'};
            opacity: {activeSection === i ? 1 : 0.5};
            font-size: 8px; display: flex; align-items: center; justify-content: center;
          "
        ></button>
      {/each}
    </div>
  </div>

</div>

<!-- ── Preview Modal Overlay ──────────────────────────────────────────────── -->
{#if showPreview}
  {@const snap = $state.snapshot(form)}
  {@const explosifsSnap = $state.snapshot(explosifs)}
  {@const firingSnap = firingSequence ? $state.snapshot(firingSequence) : null}

  <div
    style="
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.85); overflow-y: auto;
    "
    onclick={(e) => { if (e.target === e.currentTarget) showPreview = false; }}
  >
    <!-- Toolbar (no-print) -->
    <div class="preview-no-print" style="
      position: sticky; top: 0; z-index: 10;
      background: #1a1a2e; border-bottom: 1px solid #333;
      padding: 10px 16px; display: flex; align-items: center; gap: 10px;
    ">
      <button
        onclick={() => showPreview = false}
        style="
          padding: 8px 14px; border-radius: 8px; cursor: pointer;
          background: transparent; border: 1px solid #555;
          color: #aaa; font-size: 13px; font-family: inherit;
        "
      >← Retour au formulaire</button>
      <div style="flex: 1; font-size: 14px; font-weight: 600; color: #eee;">
        👁️ Aperçu — {snap.numero_tir}
      </div>
      <button
        onclick={() => window.print()}
        style="
          padding: 8px 16px; border-radius: 8px; cursor: pointer;
          background: #4f6ef7; border: none; color: white;
          font-size: 13px; font-weight: 600; font-family: inherit;
        "
      >🖨️ Imprimer / PDF</button>
    </div>

    <!-- Print content -->
    <div class="preview-print-page" style="
      max-width: 700px; margin: 20px auto; padding: 20px 24px 30px;
      background: white; color: #111;
      font-family: 'Times New Roman', Times, serif;
      font-size: 10pt; line-height: 1.4;
    ">

      <!-- Title -->
      <div style="text-align: center; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px;">
        <div style="font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
          Journal de tir par sautage
        </div>
        <div style="font-size: 8pt; color: #333; margin-top: 4px;">
          Référence : Annexe 2.2 Journal de tir (art. 4.7.10) — Code de sécurité pour les travaux de construction
        </div>
        <div style="font-size: 8pt; color: #555; margin-top: 2px;">
          ASP Construction — CA04-2025-02 · Numéro de tir : <strong>{snap.numero_tir || '—'}</strong>
        </div>
      </div>

      <!-- Section A — Identification -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
        <thead>
          <tr><th colspan="4" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
            A — IDENTIFICATION DU CHANTIER
          </th></tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; width: 28%; border: 1px solid #ccc;">Nom de l'entreprise :</td>
            <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{snap.nom_entreprise || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Adresse :</td>
            <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{snap.adresse_entreprise || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Localisation du chantier :</td>
            <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{snap.chantier || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Donneur d'ouvrage :</td>
            <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{snap.donneur_ouvrage || '—'}</td>
          </tr>
        </tbody>
      </table>

      <!-- Section B + C -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
        <thead>
          <tr>
            <th colspan="2" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left; width: 50%;">
              B — INFORMATION SUR LE SAUTAGE
            </th>
            <th colspan="2" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left; width: 50%;">
              C — CONDITIONS CLIMATIQUES
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 22%;">Localisation / chaînage :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc; width: 28%;">{snap.station || '—'}</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 22%;">Température :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc; width: 28%;">{snap.temperature ? snap.temperature + ' °C' : '—'}</td>
          </tr>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Date (j/m/a) :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.date_tir || '—'}</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;" colspan="2">
              {snap.meteo_ensoleille ? '☑' : '☐'} Ensoleillé &nbsp;
              {snap.meteo_nuageux ? '☑' : '☐'} Nuageux &nbsp;
              {snap.meteo_pluie ? '☑' : '☐'} Pluie &nbsp;
              {snap.meteo_neige ? '☑' : '☐'} Neige
            </td>
          </tr>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Heure :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.heure_tir || '—'}</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Dir. et vitesse vents :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.vent_direction_vitesse || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Nb volées quotidiennes :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.nb_volees_quotidiennes || '—'}</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Conditions du roc :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.conditions_roc || '—'}</td>
          </tr>
        </tbody>
      </table>

      <!-- Section D — Forage -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
        <thead>
          <tr><th colspan="4" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
            D — DONNÉES SUR LE FORAGE
          </th></tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 30%;">Nb trous et diamètre :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc; width: 20%;">{snap.nb_trous || '—'} trous, {snap.diametre || '—'} mm</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 25%;">Fardeau × Espacement :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.fardeau || '—'} m × {snap.espacement || '—'} m</td>
          </tr>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Prof. moy. par rangée :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.profondeur_prevue || '—'} m</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Hauteur du collet :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.hauteur_collet || '—'} m</td>
          </tr>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Nature de la bourre :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">
              {snap.nature_bourre === 'pierre nette' ? '☑' : '☐'} pierre nette &nbsp;
              {snap.nature_bourre === 'concassée' ? '☑' : '☐'} concassée
            </td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Hauteur mort terrain :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.hauteur_mort_terrain || '—'} m</td>
          </tr>
          <tr>
            <td colspan="4" style="padding: 3px 6px; border: 1px solid #ccc; font-size: 9pt;">
              <strong>Vibrations :</strong>
              ● Valeur à respecter : {snap.vibrations_valeur_respecter || '—'} &nbsp;
              ● Valeur obtenue : {snap.vibrations_ppv || '—'} &nbsp;
              ● Sismographes : {snap.vibrations_sismographes || '—'}
            </td>
          </tr>
          {#if snap.nb_trous_predecoupage}
            <tr>
              <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Nb trous pré-découpage :</td>
              <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{snap.nb_trous_predecoupage}</td>
            </tr>
          {/if}
          {#if snap.type_pare_eclats}
            <tr>
              <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Type pare-éclats :</td>
              <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.type_pare_eclats}</td>
              <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Dim. / Nb :</td>
              <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.pare_eclats_dimension || '—'} / {snap.pare_eclats_nombre || '—'}</td>
            </tr>
          {/if}
        </tbody>
      </table>

      <!-- Plan du patron de forage (dessin libre) -->
      {#if snap.patron_forage_dataurl}
        <div style="margin-bottom: 6px; border: 1px solid #ccc; padding: 8px;">
          <div style="font-size: 9pt; font-weight: bold; text-transform: uppercase; background: #222; color: white; padding: 4px 6px; margin: -8px -8px 8px -8px;">
            PLAN DU PATRON DE FORAGE
          </div>
          <img
            src={snap.patron_forage_dataurl}
            alt="Plan du patron de forage"
            style="width: 100%; display: block; border-radius: 4px;"
          />
        </div>
      {/if}

      <!-- Section E — Distances -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
        <thead>
          <tr><th colspan="6" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
            E — DISTANCE DES STRUCTURES LES PLUS PRÈS (en mètre)
          </th></tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Bâtiment :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.dist_batiment || '—'} m</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Pont :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.dist_pont || '—'} m</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Route :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.dist_route || '—'} m</td>
          </tr>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Ligne électrique :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.dist_ligne_electrique || '—'} m</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Structure s-terrain :</td>
            <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{snap.dist_structure_souterraine || '—'} m</td>
          </tr>
        </tbody>
      </table>

      <!-- Section F — Explosifs -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
        <thead>
          <tr><th colspan="4" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
            F — EXPLOSIFS (réf. : Colonne de charge)
          </th></tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 28%;">Type :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc; width: 22%;">{snap.type_detonateurs || '—'}</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 25%;">Nb détonateurs :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.nb_detonateurs || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Quantité utilisée :</td>
            <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">
              {snap.total_explosif_kg ? snap.total_explosif_kg + ' kg total' : '—'}
              {explosifsSnap && explosifsSnap.length > 0
                ? ' — ' + explosifsSnap.map((e: any) => `${e.type || '?'} (${e.total_kg || '?'} kg)`).join(', ')
                : ''}
            </td>
          </tr>
          {#if snap.type_emulsion_pompee}
            <tr>
              <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Type émulsion pompée :</td>
              <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{snap.type_emulsion_pompee}</td>
            </tr>
          {/if}
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Volume de roc :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.volume_roc_m3 || '—'} m³</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Facteur chargement :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.facteur_chargement || '—'} kg/m³</td>
          </tr>
        </tbody>
      </table>

      <!-- Section G — Recommandations -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
        <thead>
          <tr><th colspan="6" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
            G — RECOMMANDATIONS (BONNES PRATIQUES)
          </th></tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 24%;">Caméra vidéo :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc; width: 18%;">{snap.camera_video === 'Oui' ? '☑ Oui  ☐ Non' : snap.camera_video === 'Non' ? '☐ Oui  ☑ Non' : '☐ Oui  ☐ Non'}</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 24%;">Écaillage sécurité :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.ecaillage_securite === 'Oui' ? '☑ Oui  ☐ Non' : snap.ecaillage_securite === 'Non' ? '☐ Oui  ☑ Non' : '☐ Oui  ☐ Non'}</td>
          </tr>
          <tr>
            <td colspan="4" style="padding: 3px 6px; border: 1px solid #ccc;">
              <strong>Détecteur résidentiel de CO (norme BNQ) :</strong> &nbsp;
              {snap.detecteur_co_bnq === 'Oui' ? '☑ Oui  ☐ Non' : snap.detecteur_co_bnq === 'Non' ? '☐ Oui  ☑ Non' : '☐ Oui  ☐ Non'}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Section H — Résultats -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
        <thead>
          <tr><th colspan="4" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
            H — RÉSULTAT DU SAUTAGE
          </th></tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 28%;">Concentration max. CO :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc; width: 22%;">{snap.concentration_co_ppm || '—'}</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 26%;">Fracturation telle qu'exigée :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.fracturation_exigee === 'Oui' ? '☑ Oui  ☐ Non' : snap.fracturation_exigee === 'Non' ? '☐ Oui  ☑ Non' : '☐ Oui  ☐ Non'}</td>
          </tr>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Bris hors profil :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.bris_hors_profil === 'Oui' ? '☑ Oui  ☐ Non' : snap.bris_hors_profil === 'Non' ? '☐ Oui  ☑ Non' : '☐ Oui  ☐ Non'}</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Trous ratés / canon / fond :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{(snap.trous_rates === 'Oui' || snap.trous_rates === 'oui') ? '☑ Oui  ☐ Non' : (snap.trous_rates === 'Non' || snap.trous_rates === 'non') ? '☐ Oui  ☑ Non' : '☐ Oui  ☐ Non'}</td>
          </tr>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Projection :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.projection === 'Oui' ? '☑ Oui  ☐ Non' : snap.projection === 'Non' ? '☐ Oui  ☑ Non' : '☐ Oui  ☐ Non'}</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Heure mise à feu :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.heure_mise_a_feu || '—'}</td>
          </tr>
          {#if snap.projection === 'Oui'}
            <tr>
              <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; padding-left: 18px;">● Distance et pierres :</td>
              <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{snap.projection_distance_pierres || '—'}</td>
            </tr>
            <tr>
              <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; padding-left: 18px;">● Description dommages :</td>
              <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{snap.description_dommages || '—'}</td>
            </tr>
          {/if}
        </tbody>
      </table>

      <!-- Blast Pattern Canvas (Vision AI) -->
      {#if firingSnap && firingSnap.holes && firingSnap.holes.length > 0}
        <div style="margin-bottom: 6px; border: 1px solid #ccc; padding: 8px;">
          <div style="font-size: 9pt; font-weight: bold; text-transform: uppercase; background: #222; color: white; padding: 4px 6px; margin: -8px -8px 8px -8px;">
            PLAN DE TIR / SÉQUENCE DE DÉTONATION (Vision AI)
          </div>
          <BlastPatternCanvas
            firingSequence={firingSnap}
            title={snap.numero_tir || ''}
            shotInfo="{snap.chantier || ''}{snap.chantier && snap.date_tir ? ' · ' : ''}{snap.date_tir || ''}"
            interactive={false}
            showAnimation={false}
            showExport={false}
          />
          <div style="font-size: 8pt; color: #555; margin-top: 4px; text-align: right;">
            {firingSnap.holes.length} trous · Extrait via Vision AI ({firingSnap.model ?? 'Gemini'})
          </div>
        </div>
      {/if}

      <!-- Section I — Remarques -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
        <thead>
          <tr><th colspan="1" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
            I — REMARQUES
          </th></tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 4px 6px; border: 1px solid #ccc; min-height: 40px; vertical-align: top; white-space: pre-wrap; font-size: 9pt;">
              {snap.remarques || ''}{#if !snap.remarques}<br><br>{/if}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Section J — Signature -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
        <thead>
          <tr><th colspan="4" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
            J — SIGNATURE
          </th></tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 28%;">Nom du boutefeu :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc; width: 22%;">{snap.boutefeu_prenom || ''} {snap.boutefeu_nom || ''}</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 22%;">Date :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.signature_date || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Signature :</td>
            <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc; height: 60px; vertical-align: middle; text-align: center;">
              {#if snap.signature_data}
                <img
                  src={snap.signature_data}
                  alt="Signature"
                  style="max-height: 50px; max-width: 200px; object-fit: contain;"
                />
              {:else}
                <span style="color: #999; font-style: italic;">Signature manquante</span>
              {/if}
            </td>
          </tr>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Certificat CSTC :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.boutefeu_certificat || '—'}</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Permis SQ :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{snap.boutefeu_permis_sq || '—'}</td>
          </tr>
        </tbody>
      </table>

      <!-- Legal note -->
      <div style="
        margin-top: 8px; padding: 6px 10px;
        border: 1px solid #999; font-size: 8pt; color: #555;
        line-height: 1.4;
      ">
        <strong>Note légale :</strong> L'employeur doit conserver le journal de tir pendant une durée de <strong>3 ans</strong>
        et le rendre disponible en tout temps sur le lieu de travail.
        &nbsp;&nbsp;
        <em>Originale — Faire une copie pour conserver dans les dossiers de l'entreprise.</em>
      </div>

    </div>
  </div>
{/if}

<svelte:head>
  <style>
    @media print {
      /* When printing from preview modal, hide everything except the print page */
      body > * { display: none !important; }
      .preview-print-page {
        display: block !important;
        position: fixed !important;
        inset: 0 !important;
        margin: 0 !important;
        max-width: none !important;
        padding: 15mm 12mm !important;
        z-index: 99999 !important;
      }
      .preview-no-print { display: none !important; }
    }
    @page {
      size: letter portrait;
      margin: 15mm 12mm;
    }
  </style>
</svelte:head>

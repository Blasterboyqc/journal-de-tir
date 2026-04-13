<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { saveJournal, getProfil, genNumeroTir, type ExplosifRow, type GardienRow, type FiringSequence } from '$lib/db';
  import { showToast } from '$lib/stores/app';
  import { parseBlastPlanPDF } from '$lib/pdf-parser';
  import { extractFiringSequence, summarizeFiringSequence, groupHolesByDelay, formatDelay, pdfHasFiringSequencePage } from '$lib/vision-extract';

  // Form state
  let saving = $state(false);
  let importing = $state(false);
  let visionExtracting = $state(false);
  let activeSection = $state(0);
  let sigCanvas: HTMLCanvasElement;
  let sigCtx: CanvasRenderingContext2D | null = null;
  let sigDrawing = false;
  let sigLastX = 0, sigLastY = 0;
  let pdfFileInput: HTMLInputElement;

  // Form data
  let form = $state({
    numero_tir: genNumeroTir(),
    statut: 'brouillon' as 'brouillon' | 'complete' | 'archive',
    // Identification
    date_tir: new Date().toISOString().split('T')[0],
    heure_tir: new Date().toTimeString().slice(0,5),
    chantier: '',
    station: '',
    contrat: '',
    // Boutefeu
    boutefeu_prenom: '',
    boutefeu_nom: '',
    boutefeu_certificat: '',
    boutefeu_permis_sq: '',
    superviseur: '',
    employeur: '',
    // Conditions
    temperature: '',
    meteo: 'Ensoleillé',
    conditions_roc: 'Sec',
    geologie: '',
    type_roc: 'Roc dur',
    // Plan de forage
    type_tir: 'Banc',
    nb_trous: '',
    profondeur_prevue: '',
    profondeur_reelle: '',
    diametre: '',
    espacement: '',
    fardeau: '',
    sous_forage: '',
    inclinaison: '90',
    orientation: '',
    // Explosifs
    detonateurs: '',
    type_detonateurs: 'Non-électrique (NONEL)',
    sequence_delais: '',
    nb_detonateurs: '',
    // Sécurité
    zone_securite_m: '',
    signaux_utilises: '3 coups de klaxon (Attention), 1 coup (Tir), 2 coups (Tout clair)',
    procedures_suivies: false,
    zone_evacuee: false,
    communication_etablie: false,
    inspection_avant: false,
    // Résultats
    heure_mise_a_feu: '',
    fragmentation: '',
    projection_max_m: '',
    vibrations_ppv: '',
    bruit_db: '',
    fumee_couleur: '',
    trous_rates: 'non',
    nb_trous_rates: '',
    description_rates: '',
    procedures_rates: '',
    resultats_generaux: '',
    // Récap
    total_explosif_kg: '',
    total_detonateurs: '',
    ratio_poudre: '',
    // Notes
    remarques: '',
    // Signature
    signature_data: '',
    signature_date: new Date().toISOString().split('T')[0],
  });

  let explosifs = $state<ExplosifRow[]>([]);
  let gardiens = $state<GardienRow[]>([]);

  // Vision AI — Firing Sequence (Phase 2)
  let firingSequence = $state<FiringSequence | null>(null);
  let visionPdfFile = $state<File | null>(null);    // The last imported PDF (for Vision AI)
  let visionShowPreview = $state(false);            // Whether to show the extracted holes preview

  onMount(async () => {
    const profil = await getProfil();
    if (profil) {
      form.boutefeu_prenom = profil.prenom;
      form.boutefeu_nom = profil.nom;
      form.boutefeu_certificat = profil.certificat_cstc;
      form.boutefeu_permis_sq = profil.permis_sq;
      form.employeur = profil.employeur;
      form.chantier = profil.chantier_actuel;
    }
    // Init signature canvas
    setTimeout(() => initSig(), 100);
  });

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
    // Ratio poudre rough estimate: assume 2.5t/m³ rock density, use nb_trous * profondeur * diameter area
    const nTrous = parseInt(form.nb_trous) || 0;
    const prof = parseFloat(form.profondeur_reelle || form.profondeur_prevue) || 0;
    const diam = parseFloat(form.diametre) || 0;
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

  function addGardien() {
    gardiens = [...gardiens, { id: Date.now().toString(), nom: '', poste: '' }];
  }

  function removeGardien(id: string) {
    gardiens = gardiens.filter(g => g.id !== id);
  }

  async function saveAsDraft() {
    await doSave('brouillon');
  }

  async function saveAsComplete() {
    await doSave('complete');
  }

  async function doSave(statut: 'brouillon' | 'complete' | 'archive') {
    if (saving) return;
    saving = true;
    try {
      const now = new Date().toISOString();
      const id = await saveJournal({
        ...form,
        statut,
        explosifs,
        gardiens,
        firingSequence: firingSequence ?? undefined,
        createdAt: now,
        updatedAt: now,
      });
      showToast(statut === 'complete' ? '✅ Journal complété et sauvegardé!' : '💾 Brouillon sauvegardé', 'success');
      setTimeout(() => goto(`/journal/${id}`), 500);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      saving = false;
    }
  }

  async function importFromPDF(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Store the file for Vision AI use (pdfHasFiringSequencePage check is done in the UI)
    visionPdfFile = file;
    firingSequence = null;  // Reset any previous extraction when a new PDF is loaded
    visionShowPreview = false;

    importing = true;
    try {
      const result = await parseBlastPlanPDF(file);
      const data = result.journalData;

      // Apply parsed fields to the form (only overwrite empty fields, except for key fields)
      if (data.numero_tir) form.numero_tir = data.numero_tir;
      if (data.date_tir) form.date_tir = data.date_tir;
      if (data.station) form.station = data.station;
      if (data.chantier) form.chantier = data.chantier;
      if (data.contrat) form.contrat = data.contrat;
      if (data.type_tir) form.type_tir = data.type_tir;
      if (data.nb_trous) form.nb_trous = data.nb_trous;
      if (data.profondeur_prevue) form.profondeur_prevue = data.profondeur_prevue;
      if (data.diametre) form.diametre = data.diametre;
      if (data.espacement) form.espacement = data.espacement;
      if (data.fardeau) form.fardeau = data.fardeau;
      if (data.sous_forage) form.sous_forage = data.sous_forage;
      if (data.inclinaison) form.inclinaison = data.inclinaison;
      if (data.detonateurs) form.detonateurs = data.detonateurs;
      if (data.type_detonateurs) form.type_detonateurs = data.type_detonateurs;
      if (data.nb_detonateurs) form.nb_detonateurs = data.nb_detonateurs;
      if (data.sequence_delais) form.sequence_delais = data.sequence_delais;
      if (data.superviseur && !form.superviseur) form.superviseur = data.superviseur;
      if (data.total_explosif_kg) form.total_explosif_kg = data.total_explosif_kg;
      if (data.vibrations_ppv) form.vibrations_ppv = data.vibrations_ppv;
      if (data.remarques) {
        form.remarques = form.remarques
          ? form.remarques + '\n\n' + data.remarques
          : data.remarques;
      }

      // Apply explosifs array
      if (data.explosifs && data.explosifs.length > 0) {
        explosifs = data.explosifs.map(e => ({ ...e, id: Date.now().toString() + Math.random() }));
        recalcTotal();
      }

      // Show success toast
      const count = result.fieldsExtracted;
      const typeLabel = result.documentType === 'bench' ? 'banquette'
        : result.documentType === 'tunnel_advance' ? 'foncée' : 'inconnu';
      showToast(`📋 ${count} champs remplis automatiquement (plan de ${typeLabel})`, 'success');

      // Show warnings if any
      if (result.warnings && result.warnings.length > 0) {
        setTimeout(() => {
          showToast(`⚠️ ${result.warnings[0]}`, 'info');
        }, 4000);
      }

      // Navigate to the identification section so user can review
      activeSection = 0;
    } catch (err) {
      console.error('PDF import error:', err);
      showToast('❌ Erreur lors de l\'analyse du PDF', 'error');
    } finally {
      importing = false;
      // Reset file input so same file can be re-imported
      if (pdfFileInput) pdfFileInput.value = '';
    }
  }

  // ─── Vision AI Extraction ──────────────────────────────────────────────────

  async function runVisionExtract() {
    if (!visionPdfFile) {
      showToast('⚠️ Importez d\'abord un plan de tir PDF', 'info');
      return;
    }
    if (visionExtracting) return;

    visionExtracting = true;
    try {
      showToast('🤖 Analyse Vision AI en cours... (peut prendre 15-30 sec)', 'info');

      // Build shot info hints from parsed form data
      const shotInfo = {
        tirNumber: form.numero_tir ? parseInt(form.numero_tir.replace(/\D/g, '').slice(-4)) || undefined : undefined,
        totalHoles: form.nb_trous ? parseInt(form.nb_trous) || undefined : undefined,
      };

      const result = await extractFiringSequence(
        visionPdfFile,
        shotInfo
      );

      firingSequence = result.firingSequence;
      visionShowPreview = true;

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
          title="Extraire la séquence de tir (trous, délais) depuis la page C du PDF via Vision AI"
        >
          {visionExtracting ? '🤖 Vision AI...' : firingSequence ? '✅ Séquence extraite' : '🔍 Séquence de tir'}
        </button>
      {/if}
      <button onclick={saveAsDraft} class="btn btn-secondary btn-sm" disabled={saving}>
        💾 Brouillon
      </button>
    </div>
  </div>

  <!-- Section tabs (scrollable) -->
  <div style="
    display: flex; gap: 6px; overflow-x: auto; padding-bottom: 10px;
    scrollbar-width: none; margin-bottom: 12px;
  ">
    {#each sections as sec, i}
      <button
        onclick={() => activeSection = i}
        style="
          flex-shrink: 0; padding: 7px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;
          cursor: pointer; border: 1px solid {activeSection === i ? 'var(--accent)' : 'var(--border)'};
          background: {activeSection === i ? 'var(--accent-glow)' : 'var(--card2)'};
          color: {activeSection === i ? 'var(--accent2)' : 'var(--text3)'};
          white-space: nowrap; font-family: inherit;
        "
      >{sec}</button>
    {/each}
  </div>

  <!-- SECTION 1: IDENTIFICATION -->
  {#if activeSection === 0}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">①</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Identification du chantier</h3>
    </div>
    <div class="card-body">
      <div class="form-row">
        <div class="form-group">
          <label>Numéro de tir</label>
          <input type="text" bind:value={form.numero_tir} placeholder="TIR-XXXXXX">
        </div>
        <div class="form-group">
          <label>Statut</label>
          <select bind:value={form.statut}>
            <option value="brouillon">Brouillon</option>
            <option value="complete">Complété</option>
            <option value="archive">Archivé</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Date du tir <span style="color:var(--red)">*</span></label>
          <input type="date" bind:value={form.date_tir}>
        </div>
        <div class="form-group">
          <label>Heure prévue <span style="color:var(--red)">*</span></label>
          <input type="time" bind:value={form.heure_tir}>
        </div>
      </div>
      <div class="form-row cols1">
        <div class="form-group">
          <label>Chantier / Projet <span style="color:var(--red)">*</span></label>
          <input type="text" bind:value={form.chantier} placeholder="ex: PLB Metro — Secteur Anjou">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Station / Localisation</label>
          <input type="text" bind:value={form.station} placeholder="ex: Station ST-085">
        </div>
        <div class="form-group">
          <label>No. contrat</label>
          <input type="text" bind:value={form.contrat} placeholder="ex: C-2024-1234">
        </div>
      </div>
    </div>
  </div>
  {/if}

  <!-- SECTION 2: BOUTEFEU -->
  {#if activeSection === 1}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">②</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Boutefeu et permis</h3>
    </div>
    <div class="card-body">
      <div class="form-row">
        <div class="form-group">
          <label>Prénom <span style="color:var(--red)">*</span></label>
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
          <input type="text" bind:value={form.superviseur} placeholder="Nom du superviseur">
        </div>
        <div class="form-group">
          <label>Employeur</label>
          <input type="text" bind:value={form.employeur} placeholder="Entreprise">
        </div>
      </div>
    </div>
  </div>
  {/if}

  <!-- SECTION 3: CONDITIONS -->
  {#if activeSection === 2}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">③</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Conditions météo et géologie</h3>
    </div>
    <div class="card-body">
      <div class="form-row">
        <div class="form-group">
          <label>Température (°C)</label>
          <input type="number" bind:value={form.temperature} placeholder="-10 à 40">
        </div>
        <div class="form-group">
          <label>Météo</label>
          <select bind:value={form.meteo}>
            <option>Ensoleillé</option>
            <option>Nuageux</option>
            <option>Pluie légère</option>
            <option>Pluie forte</option>
            <option>Neige</option>
            <option>Tempête</option>
            <option>Brouillard</option>
            <option>Vent fort</option>
          </select>
        </div>
      </div>
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
          <textarea bind:value={form.geologie} placeholder="Description détaillée de la géologie, particularités..."></textarea>
        </div>
      </div>
    </div>
  </div>
  {/if}

  <!-- SECTION 4: PLAN DE FORAGE -->
  {#if activeSection === 3}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">④</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Plan de forage</h3>
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
          <label>Nombre de trous <span style="color:var(--red)">*</span></label>
          <input type="number" bind:value={form.nb_trous} placeholder="ex: 24">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Profondeur prévue (m)</label>
          <input type="number" step="0.1" bind:value={form.profondeur_prevue} placeholder="ex: 4.5">
        </div>
        <div class="form-group">
          <label>Profondeur réelle (m)</label>
          <input type="number" step="0.1" bind:value={form.profondeur_reelle} placeholder="ex: 4.3">
        </div>
      </div>
      <div class="form-row cols3">
        <div class="form-group">
          <label>Diamètre (mm)</label>
          <input type="number" bind:value={form.diametre} placeholder="ex: 76">
        </div>
        <div class="form-group">
          <label>Espacement (m)</label>
          <input type="number" step="0.1" bind:value={form.espacement} placeholder="ex: 1.8">
        </div>
        <div class="form-group">
          <label>Fardeau (m)</label>
          <input type="number" step="0.1" bind:value={form.fardeau} placeholder="ex: 1.5">
        </div>
      </div>
      <div class="form-row cols3">
        <div class="form-group">
          <label>Sous-forage (m)</label>
          <input type="number" step="0.1" bind:value={form.sous_forage} placeholder="ex: 0.4">
        </div>
        <div class="form-group">
          <label>Inclinaison (°)</label>
          <input type="number" bind:value={form.inclinaison} placeholder="90 = vertical">
        </div>
        <div class="form-group">
          <label>Orientation</label>
          <input type="text" bind:value={form.orientation} placeholder="ex: N45E">
        </div>
      </div>
    </div>
  </div>
  {/if}

  <!-- SECTION 5: EXPLOSIFS -->
  {#if activeSection === 4}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">⑤</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Explosifs et détonateurs</h3>
    </div>
    <div class="card-body">

      <!-- Explosifs Table -->
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        Produits explosifs
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

      <!-- Recap -->
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

      <!-- Détonateurs -->
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        Détonateurs et amorçage
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Type de détonateurs</label>
          <select bind:value={form.type_detonateurs}>
            <option>Non-électrique (NONEL)</option>
            <option>Électrique</option>
            <option>Électronique (eDev)</option>
            <option>Mèche à retard</option>
            <option>Mèche ordinaire</option>
          </select>
        </div>
        <div class="form-group">
          <label>Nb détonateurs</label>
          <input type="number" bind:value={form.nb_detonateurs} placeholder="Total">
        </div>
      </div>
      <div class="form-row cols1">
        <div class="form-group">
          <label>Marque / Modèle de détonateurs</label>
          <input type="text" bind:value={form.detonateurs} placeholder="ex: Dyno Nobel Exel LP, MS 500ms">
        </div>
      </div>
      <div class="form-row cols1">
        <div class="form-group">
          <label>Séquence et délais de tir</label>
          <textarea bind:value={form.sequence_delais} placeholder="ex: Rangée 1 (0ms) → Rangée 2 (17ms) → Rangée 3 (42ms)..."></textarea>
        </div>
      </div>

      <!-- ──── Vision AI — Firing Sequence Extraction ──── -->
      <div class="divider"></div>
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        Séquence de tir — Vision AI (Page C)
      </div>

      {#if !visionPdfFile}
        <!-- No PDF imported yet -->
        <div style="
          padding: 14px; border: 1px dashed var(--border); border-radius: var(--radius-sm);
          background: var(--card2); text-align: center; color: var(--text3); font-size: 12px;
        ">
          📄 Importez d'abord un plan de tir PDF pour activer l'extraction Vision AI
        </div>
      {:else if !firingSequence}
        <!-- PDF imported, ready to extract -->
        <div style="
          padding: 14px; border: 1px dashed rgba(139,92,246,0.3); border-radius: var(--radius-sm);
          background: rgba(139,92,246,0.05);
        ">
          <div style="font-size: 13px; color: var(--text2); margin-bottom: 10px;">
            🤖 Extrayez automatiquement les positions et délais de chaque trou depuis le diagramme de séquence (page C du plan de tir).
          </div>
          <div style="font-size: 11px; color: var(--text3); margin-bottom: 10px; line-height: 1.5;">
            Utilise Google Gemini Flash (Vision AI) pour lire le diagramme raster et identifier les trous, délais (ms) et connexions.
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
        <!-- Extraction complete — show results -->
        <div style="
          border: 1px solid rgba(139,92,246,0.3); border-radius: var(--radius-sm);
          background: rgba(139,92,246,0.05); overflow: hidden;
        ">
          <!-- Summary bar -->
          <div style="
            padding: 10px 14px; background: rgba(139,92,246,0.1);
            border-bottom: 1px solid rgba(139,92,246,0.2);
            display: flex; align-items: center; gap: 8px; justify-content: space-between;
          ">
            <div>
              <span style="font-size: 13px; font-weight: 700; color: #a78bfa;">✅ Séquence extraite</span>
              <span style="font-size: 11px; color: var(--text3); margin-left: 8px;">
                {summarizeFiringSequence(firingSequence)}
              </span>
            </div>
            <div style="display: flex; gap: 6px;">
              <button
                onclick={() => { visionShowPreview = !visionShowPreview; }}
                style="
                  padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
                  background: transparent; border: 1px solid rgba(139,92,246,0.4);
                  color: #a78bfa; cursor: pointer; font-family: inherit;
                "
              >
                {visionShowPreview ? '▲ Masquer' : '▼ Détails'}
              </button>
              <button
                onclick={runVisionExtract}
                disabled={visionExtracting}
                style="
                  padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
                  background: transparent; border: 1px solid var(--border);
                  color: var(--text3); cursor: pointer; font-family: inherit;
                "
              >
                🔄 Ré-extraire
              </button>
            </div>
          </div>

          {#if visionShowPreview}
            <div style="padding: 12px 14px;">
              <!-- Delay groups summary -->
              {#if firingSequence.delayRange}
                <div style="margin-bottom: 10px; font-size: 11px; color: var(--text3);">
                  Plage de délais: <strong style="color: var(--text2);">
                    {firingSequence.delayRange.min} ms – {firingSequence.delayRange.max} ms
                  </strong>
                  · {firingSequence.holes.length} trous
                  · {firingSequence.connections?.length ?? 0} connexions
                </div>
              {/if}

              <!-- Delay groups visualization -->
              {#if firingSequence.holes.length > 0}
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 10px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                    Groupes de délais
                  </div>
                  {#each [...groupHolesByDelay(firingSequence.holes).entries()] as [delay, holeIds]}
                    <div style="
                      display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
                    ">
                      <div style="
                        width: 60px; text-align: right; font-size: 11px; font-weight: 600;
                        color: #a78bfa; flex-shrink: 0;
                      ">{formatDelay(delay)}</div>
                      <div style="
                        flex: 1; height: 16px; background: rgba(139,92,246,0.15);
                        border-radius: 3px; position: relative; overflow: hidden;
                      ">
                        <div style="
                          position: absolute; left: 0; top: 0; bottom: 0;
                          width: {Math.min(100, (holeIds.length / Math.max(...[...groupHolesByDelay(firingSequence.holes).values()].map(a => a.length))) * 100)}%;
                          background: rgba(139,92,246,0.5); border-radius: 3px;
                        "></div>
                      </div>
                      <div style="
                        width: 28px; text-align: right; font-size: 10px; color: var(--text3); flex-shrink: 0;
                      ">{holeIds.length}</div>
                    </div>
                  {/each}
                </div>
              {/if}

              <!-- First holes table -->
              <div style="font-size: 10px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                Trous (premiers 20)
              </div>
              <div style="
                overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-sm);
                font-size: 11px;
              ">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: var(--card2);">
                      <th style="padding: 6px 8px; text-align: left; color: var(--text3); font-weight: 600; border-bottom: 1px solid var(--border);">#</th>
                      <th style="padding: 6px 8px; text-align: left; color: var(--text3); font-weight: 600; border-bottom: 1px solid var(--border);">X</th>
                      <th style="padding: 6px 8px; text-align: left; color: var(--text3); font-weight: 600; border-bottom: 1px solid var(--border);">Y</th>
                      <th style="padding: 6px 8px; text-align: left; color: var(--text3); font-weight: 600; border-bottom: 1px solid var(--border);">Délai</th>
                      <th style="padding: 6px 8px; text-align: left; color: var(--text3); font-weight: 600; border-bottom: 1px solid var(--border);">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each firingSequence.holes.slice(0, 20) as hole, i}
                      <tr style="border-bottom: 1px solid var(--border); background: {i % 2 === 0 ? 'transparent' : 'var(--card2)'};">
                        <td style="padding: 5px 8px; color: var(--text2); font-weight: 600;">{hole.id}</td>
                        <td style="padding: 5px 8px; color: var(--text3);">{hole.x.toFixed(3)}</td>
                        <td style="padding: 5px 8px; color: var(--text3);">{hole.y.toFixed(3)}</td>
                        <td style="padding: 5px 8px; color: #a78bfa; font-weight: 600;">{formatDelay(hole.delay_ms)}</td>
                        <td style="padding: 5px 8px; color: var(--text3);">
                          {hole.type === 'bouchon' ? '○ bouchon' : hole.type === 'tampon' ? '◐ tampon' : '● masse'}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
              {#if firingSequence.holes.length > 20}
                <div style="font-size: 11px; color: var(--text3); margin-top: 6px; text-align: center;">
                  ... et {firingSequence.holes.length - 20} autres trous
                </div>
              {/if}

              <!-- Confidence + model info -->
              <div style="
                margin-top: 10px; padding: 8px 10px; background: var(--card2);
                border-radius: var(--radius-sm); font-size: 10px; color: var(--text3);
              ">
                🤖 Extrait par {firingSequence.model ?? 'Gemini'} ·
                Confiance {Math.round((firingSequence.confidence ?? 0) * 100)}% ·
                {#if firingSequence.extractedAt}
                  {new Date(firingSequence.extractedAt).toLocaleString('fr-CA')}
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
  {/if}

  <!-- SECTION 6: SÉCURITÉ -->
  {#if activeSection === 5}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">⑥</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Mesures de sécurité</h3>
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

      <!-- Checklist sécurité -->
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
            border-radius: 6px; padding: 8px 10px; cursor: pointer; font-family: inherit;
            flex-shrink: 0;
          ">✕</button>
        </div>
      {/each}

      <button onclick={addGardien} class="btn btn-secondary btn-sm">
        ➕ Ajouter un gardien
      </button>
    </div>
  </div>
  {/if}

  <!-- SECTION 7: RÉSULTATS -->
  {#if activeSection === 6}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">⑦</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Résultats du tir</h3>
    </div>
    <div class="card-body">
      <div class="form-row">
        <div class="form-group">
          <label>Heure de mise à feu <span style="color:var(--red)">*</span></label>
          <input type="time" bind:value={form.heure_mise_a_feu}>
        </div>
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
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Projection max (m)</label>
          <input type="number" step="0.1" bind:value={form.projection_max_m} placeholder="Distance max">
        </div>
        <div class="form-group">
          <label>Vibrations PPV (mm/s)</label>
          <input type="number" step="0.01" bind:value={form.vibrations_ppv} placeholder="ex: 2.45">
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

      <!-- Ratés -->
      <div style="margin-top: 8px; margin-bottom: 8px;">
        <label style="margin-bottom: 6px;">Trous ratés (misfire)?</label>
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
              <textarea bind:value={form.description_rates} placeholder="Description détaillée des trous ratés..."></textarea>
            </div>
          </div>
          <div class="form-row cols1">
            <div class="form-group">
              <label>Procédures appliquées</label>
              <textarea bind:value={form.procedures_rates} placeholder="Procédures suivies pour les ratés..."></textarea>
            </div>
          </div>
        </div>
      {/if}

      <div class="form-row cols1">
        <div class="form-group">
          <label>Observations générales</label>
          <textarea bind:value={form.resultats_generaux} placeholder="Observations globales du tir, résultat final..."></textarea>
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

      <!-- Notes -->
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        Remarques et notes additionnelles
      </div>
      <textarea bind:value={form.remarques} placeholder="Notes additionnelles, observations spéciales, informations importantes..." style="min-height: 100px;"></textarea>
    </div>
  </div>
  {/if}

  <!-- SECTION 8: SIGNATURE -->
  {#if activeSection === 7}
  <div class="card">
    <div class="card-header">
      <div class="section-letter">⑧</div>
      <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Signature et certification</h3>
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
          <label>Nom (certification)</label>
          <input type="text" value="{form.boutefeu_prenom} {form.boutefeu_nom}" readonly
            style="background: var(--surface); opacity: 0.8;">
        </div>
        <div class="form-group">
          <label>Date de signature</label>
          <input type="date" bind:value={form.signature_date}>
        </div>
      </div>

      <div style="margin-top: 8px; margin-bottom: 6px;">
        <label>Signature du boutefeu (dessiner ci-dessous)</label>
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
    </div>
  </div>

  <!-- Save buttons -->
  <div style="display: flex; gap: 10px; margin-top: 12px;">
    <button onclick={saveAsDraft} class="btn btn-secondary" style="flex: 1;" disabled={saving}>
      💾 Sauvegarder brouillon
    </button>
    <button onclick={saveAsComplete} class="btn btn-success" style="flex: 1;" disabled={saving}>
      ✅ Compléter et sauvegarder
    </button>
  </div>
  {/if}

  <!-- Navigation prev/next -->
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

</div>

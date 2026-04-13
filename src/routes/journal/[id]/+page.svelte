<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getJournal, updateJournal, deleteJournal, type JournalTir } from '$lib/db';
  import { showToast } from '$lib/stores/app';
  import { parseBlastPlanPDF } from '$lib/pdf-parser';
  import BlastPatternCanvas from '$lib/components/BlastPatternCanvas.svelte';

  let journal = $state<JournalTir | null>(null);
  let loading = $state(true);
  let exporting = $state(false);
  let deleting = $state(false);
  let importing = $state(false);
  let activeSection = $state(0);
  let pdfFileInput = $state<HTMLInputElement | null>(null);

  const id = $derived(parseInt($page.params.id));

  onMount(async () => {
    const j = await getJournal(id);
    if (j) {
      journal = j;
    } else {
      showToast('Journal introuvable', 'error');
      goto('/historique');
    }
    loading = false;
  });

  async function exportPDF() {
    if (!journal || exporting) return;
    exporting = true;
    try {
      const { exportJournalPDF } = await import('$lib/pdf');
      await exportJournalPDF(journal);
      showToast('📄 PDF téléchargé!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erreur export PDF', 'error');
    } finally {
      exporting = false;
    }
  }

  async function markComplete() {
    if (!journal) return;
    await updateJournal(id, { statut: 'complete' });
    journal.statut = 'complete';
    showToast('✅ Journal marqué comme complété', 'success');
  }

  async function confirmDelete() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce journal? Cette action est irréversible.')) return;
    deleting = true;
    await deleteJournal(id);
    showToast('🗑️ Journal supprimé', 'info');
    goto('/historique');
  }

  function getStatutBadge(statut: string) {
    switch (statut) {
      case 'complete': return 'badge-green';
      case 'brouillon': return 'badge-yellow';
      case 'archive': return 'badge-gray';
      default: return 'badge-gray';
    }
  }

  function getStatutLabel(statut: string) {
    switch (statut) {
      case 'complete': return '✅ Complété';
      case 'brouillon': return '✏️ Brouillon';
      case 'archive': return '📦 Archivé';
      default: return statut;
    }
  }

  function fieldRow(label: string, value: string | boolean | number | undefined) {
    if (!value && value !== false && value !== 0) return '';
    return value;
  }

  async function importFromPDF(event: Event) {
    if (!journal) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    importing = true;
    try {
      const result = await parseBlastPlanPDF(file);
      const data = result.journalData;

      // Build update payload — only overwrite fields that were extracted
      const updates: Partial<JournalTir> = {};

      if (data.numero_tir) updates.numero_tir = data.numero_tir;
      if (data.date_tir) updates.date_tir = data.date_tir;
      if (data.station) updates.station = data.station;
      if (data.chantier) updates.chantier = data.chantier;
      if (data.contrat) updates.contrat = data.contrat;
      if (data.type_tir) updates.type_tir = data.type_tir;
      if (data.nb_trous) updates.nb_trous = data.nb_trous;
      if (data.profondeur_prevue) updates.profondeur_prevue = data.profondeur_prevue;
      if (data.diametre) updates.diametre = data.diametre;
      if (data.espacement) updates.espacement = data.espacement;
      if (data.fardeau) updates.fardeau = data.fardeau;
      if (data.sous_forage) updates.sous_forage = data.sous_forage;
      if (data.inclinaison) updates.inclinaison = data.inclinaison;
      if (data.detonateurs) updates.detonateurs = data.detonateurs;
      if (data.type_detonateurs) updates.type_detonateurs = data.type_detonateurs;
      if (data.nb_detonateurs) updates.nb_detonateurs = data.nb_detonateurs;
      if (data.sequence_delais) updates.sequence_delais = data.sequence_delais;
      if (data.superviseur && !journal.superviseur) updates.superviseur = data.superviseur;
      if (data.total_explosif_kg) updates.total_explosif_kg = data.total_explosif_kg;
      if (data.vibrations_ppv) updates.vibrations_ppv = data.vibrations_ppv;
      if (data.remarques) {
        updates.remarques = journal.remarques
          ? journal.remarques + '\n\n' + data.remarques
          : data.remarques;
      }
      if (data.explosifs && data.explosifs.length > 0) {
        updates.explosifs = data.explosifs;
      }

      // Save to DB
      await updateJournal(id, updates);

      // Update local state
      Object.assign(journal, updates);

      const count = result.fieldsExtracted;
      const typeLabel = result.documentType === 'bench' ? 'banquette'
        : result.documentType === 'tunnel_advance' ? 'foncée' : 'inconnu';
      showToast(`📋 ${count} champs mis à jour (plan de ${typeLabel})`, 'success');

      if (result.warnings && result.warnings.length > 0) {
        setTimeout(() => showToast(`⚠️ ${result.warnings[0]}`, 'info'), 4000);
      }
    } catch (err) {
      console.error('PDF import error:', err);
      showToast('❌ Erreur lors de l\'analyse du PDF', 'error');
    } finally {
      importing = false;
      if (pdfFileInput) pdfFileInput.value = '';
    }
  }

  const baseSections = ['① Identification', '② Boutefeu', '③ Forage', '④ Explosifs', '⑤ Sécurité', '⑥ Résultats'];
  const sections = $derived(
    journal?.firingSequence
      ? [...baseSections, '💥 Séquence']
      : baseSections
  );
</script>

{#if loading}
  <div style="padding: 40px; text-align: center; color: var(--text3);">Chargement...</div>
{:else if journal}
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
      padding: 14px; margin-bottom: 12px;
    ">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <button onclick={() => goto('/historique')} style="
          background: none; border: none; color: var(--text3); cursor: pointer;
          font-size: 12px; padding: 4px 0; font-family: inherit;
        ">← Retour</button>
        <span class="badge {getStatutBadge(journal.statut)}">{getStatutLabel(journal.statut)}</span>
      </div>
      <div style="font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 2px;">
        💥 {journal.numero_tir}
      </div>
      <div style="font-size: 12px; color: var(--text3);">
        {journal.chantier || 'Chantier non défini'} · {journal.date_tir || '—'}
      </div>

      <!-- Action buttons -->
      <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
        <button onclick={exportPDF} class="btn btn-primary btn-sm" disabled={exporting}>
          {exporting ? '⏳ Export...' : '📄 Export PDF'}
        </button>
        <button
          onclick={() => pdfFileInput?.click()}
          class="btn btn-secondary btn-sm"
          disabled={importing}
          style="background: var(--accent-glow); border-color: var(--accent); color: var(--accent2);"
          title="Importer un plan de tir PDF pour mettre à jour les champs"
        >
          {importing ? '⏳ Analyse...' : '📄 Importer PDF'}
        </button>
        <button onclick={() => goto(`/journal/${journal?.id}/print`)} class="btn btn-secondary btn-sm"
          style="background: rgba(46,204,113,0.1); border-color: rgba(46,204,113,0.4); color: #2ecc71;"
          title="Aperçu impression — format ASP Construction conforme"
        >
          🖨️ Impression ASP
        </button>
        <button onclick={() => goto(`/journal/new?edit=${journal?.id}`)} class="btn btn-secondary btn-sm">
          ✏️ Modifier
        </button>
        {#if journal.statut === 'brouillon'}
          <button onclick={markComplete} class="btn btn-success btn-sm">
            ✅ Marquer complété
          </button>
        {/if}
        <button onclick={confirmDelete} class="btn btn-danger btn-sm" disabled={deleting}>
          🗑️ Supprimer
        </button>
      </div>
    </div>

    <!-- Section tabs -->
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
      <div class="card-header" style="cursor: default;">
        <div class="section-letter">①</div>
        <h3 style="font-size: 14px; font-weight: 600; color: var(--text);">Identification du chantier</h3>
      </div>
      <div class="card-body">
        {#each [
          ['Numéro de tir', journal.numero_tir],
          ['Date', journal.date_tir],
          ['Heure prévue', journal.heure_tir],
          ['Chantier / Projet', journal.chantier],
          ['Station', journal.station],
          ['No. contrat', journal.contrat],
        ] as [label, val]}
          <div style="display: flex; padding: 7px 0; border-bottom: 1px solid var(--border);">
            <div style="width: 45%; font-size: 12px; color: var(--text3); font-weight: 600;">{label}</div>
            <div style="flex: 1; font-size: 13px; color: var(--text);">{val || '—'}</div>
          </div>
        {/each}
      </div>
    </div>
    {/if}

    <!-- SECTION 2: BOUTEFEU -->
    {#if activeSection === 1}
    <div class="card">
      <div class="card-header" style="cursor: default;">
        <div class="section-letter">②</div>
        <h3 style="font-size: 14px; font-weight: 600; color: var(--text);">Boutefeu et conditions</h3>
      </div>
      <div class="card-body">
        {#each [
          ['Prénom', journal.boutefeu_prenom],
          ['Nom', journal.boutefeu_nom],
          ['Certificat CSTC', journal.boutefeu_certificat],
          ['Permis SQ', journal.boutefeu_permis_sq],
          ['Superviseur', journal.superviseur],
          ['Employeur', journal.employeur],
        ] as [label, val]}
          <div style="display: flex; padding: 7px 0; border-bottom: 1px solid var(--border);">
            <div style="width: 45%; font-size: 12px; color: var(--text3); font-weight: 600;">{label}</div>
            <div style="flex: 1; font-size: 13px; color: var(--text);">{val || '—'}</div>
          </div>
        {/each}
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);">
          <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Conditions</div>
          {#each [
            ['Météo', journal.meteo],
            ['Température', journal.temperature ? `${journal.temperature}°C` : '—'],
            ['Type de roc', journal.type_roc],
            ['Conditions roc', journal.conditions_roc],
            ['Géologie', journal.geologie],
          ] as [label, val]}
            <div style="display: flex; padding: 7px 0; border-bottom: 1px solid var(--border);">
              <div style="width: 45%; font-size: 12px; color: var(--text3); font-weight: 600;">{label}</div>
              <div style="flex: 1; font-size: 13px; color: var(--text);">{val || '—'}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    {/if}

    <!-- SECTION 3: FORAGE -->
    {#if activeSection === 2}
    <div class="card">
      <div class="card-header" style="cursor: default;">
        <div class="section-letter">③</div>
        <h3 style="font-size: 14px; font-weight: 600; color: var(--text);">Plan de forage</h3>
      </div>
      <div class="card-body">
        {#each [
          ['Type de tir', journal.type_tir],
          ['Nombre de trous', journal.nb_trous],
          ['Profondeur prévue', journal.profondeur_prevue ? `${journal.profondeur_prevue} m` : '—'],
          ['Profondeur réelle', journal.profondeur_reelle ? `${journal.profondeur_reelle} m` : '—'],
          ['Diamètre', journal.diametre ? `${journal.diametre} mm` : '—'],
          ['Espacement', journal.espacement ? `${journal.espacement} m` : '—'],
          ['Fardeau', journal.fardeau ? `${journal.fardeau} m` : '—'],
          ['Sous-forage', journal.sous_forage ? `${journal.sous_forage} m` : '—'],
          ['Inclinaison', journal.inclinaison ? `${journal.inclinaison}°` : '—'],
          ['Orientation', journal.orientation],
        ] as [label, val]}
          <div style="display: flex; padding: 7px 0; border-bottom: 1px solid var(--border);">
            <div style="width: 45%; font-size: 12px; color: var(--text3); font-weight: 600;">{label}</div>
            <div style="flex: 1; font-size: 13px; color: var(--text);">{val || '—'}</div>
          </div>
        {/each}
      </div>
    </div>
    {/if}

    <!-- SECTION 4: EXPLOSIFS -->
    {#if activeSection === 3}
    <div class="card">
      <div class="card-header" style="cursor: default;">
        <div class="section-letter">④</div>
        <h3 style="font-size: 14px; font-weight: 600; color: var(--text);">Explosifs et détonateurs</h3>
      </div>
      <div class="card-body">
        {#if journal.explosifs && journal.explosifs.length > 0}
          <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
            Produits explosifs
          </div>
          {#each journal.explosifs as exp, idx}
            <div style="
              background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
              padding: 10px 12px; margin-bottom: 8px;
            ">
              <div style="font-size: 12px; font-weight: 700; color: var(--accent2); margin-bottom: 6px;">#{idx+1} {exp.type || 'Produit'}</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                {#each [
                  ['Fabricant', exp.fabricant],
                  ['No. lot', exp.lot],
                  ['Qté/trou', `${exp.quantite_par_trou} ${exp.unite}`],
                  ['Nb trous', exp.nb_trous],
                  ['Total', `${exp.total_kg} kg`],
                ] as [lbl, v]}
                  <div style="font-size: 11px; color: var(--text3);">{lbl}: <span style="color: var(--text);">{v || '—'}</span></div>
                {/each}
              </div>
            </div>
          {/each}
        {:else}
          <div style="color: var(--text3); font-size: 13px; text-align: center; padding: 12px;">Aucun produit enregistré</div>
        {/if}

        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);">
          {#each [
            ['Type détonateurs', journal.type_detonateurs],
            ['Marque détonateurs', journal.detonateurs],
            ['Nb détonateurs', journal.nb_detonateurs],
            ['Séquence/délais', journal.sequence_delais],
          ] as [label, val]}
            <div style="display: flex; padding: 7px 0; border-bottom: 1px solid var(--border);">
              <div style="width: 45%; font-size: 12px; color: var(--text3); font-weight: 600;">{label}</div>
              <div style="flex: 1; font-size: 13px; color: var(--text);">{val || '—'}</div>
            </div>
          {/each}
        </div>

        <!-- Totaux -->
        <div style="
          background: var(--green-dim); border: 1px solid rgba(46,204,113,0.3);
          border-radius: var(--radius-sm); padding: 12px; margin-top: 12px;
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
        ">
          {#each [
            ['Total exp.', journal.total_explosif_kg ? `${journal.total_explosif_kg} kg` : '—'],
            ['Total dét.', journal.total_detonateurs || '—'],
            ['Ratio', journal.ratio_poudre ? `${journal.ratio_poudre} kg/t` : '—'],
          ] as [lbl, v]}
            <div style="text-align: center;">
              <div style="font-size: 16px; font-weight: 800; color: var(--green);">{v}</div>
              <div style="font-size: 10px; color: var(--text3);">{lbl}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    {/if}

    <!-- SECTION 5: SÉCURITÉ -->
    {#if activeSection === 4}
    <div class="card">
      <div class="card-header" style="cursor: default;">
        <div class="section-letter">⑤</div>
        <h3 style="font-size: 14px; font-weight: 600; color: var(--text);">Sécurité</h3>
      </div>
      <div class="card-body">
        {#each [
          ['Zone de sécurité', journal.zone_securite_m ? `${journal.zone_securite_m} m` : '—'],
          ['Signaux', journal.signaux_utilises],
        ] as [label, val]}
          <div style="display: flex; padding: 7px 0; border-bottom: 1px solid var(--border);">
            <div style="width: 45%; font-size: 12px; color: var(--text3); font-weight: 600;">{label}</div>
            <div style="flex: 1; font-size: 13px; color: var(--text);">{val || '—'}</div>
          </div>
        {/each}

        <!-- Checklist -->
        <div style="margin-top: 12px;">
          {#each [
            { val: journal.procedures_suivies, label: 'Procédures de sécurité respectées' },
            { val: journal.zone_evacuee, label: 'Zone évacuée et sécurisée' },
            { val: journal.communication_etablie, label: 'Communication établie' },
            { val: journal.inspection_avant, label: 'Inspection pré-tir complétée' },
          ] as item}
            <div style="
              display: flex; align-items: center; gap: 10px; padding: 8px 10px;
              background: {item.val ? 'var(--green-dim)' : 'var(--card2)'};
              border: 1px solid {item.val ? 'rgba(46,204,113,0.3)' : 'var(--border)'};
              border-radius: var(--radius-sm); margin-bottom: 6px;
            ">
              <span style="font-size: 16px;">{item.val ? '☑' : '☐'}</span>
              <span style="font-size: 13px; color: {item.val ? 'var(--text)' : 'var(--text3)'};">{item.label}</span>
            </div>
          {/each}
        </div>

        {#if journal.gardiens && journal.gardiens.length > 0}
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);">
            <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
              Gardiens de sécurité
            </div>
            {#each journal.gardiens as g}
              <div style="display: flex; gap: 8px; padding: 6px 0; font-size: 13px; border-bottom: 1px solid var(--border);">
                <span style="color: var(--text);">{g.nom || '—'}</span>
                <span style="color: var(--text3);">—</span>
                <span style="color: var(--text2);">{g.poste || '—'}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    {/if}

    <!-- SECTION 6: RÉSULTATS -->
    {#if activeSection === 5}
    <div class="card">
      <div class="card-header" style="cursor: default;">
        <div class="section-letter">⑥</div>
        <h3 style="font-size: 14px; font-weight: 600; color: var(--text);">Résultats du tir</h3>
      </div>
      <div class="card-body">
        {#each [
          ['Heure de mise à feu', journal.heure_mise_a_feu],
          ['Fragmentation', journal.fragmentation],
          ['Projection max.', journal.projection_max_m ? `${journal.projection_max_m} m` : '—'],
          ['Vibrations PPV', journal.vibrations_ppv ? `${journal.vibrations_ppv} mm/s` : '—'],
          ['Bruit', journal.bruit_db ? `${journal.bruit_db} dB` : '—'],
          ['Fumée', journal.fumee_couleur],
          ['Trous ratés', journal.trous_rates === 'oui' ? `⚠️ Oui (${journal.nb_trous_rates || '?'} trous)` : '✅ Non'],
        ] as [label, val]}
          <div style="display: flex; padding: 7px 0; border-bottom: 1px solid var(--border);">
            <div style="width: 45%; font-size: 12px; color: var(--text3); font-weight: 600;">{label}</div>
            <div style="flex: 1; font-size: 13px; color: var(--text);">{val || '—'}</div>
          </div>
        {/each}

        {#if journal.trous_rates === 'oui'}
          <div style="
            background: var(--red-dim); border: 1px solid rgba(231,76,60,0.3);
            border-radius: var(--radius-sm); padding: 10px 12px; margin-top: 8px;
          ">
            <div style="font-size: 11px; font-weight: 700; color: var(--red); margin-bottom: 6px;">⚠️ RATÉS SIGNALÉS</div>
            <div style="font-size: 13px; color: var(--text);">{journal.description_rates || '—'}</div>
            {#if journal.procedures_rates}
              <div style="font-size: 12px; color: var(--text2); margin-top: 6px;">Procédures: {journal.procedures_rates}</div>
            {/if}
          </div>
        {/if}

        {#if journal.resultats_generaux}
          <div style="margin-top: 12px; padding: 10px 12px; background: var(--card2); border-radius: var(--radius-sm);">
            <div style="font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 4px;">OBSERVATIONS</div>
            <div style="font-size: 13px; color: var(--text);">{journal.resultats_generaux}</div>
          </div>
        {/if}

        {#if journal.remarques}
          <div style="margin-top: 10px; padding: 10px 12px; background: var(--card2); border-radius: var(--radius-sm);">
            <div style="font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 4px;">REMARQUES</div>
            <div style="font-size: 13px; color: var(--text);">{journal.remarques}</div>
          </div>
        {/if}

        <!-- Signature -->
        {#if journal.signature_data}
          <div style="margin-top: 14px; padding: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm);">
            <div style="font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
              Signature — {journal.boutefeu_prenom} {journal.boutefeu_nom}
            </div>
            <img src={journal.signature_data} alt="Signature" style="max-width: 200px; border: 1px solid var(--border); border-radius: 4px;">
            <div style="font-size: 11px; color: var(--text3); margin-top: 4px;">
              Cert. CSTC: {journal.boutefeu_certificat || '—'} · Permis SQ: {journal.boutefeu_permis_sq || '—'}
            </div>
            {#if journal.signature_date}
              <div style="font-size: 11px; color: var(--text3);">Signé le: {journal.signature_date}</div>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Export PDF button at bottom -->
    <button onclick={exportPDF} class="btn btn-primary btn-full" style="margin-top: 12px;" disabled={exporting}>
      {exporting ? '⏳ Génération PDF...' : '📄 Télécharger en PDF'}
    </button>
    {/if}

    <!-- SECTION 7: SÉQUENCE DE TIR (Vision AI) -->
    {#if activeSection === 6 && journal.firingSequence}
    <div class="card">
      <div class="card-header" style="cursor: default;">
        <div class="section-letter" style="background: #7c3aed;">💥</div>
        <h3 style="font-size: 14px; font-weight: 600; color: var(--text);">Séquence de tir — Diagramme</h3>
      </div>
      <div class="card-body">
        <!-- Stats summary -->
        <div style="
          display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;
        ">
          <span style="
            font-size: 11px; font-weight: 600; padding: 3px 10px;
            background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3);
            border-radius: 20px; color: #a78bfa;
          ">{journal.firingSequence.holes.length} trous</span>
          {#if journal.firingSequence.delayRange}
            <span style="
              font-size: 11px; font-weight: 600; padding: 3px 10px;
              background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3);
              border-radius: 20px; color: #a78bfa;
            ">{journal.firingSequence.delayRange.min}–{journal.firingSequence.delayRange.max} ms</span>
          {/if}
          {#if journal.firingSequence.confidence}
            <span style="
              font-size: 11px; font-weight: 600; padding: 3px 10px;
              background: rgba(46,204,113,0.1); border: 1px solid rgba(46,204,113,0.3);
              border-radius: 20px; color: #2ecc71;
            ">{Math.round(journal.firingSequence.confidence * 100)}% confiance</span>
          {/if}
          {#if journal.firingSequence.model}
            <span style="
              font-size: 11px; font-weight: 600; padding: 3px 10px;
              background: rgba(107,114,153,0.15); border: 1px solid var(--border);
              border-radius: 20px; color: var(--text3);
            ">🤖 {journal.firingSequence.model}</span>
          {/if}
        </div>

        <!-- Canvas -->
        <BlastPatternCanvas
          firingSequence={journal.firingSequence}
          title={journal.numero_tir || 'Séquence de tir'}
          shotInfo="{journal.chantier || ''}{journal.chantier && journal.date_tir ? ' · ' : ''}{journal.date_tir || ''}"
          interactive={true}
          showAnimation={true}
          showExport={true}
        />

        <!-- Extraction metadata -->
        {#if journal.firingSequence.extractedAt}
          <div style="
            margin-top: 8px; font-size: 10px; color: var(--text3); text-align: right;
          ">
            Extrait le {new Date(journal.firingSequence.extractedAt).toLocaleString('fr-CA')}
          </div>
        {/if}
      </div>
    </div>
    {/if}

  </div>
{/if}

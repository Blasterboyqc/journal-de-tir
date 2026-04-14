<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { getJournal, updateJournal, deleteJournal, type JournalTir } from '$lib/db';
  import { showToast } from '$lib/stores/app';
  import BoreholeDiagram from '$lib/components/BoreholeDiagram.svelte';
  import DrillPatternEditor from '$lib/components/DrillPatternEditor.svelte';

  let journal = $state<JournalTir | null>(null);
  let loading = $state(true);
  let deleting = $state(false);
  let activeTab = $state(0);  // 0=Journal, 1=Plan de tir, 2=Profil de tir

  const id = $derived(parseInt($page.params.id));

  onMount(async () => {
    const j = await getJournal(id);
    if (j) {
      journal = j;
    } else {
      showToast('Journal introuvable', 'error');
      goto(base + '/historique');
    }
    loading = false;
  });

  async function markComplete() {
    if (!journal) return;
    await updateJournal(id, { statut: 'complete' });
    journal.statut = 'complete';
    showToast('✅ Journal marqué comme complété', 'success');
  }

  async function confirmDelete() {
    if (!confirm('Supprimer ce journal? Cette action est irréversible.')) return;
    deleting = true;
    await deleteJournal(id);
    showToast('🗑️ Journal supprimé', 'info');
    goto(base + '/historique');
  }

  function yesNo(val: boolean | null | undefined): string {
    if (val === true) return 'Oui';
    if (val === false) return 'Non';
    return '—';
  }

  function yesNoBadge(val: boolean | null | undefined, invertDanger = false): string {
    if (val === null || val === undefined) return 'color: var(--text3);';
    const isGood = invertDanger ? !val : val;
    return isGood
      ? 'color: var(--green); font-weight: 700;'
      : 'color: var(--red); font-weight: 700;';
  }

  const tabs = ['📋 Journal', '🗺️ Plan de tir', '📐 Profil de tir'];

  function formatDate(d: string) {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('fr-CA', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch { return d; }
  }
</script>

{#if loading}
  <div style="padding: 40px; text-align: center; color: var(--text3);">Chargement...</div>
{:else if journal}
<div style="padding: 0 0 16px;">

  <!-- Sticky header -->
  <div style="
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 12px 14px;
    position: sticky; top: 0; z-index: 50;
  ">
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
      <button
        onclick={() => goto(base + '/historique')}
        style="background: none; border: none; color: var(--text3); cursor: pointer; font-size: 18px; padding: 4px; font-family: inherit;"
      >←</button>
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: 700; color: var(--text);">💥 {journal.numero_tir}</div>
        <div style="font-size: 10px; color: var(--text3);">
          {journal.localisation_chantier || 'Chantier —'} · {formatDate(journal.date_tir)}
        </div>
      </div>
      <span style="
        font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px;
        {journal.statut === 'complete'
          ? 'background: var(--green-dim); color: var(--green); border: 1px solid rgba(46,204,113,0.3);'
          : 'background: var(--yellow-dim); color: var(--yellow); border: 1px solid rgba(243,156,18,0.3);'}
      ">
        {journal.statut === 'complete' ? '✅ Complété' : '✏️ Brouillon'}
      </span>
    </div>

    <!-- Action buttons -->
    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
      <button
        onclick={() => goto(base + `/journal/new?edit=${journal?.id}`)}
        style="
          padding: 7px 12px; border-radius: 6px; font-size: 11px; font-weight: 600;
          background: var(--accent-glow); border: 1px solid var(--accent); color: var(--accent2);
          cursor: pointer; font-family: inherit;
        "
      >✏️ Modifier</button>
      <button
        onclick={() => goto(base + `/journal/${journal?.id}/print`)}
        style="
          padding: 7px 12px; border-radius: 6px; font-size: 11px; font-weight: 600;
          background: var(--card2); border: 1px solid var(--border); color: var(--text2);
          cursor: pointer; font-family: inherit;
        "
      >👁️ Aperçu</button>
      {#if journal.statut === 'brouillon'}
        <button
          onclick={markComplete}
          style="
            padding: 7px 12px; border-radius: 6px; font-size: 11px; font-weight: 600;
            background: var(--green-dim); border: 1px solid var(--green); color: var(--green);
            cursor: pointer; font-family: inherit;
          "
        >✅ Compléter</button>
      {/if}
      <button
        onclick={confirmDelete}
        disabled={deleting}
        style="
          padding: 7px 12px; border-radius: 6px; font-size: 11px; font-weight: 600;
          background: var(--red-dim); border: 1px solid var(--red); color: var(--red);
          cursor: pointer; font-family: inherit;
        "
      >🗑️</button>
    </div>

    <!-- Tab bar -->
    <div style="display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none;">
      {#each tabs as tab, i}
        <button
          onclick={() => activeTab = i}
          style="
            flex-shrink: 0; padding: 7px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
            cursor: pointer; border: 1px solid {activeTab === i ? 'var(--accent)' : 'var(--border)'};
            background: {activeTab === i ? 'var(--accent-glow)' : 'var(--card2)'};
            color: {activeTab === i ? 'var(--accent2)' : 'var(--text3)'};
            white-space: nowrap; font-family: inherit;
          "
        >{tab}</button>
      {/each}
    </div>
  </div>

  <!-- ════════════════════════════════════════════════════════════════════════
       TAB 1 — Journal de tir
       ════════════════════════════════════════════════════════════════════════ -->
  {#if activeTab === 0}
  <div style="padding: 14px 12px 0;">

    <!-- Reference -->
    <div style="
      font-size: 10px; color: var(--text3); text-align: center;
      background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 6px 10px; margin-bottom: 14px;
    ">
      Annexe 2.2 Journal de tir (art. 4.7.10.) du Code de sécurité pour les travaux de construction
    </div>

    <!-- En-tête -->
    <div class="card">
      <div style="padding: 8px 12px 4px; font-size: 10px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border);">En-tête</div>
      <div class="card-body" style="padding: 10px 12px;">
        {#each [
          ['Nom de l\'entreprise', journal.nom_entreprise],
          ['Adresse', journal.adresse_entreprise],
          ['Localisation du chantier', journal.localisation_chantier],
          ['Donneur d\'ouvrage', journal.donneur_ouvrage],
        ] as [lbl, val]}
          <div style="display: flex; padding: 6px 0; border-bottom: 1px solid var(--border);">
            <div style="width: 45%; font-size: 11px; color: var(--text3); font-weight: 600;">{lbl}</div>
            <div style="flex: 1; font-size: 13px; color: var(--text);">{val || '—'}</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Information sur le sautage -->
    <div class="card">
      <div style="padding: 8px 12px 4px; font-size: 10px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border);">Information sur le sautage</div>
      <div class="card-body" style="padding: 10px 12px;">
        {#each [
          ['Localisation / chaînage', journal.localisation_chainage],
          ['Date', formatDate(journal.date_tir)],
          ['Heure', journal.heure_tir],
          ['Nb volées quotidiennes', journal.nb_volees_quotidiennes],
        ] as [lbl, val]}
          <div style="display: flex; padding: 6px 0; border-bottom: 1px solid var(--border);">
            <div style="width: 45%; font-size: 11px; color: var(--text3); font-weight: 600;">{lbl}</div>
            <div style="flex: 1; font-size: 13px; color: var(--text);">{val || '—'}</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Conditions climatiques -->
    <div class="card">
      <div style="padding: 8px 12px 4px; font-size: 10px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border);">Conditions climatiques</div>
      <div class="card-body" style="padding: 10px 12px;">
        <div style="display: flex; padding: 6px 0; border-bottom: 1px solid var(--border);">
          <div style="width: 45%; font-size: 11px; color: var(--text3); font-weight: 600;">Température</div>
          <div style="flex: 1; font-size: 13px; color: var(--text);">{journal.temperature ? `${journal.temperature}°C` : '—'}</div>
        </div>
        <div style="display: flex; gap: 8px; padding: 8px 0; border-bottom: 1px solid var(--border); flex-wrap: wrap;">
          {#each [
            { val: journal.meteo_ensoleille, lbl: 'Ensoleillé ☀️' },
            { val: journal.meteo_nuageux, lbl: 'Nuageux ⛅' },
            { val: journal.meteo_pluie, lbl: 'Pluie 🌧️' },
            { val: journal.meteo_neige, lbl: 'Neige ❄️' },
          ] as m}
            <span style="
              padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
              background: {m.val ? 'var(--accent-glow)' : 'var(--card2)'};
              border: 1px solid {m.val ? 'var(--accent)' : 'var(--border)'};
              color: {m.val ? 'var(--accent2)' : 'var(--text3)'};
            ">
              {#if m.val}☑{:else}☐{/if} {m.lbl}
            </span>
          {/each}
        </div>
        <div style="display: flex; padding: 6px 0;">
          <div style="width: 45%; font-size: 11px; color: var(--text3); font-weight: 600;">Vents</div>
          <div style="flex: 1; font-size: 13px; color: var(--text);">{journal.vent_direction_vitesse || '—'}</div>
        </div>
      </div>
    </div>

    <!-- Données sur le forage -->
    <div class="card">
      <div style="padding: 8px 12px 4px; font-size: 10px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border);">Données sur le forage</div>
      <div class="card-body" style="padding: 10px 12px;">
        {#each [
          ['Nombre de trous', journal.nb_trous],
          ['Diamètre de forage', journal.diametre_forage ? `${journal.diametre_forage} mm` : '—'],
          ['Fardeau', journal.fardeau ? `${journal.fardeau} m` : '—'],
          ['Espacement', journal.espacement ? `${journal.espacement} m` : '—'],
          ['Profondeur moy./rangée', journal.profondeur_moy_rangee ? `${journal.profondeur_moy_rangee} m` : '—'],
          ['Hauteur du collet', journal.hauteur_collet ? `${journal.hauteur_collet} m` : '—'],
          ['Nature de la bourre', [journal.nature_bourre_pierre_nette && 'pierre nette', journal.nature_bourre_concassee && 'concassée'].filter(Boolean).join(', ') || '—'],
          ['Hauteur mort terrain', journal.hauteur_mort_terrain ? `${journal.hauteur_mort_terrain} m` : '—'],
        ] as [lbl, val]}
          <div style="display: flex; padding: 6px 0; border-bottom: 1px solid var(--border);">
            <div style="width: 45%; font-size: 11px; color: var(--text3); font-weight: 600;">{lbl}</div>
            <div style="flex: 1; font-size: 13px; color: var(--text);">{val || '—'}</div>
          </div>
        {/each}
        {#if journal.vibrations_valeur_respecter || journal.vibrations_valeur_obtenue}
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border);">
            <div style="font-size: 10px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px;">Vibrations</div>
            {#each [
              ['Valeur à respecter', journal.vibrations_valeur_respecter],
              ['Valeur obtenue', journal.vibrations_valeur_obtenue],
              ['Sismographes', journal.vibrations_sismographes],
            ] as [lbl, val]}
              {#if val}
                <div style="display: flex; padding: 5px 0;">
                  <div style="width: 45%; font-size: 11px; color: var(--text3);">{lbl}</div>
                  <div style="flex: 1; font-size: 12px; color: var(--text);">{val}</div>
                </div>
              {/if}
            {/each}
          </div>
        {/if}
        {#if journal.nb_trous_predecoupage}
          <div style="display: flex; padding: 6px 0; border-top: 1px solid var(--border);">
            <div style="width: 45%; font-size: 11px; color: var(--text3); font-weight: 600;">Trous pré-découpage</div>
            <div style="flex: 1; font-size: 13px; color: var(--text);">{journal.nb_trous_predecoupage}</div>
          </div>
        {/if}
        {#if journal.type_pare_eclats}
          <div style="padding-top: 6px; border-top: 1px solid var(--border);">
            <div style="font-size: 10px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 4px;">Pare-éclats</div>
            <div style="font-size: 12px; color: var(--text);">{journal.type_pare_eclats} · {journal.pare_eclats_dimension || ''} · {journal.pare_eclats_nombre || ''}</div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Distance des structures -->
    {#if journal.dist_batiment || journal.dist_pont || journal.dist_route || journal.dist_ligne_electrique || journal.dist_structure_souterraine}
    <div class="card">
      <div style="padding: 8px 12px 4px; font-size: 10px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border);">Distance des structures (m)</div>
      <div class="card-body" style="padding: 10px 12px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          {#each [
            ['Bâtiment', journal.dist_batiment],
            ['Pont', journal.dist_pont],
            ['Route', journal.dist_route],
            ['Ligne élec.', journal.dist_ligne_electrique],
            ['Sous-terr.', journal.dist_structure_souterraine],
          ] as [lbl, val]}
            {#if val}
              <div style="
                background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
                padding: 8px 10px; text-align: center;
              ">
                <div style="font-size: 18px; font-weight: 800; color: var(--accent2);">{val}</div>
                <div style="font-size: 10px; color: var(--text3);">{lbl} (m)</div>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    </div>
    {/if}

    <!-- Explosifs -->
    <div class="card">
      <div style="padding: 8px 12px 4px; font-size: 10px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border);">Explosifs</div>
      <div class="card-body" style="padding: 10px 12px;">
        {#each [
          ['Type de détonateurs', journal.type_detonateurs],
          ['Nombre de détonateurs', journal.nb_detonateurs],
          ['Quantité d\'explosifs', journal.quantite_explosifs],
          ['Type d\'émulsion pompée', journal.type_emulsion_pompee],
          ['Volume de roc', journal.volume_roc_m3 ? `${journal.volume_roc_m3} m³` : '—'],
          ['Facteur de chargement', journal.facteur_chargement ? `${journal.facteur_chargement} kg/m³` : '—'],
        ] as [lbl, val]}
          {#if val}
          <div style="display: flex; padding: 6px 0; border-bottom: 1px solid var(--border);">
            <div style="width: 45%; font-size: 11px; color: var(--text3); font-weight: 600;">{lbl}</div>
            <div style="flex: 1; font-size: 13px; color: var(--text);">{val}</div>
          </div>
          {/if}
        {/each}
      </div>
    </div>

    <!-- Recommandations -->
    <div class="card">
      <div style="padding: 8px 12px 4px; font-size: 10px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border);">Recommandations</div>
      <div class="card-body" style="padding: 10px 12px;">
        {#each [
          { lbl: 'Caméra vidéo', val: journal.camera_video, inv: false },
          { lbl: 'Écaillage de sécurité', val: journal.ecaillage_securite, inv: false },
          { lbl: 'Détecteur CO (BNQ)', val: journal.detecteur_co_bnq, inv: false },
        ] as item}
          <div style="display: flex; padding: 6px 0; border-bottom: 1px solid var(--border); align-items: center;">
            <div style="width: 55%; font-size: 12px; color: var(--text3); font-weight: 600;">{item.lbl}</div>
            <div style="flex: 1; font-size: 13px; {yesNoBadge(item.val, item.inv)}">{yesNo(item.val)}</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Résultats -->
    <div class="card">
      <div style="padding: 8px 12px 4px; font-size: 10px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border);">Résultat du sautage</div>
      <div class="card-body" style="padding: 10px 12px;">
        {#if journal.concentration_co_ppm}
          <div style="display: flex; padding: 6px 0; border-bottom: 1px solid var(--border);">
            <div style="width: 45%; font-size: 11px; color: var(--text3); font-weight: 600;">Concentration CO</div>
            <div style="flex: 1; font-size: 13px; color: var(--text);">{journal.concentration_co_ppm}</div>
          </div>
        {/if}
        {#each [
          { lbl: 'Fracturation exigée', val: journal.fracturation_exigee, inv: false },
          { lbl: 'Bris hors profil', val: journal.bris_hors_profil, inv: true },
          { lbl: 'Trous ratés / canon', val: journal.trous_rates, inv: true },
          { lbl: 'Projection', val: journal.projection, inv: true },
        ] as item}
          <div style="display: flex; padding: 6px 0; border-bottom: 1px solid var(--border); align-items: center;">
            <div style="width: 55%; font-size: 12px; color: var(--text3); font-weight: 600;">{item.lbl}</div>
            <div style="flex: 1; font-size: 13px; {yesNoBadge(item.val, item.inv)}">{yesNo(item.val)}</div>
          </div>
        {/each}
        {#if journal.projection === true && journal.projection_details}
          <div style="margin-top: 8px; padding: 8px 10px; background: var(--red-dim); border-radius: var(--radius-sm); font-size: 12px; color: var(--text2);">
            <strong style="color: var(--red);">⚠️ Projection:</strong> {journal.projection_details}
          </div>
        {/if}
        {#if journal.description_dommages}
          <div style="margin-top: 6px; padding: 8px 10px; background: var(--red-dim); border-radius: var(--radius-sm); font-size: 12px; color: var(--text2);">
            <strong style="color: var(--red);">Dommages:</strong> {journal.description_dommages}
          </div>
        {/if}
      </div>
    </div>

    {#if journal.remarques}
    <div class="card">
      <div style="padding: 8px 12px 4px; font-size: 10px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border);">Remarques</div>
      <div style="padding: 10px 12px; font-size: 13px; color: var(--text); line-height: 1.6; white-space: pre-wrap;">{journal.remarques}</div>
    </div>
    {/if}

    <!-- Boutefeu footer -->
    <div class="card">
      <div style="padding: 8px 12px 4px; font-size: 10px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border);">Boutefeu</div>
      <div class="card-body" style="padding: 10px 12px;">
        <div style="font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 6px;">
          {journal.boutefeu_prenom} {journal.boutefeu_nom}
        </div>
        <div style="font-size: 12px; color: var(--text3);">
          Cert. CSTC: {journal.boutefeu_certificat || '—'} · Permis SQ: {journal.boutefeu_permis_sq || '—'}
        </div>
        <div style="
          margin-top: 10px; padding: 8px 10px;
          background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
          font-size: 10px; color: var(--text3); line-height: 1.5;
        ">
          📌 L'employeur doit conserver le journal de tir pendant une durée de 3 ans à compter de la date de la dernière intervention au chantier.
        </div>
      </div>
    </div>

  </div>
  {/if}

  <!-- ════════════════════════════════════════════════════════════════════════
       TAB 2 — Plan de tir
       ════════════════════════════════════════════════════════════════════════ -->
  {#if activeTab === 1}
  <div style="padding: 14px 12px 0;">

    <div style="font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 12px;">
      Plan de tir — Registre de forage (tel que réalisé)
    </div>

    <!-- 5 items -->
    {#each [
      { num: '1', lbl: 'Nombre et orientation des faces libres', val: journal.plan_faces_libres },
      { num: '2', lbl: 'Direction du tir', val: journal.plan_direction_tir },
      { num: '3', lbl: 'Identification de la séquence de tir (incluant les délais)', val: journal.plan_sequence_identification },
      { num: '4', lbl: 'Positionnement des structures les plus près (distance en mètre)', val: journal.plan_structures_distance },
      { num: '5', lbl: "Zone de tir et distances en mètre", val: journal.plan_zone_tir },
    ] as item}
      <div style="
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-sm);
        padding: 10px 12px; margin-bottom: 8px;
        display: flex; gap: 10px; align-items: flex-start;
      ">
        <div style="
          width: 22px; height: 22px; border-radius: 50%; background: var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; color: #fff; flex-shrink: 0;
        ">{item.num}</div>
        <div style="flex: 1;">
          <div style="font-size: 11px; font-weight: 600; color: var(--text3); margin-bottom: 4px;">{item.lbl}</div>
          <div style="font-size: 13px; color: var(--text); white-space: pre-wrap;">{item.val || '—'}</div>
        </div>
      </div>
    {/each}

    <!-- Drill Pattern / Drawing -->
    {#if journal.drill_holes && journal.drill_holes.length > 0}
      <div class="card" style="margin-top: 12px;">
        <div style="padding: 8px 12px 4px; font-size: 10px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border);">Patron de forage</div>
        <div style="padding: 10px 12px;">
          <DrillPatternEditor
            holes={journal.drill_holes}
            connections={journal.drill_connections ?? []}
            dataurl={journal.patron_forage_dataurl}
            readonly={true}
          />
        </div>
      </div>
    {:else if journal.patron_forage_dataurl}
      <div class="card" style="margin-top: 12px;">
        <div style="padding: 8px 12px 4px; font-size: 10px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border);">Patron de forage (dessin)</div>
        <div style="padding: 10px 12px;">
          <img
            src={journal.patron_forage_dataurl}
            alt="Patron de forage"
            style="width: 100%; border-radius: 6px; border: 1px solid var(--border);"
          >
        </div>
      </div>
    {:else}
      <div style="text-align: center; padding: 24px; color: var(--text3); font-size: 13px;">
        Aucun patron de forage
      </div>
    {/if}

  </div>
  {/if}

  <!-- ════════════════════════════════════════════════════════════════════════
       TAB 3 — Profil de tir
       ════════════════════════════════════════════════════════════════════════ -->
  {#if activeTab === 2}
  <div style="padding: 14px 12px 0;">

    <div style="font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 12px;">
      Profil de tir — Vue en élévation du sautage par tir
    </div>

    <!-- 3 info required -->
    {#each [
      { num: '1', lbl: 'Description des explosifs par trou', val: journal.profil_description_explosifs },
      { num: '2', lbl: 'Description des agents de sautage (poids/trou kg)', val: journal.profil_agents_sautage },
      { num: '3', lbl: 'Raccordements / délai milliseconde', val: journal.profil_raccordements_delais },
    ] as item}
      <div style="
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-sm);
        padding: 10px 12px; margin-bottom: 8px;
        display: flex; gap: 10px; align-items: flex-start;
      ">
        <div style="
          width: 22px; height: 22px; border-radius: 50%; background: var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; color: #fff; flex-shrink: 0;
        ">{item.num}</div>
        <div style="flex: 1;">
          <div style="font-size: 11px; font-weight: 600; color: var(--text3); margin-bottom: 4px;">{item.lbl}</div>
          <div style="font-size: 13px; color: var(--text); white-space: pre-wrap;">{item.val || '—'}</div>
        </div>
      </div>
    {/each}

    <!-- 6 schemas -->
    {#if journal.schemas && journal.schemas.length > 0}
      <div style="margin-top: 12px; margin-bottom: 6px; font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px;">
        Schémas de sautage
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
        {#each journal.schemas as _schema, i}
          {#if journal.schemas[i].chargement_type || journal.schemas[i].profondeur_sol_roc || journal.schemas[i].trous_de}
            <BoreholeDiagram bind:schema={journal.schemas[i]} index={i} readonly={true} />
          {/if}
        {/each}
        {#if !journal.schemas.some(s => s.chargement_type || s.profondeur_sol_roc || s.trous_de)}
          <div style="text-align: center; padding: 24px; color: var(--text3); font-size: 13px;">
            Aucun schéma rempli
          </div>
        {/if}
      </div>
    {/if}

  </div>
  {/if}

</div>
{/if}

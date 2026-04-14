<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { getJournal, type JournalTir, type SchemaForage } from '$lib/db';

  let journal = $state<JournalTir | null>(null);
  let loading = $state(true);

  const id = $derived(parseInt($page.params.id));

  onMount(async () => {
    const j = await getJournal(id);
    if (j) {
      journal = j;
    } else {
      goto(base + '/historique');
    }
    loading = false;
  });

  function yesNo(val: boolean | null | undefined): string {
    if (val === true) return 'Oui ☑';
    if (val === false) return 'Non ☑';
    return '☐ Oui  ☐ Non';
  }

  function formatDate(d: string) {
    if (!d) return '—';
    try {
      const [y, m, day] = d.split('-');
      return `${day} / ${m} / ${y}`;
    } catch { return d; }
  }

  // Build drill pattern canvas data URL from holes data
  function getDrillPatternDataUrl(): string {
    if (journal?.patron_forage_dataurl) return journal.patron_forage_dataurl;
    return '';
  }

  // Render drill pattern to canvas for print (light theme)
  function renderDrillPatternLight(canvasEl: HTMLCanvasElement, j: JournalTir) {
    if (!canvasEl || !j.drill_holes || j.drill_holes.length === 0) return;

    const w = canvasEl.width;
    const h = canvasEl.height;
    const ctx = canvasEl.getContext('2d')!;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    // Light grid
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 0.5;
    const GRID = 24;
    for (let x = 0; x <= w; x += GRID) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += GRID) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Connections
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(80,100,200,0.4)';
    ctx.lineWidth = 1.5;
    for (const conn of (j.drill_connections ?? [])) {
      const from = j.drill_holes!.find(hh => hh.id === conn.from);
      const to = j.drill_holes!.find(hh => hh.id === conn.to);
      if (from && to) {
        ctx.beginPath();
        ctx.moveTo(from.x * w, from.y * h);
        ctx.lineTo(to.x * w, to.y * h);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    const HOLE_R = 18;
    for (const hole of j.drill_holes!) {
      const px = hole.x * w;
      const py = hole.y * h;

      ctx.beginPath();
      ctx.arc(px, py, HOLE_R, 0, Math.PI * 2);
      ctx.fillStyle = '#4f6ef7';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${hole.label.length > 2 ? '11' : '13'}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hole.label, px, py);

      if (hole.delay_ms >= 0) {
        ctx.fillStyle = 'rgba(30,30,100,0.8)';
        ctx.font = 'bold 10px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`${hole.delay_ms}ms`, px, py + HOLE_R + 3);
      }
    }
    ctx.textBaseline = 'alphabetic';
  }

  let drillCanvasEl = $state<HTMLCanvasElement | null>(null);

  $effect(() => {
    if (drillCanvasEl && journal && journal.drill_holes && journal.drill_holes.length > 0) {
      renderDrillPatternLight(drillCanvasEl, journal);
    }
  });
</script>

<svelte:head>
  <title>Aperçu — Journal de tir {journal?.numero_tir || ''}</title>
</svelte:head>

{#if loading}
  <div style="padding: 40px; text-align: center; color: #666;">Chargement...</div>
{:else if journal}
<div class="print-container">

  <!-- Print action bar (hidden when printing) -->
  <div class="no-print action-bar">
    <button onclick={() => window.print()} class="btn-print">
      🖨️ Imprimer
    </button>
    <button onclick={() => goto(base + `/journal/new?edit=${journal?.id}`)} class="btn-back">
      ✏️ Modifier
    </button>
    <button onclick={() => goto(base + `/journal/${journal?.id}`)} class="btn-back">
      ← Retour
    </button>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════════
       PAGE 1 — Journal de tir par sautage
       ═══════════════════════════════════════════════════════════════════════ -->
  <div class="print-page">

    <!-- Title -->
    <div class="page-title-block">
      <div class="page-title">JOURNAL DE TIR PAR SAUTAGE</div>
      <div class="page-subtitle">Annexe 2.2 Journal de tir (art. 4.7.10.) du Code de sécurité pour les travaux de construction</div>
    </div>

    <!-- En-tête -->
    <table class="data-table">
      <tbody>
        <tr>
          <td class="label-cell">Nom de l'entreprise</td>
          <td>{journal.nom_entreprise || ''}</td>
        </tr>
        <tr>
          <td class="label-cell">Adresse</td>
          <td>{journal.adresse_entreprise || ''}</td>
        </tr>
        <tr>
          <td class="label-cell">Localisation du chantier</td>
          <td>{journal.localisation_chantier || ''}</td>
        </tr>
        <tr>
          <td class="label-cell">Donneur d'ouvrage</td>
          <td>{journal.donneur_ouvrage || ''}</td>
        </tr>
      </tbody>
    </table>

    <!-- Information sur le sautage -->
    <div class="section-header">INFORMATION SUR LE SAUTAGE À L'EXPLOSIF</div>
    <table class="data-table">
      <tbody>
        <tr>
          <td class="label-cell">Localisation / chaînage</td>
          <td colspan="3">{journal.localisation_chainage || ''}</td>
        </tr>
        <tr>
          <td class="label-cell">Date (jour/mois/an)</td>
          <td>{formatDate(journal.date_tir)}</td>
          <td class="label-cell">Heure</td>
          <td>{journal.heure_tir || ''}</td>
        </tr>
        <tr>
          <td class="label-cell">Nb volées quotidiennes</td>
          <td colspan="3">{journal.nb_volees_quotidiennes || ''}</td>
        </tr>
      </tbody>
    </table>

    <!-- Conditions climatiques -->
    <div class="section-header">CONDITIONS CLIMATIQUES</div>
    <table class="data-table">
      <tbody>
        <tr>
          <td class="label-cell">Température (°C)</td>
          <td>{journal.temperature || ''}</td>
          <td style="width: 45%;">
            {journal.meteo_ensoleille ? '☑' : '☐'} Ensoleillé &nbsp;
            {journal.meteo_nuageux ? '☑' : '☐'} Nuageux &nbsp;
            {journal.meteo_pluie ? '☑' : '☐'} Pluie &nbsp;
            {journal.meteo_neige ? '☑' : '☐'} Neige
          </td>
        </tr>
        <tr>
          <td class="label-cell">Direction et vitesse des vents</td>
          <td colspan="2">{journal.vent_direction_vitesse || ''}</td>
        </tr>
      </tbody>
    </table>

    <!-- Données sur le forage -->
    <div class="section-header">DONNÉES SUR LE FORAGE</div>
    <table class="data-table">
      <tbody>
        <tr>
          <td class="label-cell">Nb trous et diamètre</td>
          <td>{journal.nb_trous || ''} trous · {journal.diametre_forage || ''} mm</td>
        </tr>
        <tr>
          <td class="label-cell">Fardeau / Espacement</td>
          <td>{journal.fardeau || ''} m / {journal.espacement || ''} m</td>
        </tr>
        <tr>
          <td class="label-cell">Profondeur moy. par rangée</td>
          <td>{journal.profondeur_moy_rangee || ''} m</td>
        </tr>
        <tr>
          <td class="label-cell">Hauteur collet / Nature bourre</td>
          <td>
            {journal.hauteur_collet || ''} m &nbsp;
            {journal.nature_bourre_pierre_nette ? '☑' : '☐'} pierre nette &nbsp;
            {journal.nature_bourre_concassee ? '☑' : '☐'} concassée
          </td>
        </tr>
        <tr>
          <td class="label-cell">Hauteur mort terrain</td>
          <td>{journal.hauteur_mort_terrain || ''} m</td>
        </tr>
        <tr>
          <td class="label-cell">Vibrations — valeur à respecter</td>
          <td>{journal.vibrations_valeur_respecter || ''}</td>
        </tr>
        <tr>
          <td class="label-cell">Vibrations — valeur obtenue</td>
          <td>{journal.vibrations_valeur_obtenue || ''}</td>
        </tr>
        <tr>
          <td class="label-cell">Emplacement sismographes</td>
          <td>{journal.vibrations_sismographes || ''}</td>
        </tr>
        {#if journal.nb_trous_predecoupage}
        <tr>
          <td class="label-cell">Nb trous pré-découpage</td>
          <td>{journal.nb_trous_predecoupage}</td>
        </tr>
        {/if}
        {#if journal.type_pare_eclats}
        <tr>
          <td class="label-cell">Pare-éclats</td>
          <td>{journal.type_pare_eclats} · {journal.pare_eclats_dimension || ''} · {journal.pare_eclats_nombre || ''}</td>
        </tr>
        {/if}
      </tbody>
    </table>

    <!-- Distance structures -->
    <div class="section-header">DISTANCE DES STRUCTURES LES PLUS PRÈS (EN MÈTRE)</div>
    <table class="data-table">
      <tbody>
        <tr>
          {#each ['Bâtiment', 'Pont', 'Route', 'Ligne élec.', 'Sous-terr.'] as lbl}
            <td class="label-cell" style="text-align: center; font-size: 9pt;">{lbl}</td>
          {/each}
        </tr>
        <tr>
          {#each [journal.dist_batiment, journal.dist_pont, journal.dist_route, journal.dist_ligne_electrique, journal.dist_structure_souterraine] as val}
            <td style="text-align: center;">{val || ''}</td>
          {/each}
        </tr>
      </tbody>
    </table>

    <!-- Explosifs -->
    <div class="section-header">EXPLOSIFS (RÉF.: COLONNE DE CHARGE)</div>
    <table class="data-table">
      <tbody>
        <tr>
          <td class="label-cell">Type de détonateurs</td>
          <td>{journal.type_detonateurs || ''}</td>
          <td class="label-cell" style="width: 20%;">Nb détonateurs</td>
          <td>{journal.nb_detonateurs || ''}</td>
        </tr>
        <tr>
          <td class="label-cell">Quantité d'explosifs</td>
          <td colspan="3">{journal.quantite_explosifs || ''}</td>
        </tr>
        <tr>
          <td class="label-cell">Type émulsion pompée</td>
          <td>{journal.type_emulsion_pompee || ''}</td>
          <td class="label-cell">Volume roc / Facteur</td>
          <td>{journal.volume_roc_m3 || ''} m³ / {journal.facteur_chargement || ''} kg/m³</td>
        </tr>
      </tbody>
    </table>

    <!-- Recommandations -->
    <div class="section-header">RECOMMANDATIONS (BONNES PRATIQUES)</div>
    <table class="data-table">
      <tbody>
        <tr>
          <td style="width: 55%;">Caméra vidéo</td>
          <td>{yesNo(journal.camera_video)}</td>
        </tr>
        <tr>
          <td>Écaillage de sécurité</td>
          <td>{yesNo(journal.ecaillage_securite)}</td>
        </tr>
        <tr>
          <td>Détecteur résidentiel de CO selon la norme BNQ</td>
          <td>{yesNo(journal.detecteur_co_bnq)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Résultats -->
    <div class="section-header">RÉSULTAT DU SAUTAGE</div>
    <table class="data-table">
      <tbody>
        <tr>
          <td style="width: 55%;">Concentration max. de CO</td>
          <td>{journal.concentration_co_ppm || ''}</td>
        </tr>
        <tr>
          <td>Fracturation telle qu'exigée</td>
          <td>{yesNo(journal.fracturation_exigee)}</td>
        </tr>
        <tr>
          <td>Bris hors profil</td>
          <td>{yesNo(journal.bris_hors_profil)}</td>
        </tr>
        <tr>
          <td>Trous ratés / canon / fond de trou</td>
          <td>{yesNo(journal.trous_rates)}</td>
        </tr>
        <tr>
          <td>Projection</td>
          <td>
            {yesNo(journal.projection)}
            {#if journal.projection === true}
              {#if journal.projection_details} — {journal.projection_details}{/if}
            {/if}
          </td>
        </tr>
        {#if journal.description_dommages}
        <tr>
          <td>Description des dommages</td>
          <td>{journal.description_dommages}</td>
        </tr>
        {/if}
      </tbody>
    </table>

    <!-- Remarques -->
    <div class="section-header">REMARQUES</div>
    <div style="border: 1px solid #999; border-top: none; padding: 6px; min-height: 50px; font-size: 10pt;">
      {journal.remarques || ''}
    </div>

    <!-- Signature -->
    <div style="margin-top: 16px; border: 1px solid #999; padding: 10px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 10pt;"><tbody>
        <tr>
          <td style="width: 50%; padding-right: 20px;">
            <div style="font-weight: bold; margin-bottom: 4px;">Nom du boutefeu:</div>
            <div>{journal.boutefeu_prenom || ''} {journal.boutefeu_nom || ''}</div>
            <div style="font-size: 9pt; color: #555;">Cert. CSTC: {journal.boutefeu_certificat || '—'} · Permis SQ: {journal.boutefeu_permis_sq || '—'}</div>
          </td>
          <td style="width: 50%;">
            <div style="font-weight: bold; margin-bottom: 4px;">Signature:</div>
            <div style="height: 40px; border-bottom: 1px solid #000;"></div>
          </td>
        </tr>
      </tbody></table>
    </div>

    <!-- Legal note -->
    <div style="margin-top: 10px; font-size: 8pt; color: #555; border-top: 1px solid #ccc; padding-top: 6px;">
      L'employeur doit conserver le journal de tir pendant une durée de 3 ans à compter de la date de la dernière intervention au chantier.
    </div>

  </div><!-- end page 1 -->

  <!-- ═══════════════════════════════════════════════════════════════════════
       PAGE 2 — Plan de tir
       ═══════════════════════════════════════════════════════════════════════ -->
  <div class="print-page page-break-before">

    <!-- Page 2 header -->
    <div class="page-title-block">
      <div class="page-title">PLAN DE TIR — REGISTRE DE FORAGE (TEL QUE RÉALISÉ)</div>
      <div class="page-subtitle">Annexe 2.2 — Page 2 · {journal.numero_tir || ''} · {formatDate(journal.date_tir)}</div>
    </div>

    <!-- 5 required items -->
    <div class="section-header">5 ITEMS À DOCUMENTER SUR LE PLAN</div>
    <table class="data-table">
      <tbody>
        {#each [
          { num: '1', label: 'Nombre et orientation des faces libres', val: journal.plan_faces_libres },
          { num: '2', label: 'Direction du tir', val: journal.plan_direction_tir },
          { num: '3', label: 'Identification de la séquence de tir (incluant les délais)', val: journal.plan_sequence_identification },
          { num: '4', label: 'Positionnement des structures les plus près (distance en mètre)', val: journal.plan_structures_distance },
          { num: '5', label: "Zone de tir (ligne d'avertissement «délimitation de la zone de chargement») et distances en mètre", val: journal.plan_zone_tir },
        ] as item}
          <tr>
            <td class="label-cell" style="width: 5%; text-align: center; font-weight: bold;">{item.num}</td>
            <td class="label-cell" style="width: 35%;">{item.label}</td>
            <td style="white-space: pre-wrap;">{item.val || ''}</td>
          </tr>
        {/each}
      </tbody>
    </table>

    <!-- Drill pattern -->
    <div class="section-header" style="margin-top: 12px;">PATRON DE FORAGE</div>

    {#if journal.drill_holes && journal.drill_holes.length > 0}
      <!-- Render drill pattern on a canvas with light theme -->
      <div style="border: 1px solid #999; padding: 8px; margin-bottom: 8px; background: #fff;">
        <canvas
          bind:this={drillCanvasEl}
          width="720"
          height="480"
          style="width: 100%; display: block; border: 1px solid #eee;"
        ></canvas>
      </div>

      <!-- Hole table -->
      <table class="data-table" style="font-size: 9pt;">
        <thead>
          <tr style="background: #ddd;">
            <th style="border: 1px solid #999; padding: 3px 5px; text-align: center;">No</th>
            <th style="border: 1px solid #999; padding: 3px 5px; text-align: center;">Étiq.</th>
            <th style="border: 1px solid #999; padding: 3px 5px; text-align: center;">Délai (ms)</th>
            <th style="border: 1px solid #999; padding: 3px 5px; text-align: center;">Pos. X</th>
            <th style="border: 1px solid #999; padding: 3px 5px; text-align: center;">Pos. Y</th>
          </tr>
        </thead>
        <tbody>
          {#each journal.drill_holes as hole}
            <tr>
              <td style="border: 1px solid #999; padding: 3px 5px; text-align: center;">{hole.id}</td>
              <td style="border: 1px solid #999; padding: 3px 5px; text-align: center;">{hole.label}</td>
              <td style="border: 1px solid #999; padding: 3px 5px; text-align: center;">{hole.delay_ms} ms</td>
              <td style="border: 1px solid #999; padding: 3px 5px; text-align: center;">{Math.round(hole.x * 100)}%</td>
              <td style="border: 1px solid #999; padding: 3px 5px; text-align: center;">{Math.round(hole.y * 100)}%</td>
            </tr>
          {/each}
        </tbody>
      </table>

    {:else if journal.patron_forage_dataurl}
      <div style="border: 1px solid #999; padding: 8px; margin-bottom: 8px; background: #fff;">
        <img
          src={journal.patron_forage_dataurl}
          alt="Patron de forage"
          style="width: 100%; display: block;"
        >
      </div>
    {:else}
      <div style="border: 1px solid #ddd; padding: 20px; text-align: center; color: #999; font-size: 10pt; font-style: italic;">
        Aucun patron de forage enregistré
      </div>
    {/if}

    <!-- Signature / boutefeu footer for page 2 -->
    <div style="margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 10pt;"><tbody>
        <tr>
          <td style="width: 50%; padding-right: 20px;">
            <div style="font-weight: bold; margin-bottom: 4px;">Nom du boutefeu:</div>
            <div>{journal.boutefeu_prenom || ''} {journal.boutefeu_nom || ''}</div>
          </td>
          <td style="width: 50%;">
            <div style="font-weight: bold; margin-bottom: 4px;">Signature:</div>
            <div style="height: 30px; border-bottom: 1px solid #000;"></div>
          </td>
        </tr>
      </tbody></table>
    </div>

  </div><!-- end page 2 -->

  <!-- ═══════════════════════════════════════════════════════════════════════
       PAGE 3 — Profil de tir
       ═══════════════════════════════════════════════════════════════════════ -->
  <div class="print-page page-break-before">

    <!-- Page 3 header -->
    <div class="page-title-block">
      <div class="page-title">PROFIL DE TIR — VUE EN ÉLÉVATION DU SAUTAGE PAR TIR</div>
      <div class="page-subtitle">Annexe 2.2 — Page 3 · {journal.numero_tir || ''} · {formatDate(journal.date_tir)}</div>
    </div>

    <!-- 3 required items -->
    <div class="section-header">INFORMATIONS REQUISES</div>
    <table class="data-table">
      <tbody>
        {#each [
          { num: '1', label: 'Description des explosifs par trou (dimensions, nombre et poids)', val: journal.profil_description_explosifs },
          { num: '2', label: 'Description des agents de sautage (poids / trou en kg)', val: journal.profil_agents_sautage },
          { num: '3', label: 'Identification des raccordements / délai milliseconde (fond du trou et à la surface)', val: journal.profil_raccordements_delais },
        ] as item}
          <tr>
            <td class="label-cell" style="width: 5%; text-align: center; font-weight: bold;">{item.num}</td>
            <td class="label-cell" style="width: 35%;">{item.label}</td>
            <td style="white-space: pre-wrap;">{item.val || ''}</td>
          </tr>
        {/each}
      </tbody>
    </table>

    <!-- 6 borehole schemas -->
    <div class="section-header" style="margin-top: 12px;">SCHÉMAS DE SAUTAGE</div>
    <div style="font-size: 8pt; color: #666; margin-bottom: 10px; font-style: italic;">
      Disposition des trous de mine / Séquence de mise à feu
    </div>

    {#if journal.schemas && journal.schemas.length > 0}
      <div class="schemas-grid">
        {#each journal.schemas as schema, i}
          <div class="schema-box">
            <!-- Schema header -->
            <div class="schema-header">
              Schéma #{i + 1} — Disposition des trous de mine / Séquence de mise à feu
            </div>

            <div class="schema-body">
              <!-- Profondeur -->
              <div class="schema-field">
                <div class="schema-field-label">Profondeur des forages: SOL/ROC (incluant mort terrain)</div>
                <div class="schema-field-value">{schema.profondeur_sol_roc || '—'}</div>
              </div>

              <!-- Chargement-type -->
              <div class="schema-field">
                <div class="schema-field-label">Chargement-Type</div>
                <div class="schema-field-value">{schema.chargement_type || '—'}</div>
              </div>

              <!-- Borehole visual + labels -->
              <div class="schema-diagram-row">
                <!-- Left labels (couches) -->
                <div class="schema-couches">
                  {#if schema.couches}
                    {#each schema.couches.split('\n').filter((l: string) => l.trim()) as line}
                      <div class="schema-couche-line">• {line}</div>
                    {/each}
                  {/if}
                </div>

                <!-- Borehole diagram (print version — light) -->
                <div class="schema-borehole">
                  <div class="bh-label-top">SOL</div>
                  <div class="bh-roc-line"><span class="bh-roc-text">ROC</span></div>
                  <div class="bh-fond-line"><span class="bh-fond-text">FOND</span></div>
                  <div class="bh-center-line"></div>
                </div>
              </div>

              <!-- Front de taille -->
              <div class="schema-front-taille">— FRONT DE TAILLE —</div>

              <!-- Bourre -->
              <div class="schema-field">
                <div class="schema-field-label">Bourre / Espaceurs</div>
                <div class="schema-field-value">{schema.bourre || '—'}</div>
              </div>

              <!-- Explosifs -->
              <div class="schema-field">
                <div class="schema-field-label">Explosifs / Amorces</div>
                <div class="schema-field-value">{schema.explosifs_amorces || '—'}</div>
              </div>

              <!-- Footer: Trous n° -->
              <div class="schema-trous">
                <span class="schema-trous-label">Trous n°:</span>
                <span>{schema.trous_de || '___'}</span>
                <span> à </span>
                <span>{schema.trous_a || '___'}</span>
              </div>

            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div style="border: 1px solid #ddd; padding: 20px; text-align: center; color: #999; font-size: 10pt; font-style: italic;">
        Aucun schéma enregistré
      </div>
    {/if}

    <!-- Signature for page 3 -->
    <div style="margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 10pt;"><tbody>
        <tr>
          <td style="width: 50%; padding-right: 20px;">
            <div style="font-weight: bold; margin-bottom: 4px;">Nom du boutefeu:</div>
            <div>{journal.boutefeu_prenom || ''} {journal.boutefeu_nom || ''}</div>
            <div style="font-size: 9pt; color: #555;">Cert. CSTC: {journal.boutefeu_certificat || '—'} · Permis SQ: {journal.boutefeu_permis_sq || '—'}</div>
          </td>
          <td style="width: 50%;">
            <div style="font-weight: bold; margin-bottom: 4px;">Signature:</div>
            <div style="height: 40px; border-bottom: 1px solid #000;"></div>
          </td>
        </tr>
      </tbody></table>
    </div>

    <!-- Legal note -->
    <div style="margin-top: 10px; font-size: 8pt; color: #555; border-top: 1px solid #ccc; padding-top: 6px;">
      L'employeur doit conserver le journal de tir pendant une durée de 3 ans à compter de la date de la dernière intervention au chantier.
    </div>

  </div><!-- end page 3 -->

</div>
{/if}

<style>
  /* ── Global print styles ─────────────────────────────────────────────────── */
  .print-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
    font-size: 11pt;
    color: #000;
    background: #fff;
  }

  /* ── Action bar (no-print) ───────────────────────────────────────────────── */
  .action-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .btn-print {
    padding: 9px 18px;
    background: #4f6ef7;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
  }

  .btn-back {
    padding: 9px 18px;
    background: #eee;
    color: #333;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
  }

  /* ── Print page ──────────────────────────────────────────────────────────── */
  .print-page {
    background: #fff;
    color: #000;
  }

  .page-break-before {
    page-break-before: always;
    break-before: page;
    padding-top: 20px;
    border-top: 3px solid #000;
    margin-top: 40px;
  }

  /* ── Page title ──────────────────────────────────────────────────────────── */
  .page-title-block {
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 8px;
    margin-bottom: 12px;
  }

  .page-title {
    font-size: 14pt;
    font-weight: bold;
  }

  .page-subtitle {
    font-size: 9pt;
    color: #444;
  }

  /* ── Section headers ─────────────────────────────────────────────────────── */
  .section-header {
    font-weight: bold;
    font-size: 10pt;
    background: #ddd;
    padding: 4px 6px;
    border: 1px solid #999;
    margin-top: 8px;
  }

  /* ── Data table ──────────────────────────────────────────────────────────── */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 4px;
    font-size: 10pt;
  }

  .data-table td {
    border: 1px solid #999;
    padding: 4px 6px;
  }

  .label-cell {
    background: #f5f5f5;
    font-weight: bold;
    width: 30%;
  }

  .data-table th {
    border: 1px solid #999;
    padding: 4px 6px;
    background: #ddd;
    font-weight: bold;
    text-align: center;
  }

  /* ── Schemas grid ────────────────────────────────────────────────────────── */
  .schemas-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .schema-box {
    border: 1px solid #999;
    font-size: 9pt;
    break-inside: avoid;
  }

  .schema-header {
    background: #e8e8e8;
    border-bottom: 1px solid #999;
    padding: 4px 6px;
    font-size: 8pt;
    font-weight: bold;
    color: #333;
  }

  .schema-body {
    padding: 6px 8px;
  }

  .schema-field {
    margin-bottom: 5px;
  }

  .schema-field-label {
    font-size: 7.5pt;
    font-weight: bold;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 2px;
  }

  .schema-field-value {
    font-size: 9pt;
    color: #000;
    min-height: 14px;
  }

  .schema-front-taille {
    color: #cc2222;
    font-size: 8pt;
    font-weight: bold;
    text-align: center;
    margin: 4px 0;
  }

  .schema-trous {
    display: flex;
    align-items: center;
    gap: 4px;
    border-top: 1px solid #ccc;
    padding-top: 5px;
    margin-top: 5px;
    font-size: 8.5pt;
  }

  .schema-trous-label {
    font-weight: bold;
    color: #444;
  }

  /* ── Borehole diagram (print/light version) ─────────────────────────────── */
  .schema-diagram-row {
    display: flex;
    gap: 6px;
    margin: 6px 0;
  }

  .schema-couches {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100px;
    font-size: 8pt;
    color: #444;
  }

  .schema-couche-line {
    padding: 1px 0;
  }

  .schema-borehole {
    width: 44px;
    flex-shrink: 0;
    border: 1.5px solid #666;
    border-top: none;
    border-radius: 0 0 3px 3px;
    min-height: 100px;
    position: relative;
    background: linear-gradient(to bottom, #e8f0ff 0%, #e0eaff 30%, #fff3e0 70%, #ffeedd 100%);
    overflow: hidden;
  }

  .bh-label-top {
    position: absolute;
    top: 0; left: 0; right: 0;
    text-align: center;
    font-size: 7pt;
    font-weight: bold;
    color: #555;
    padding: 2px 0;
    border-bottom: 1px dashed #aaa;
    background: rgba(255,255,255,0.6);
    text-transform: uppercase;
  }

  .bh-roc-line {
    position: absolute;
    left: 0; right: 0; top: 30%;
    border-top: 1px solid rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bh-roc-text {
    font-size: 7pt;
    color: #555;
    background: #fff;
    padding: 0 2px;
  }

  .bh-fond-line {
    position: absolute;
    left: 0; right: 0; top: 80%;
    border-top: 2px solid rgba(200,50,50,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bh-fond-text {
    font-size: 7pt;
    font-weight: bold;
    color: #cc2222;
    background: #fff;
    padding: 0 2px;
  }

  .bh-center-line {
    position: absolute;
    left: 50%; top: 0; bottom: 0;
    width: 1.5px;
    background: linear-gradient(to bottom, #4f6ef7 0%, #4f6ef7 78%, #cc2222 78%, #cc2222 100%);
    transform: translateX(-50%);
    opacity: 0.5;
  }

  /* ── Print media ─────────────────────────────────────────────────────────── */
  :global(body.printing) {
    background: white !important;
  }

  @media print {
    .no-print {
      display: none !important;
    }

    .print-container {
      max-width: none;
      padding: 0;
      margin: 0;
    }

    .print-page {
      padding: 15mm;
    }

    .page-break-before {
      margin-top: 0;
      padding-top: 15mm;
      border-top: none;
    }

    .schemas-grid {
      grid-template-columns: 1fr 1fr;
    }

    .btn-print, .btn-back {
      display: none;
    }
  }

  /* ── Screen preview styling ──────────────────────────────────────────────── */
  @media screen {
    .print-container {
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .page-break-before {
      background: #fafafa;
      border-radius: 0 0 4px 4px;
    }
  }
</style>

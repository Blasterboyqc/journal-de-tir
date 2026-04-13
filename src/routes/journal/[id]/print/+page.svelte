<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { getJournal, type JournalTir } from '$lib/db';
  import BlastPatternCanvas from '$lib/components/BlastPatternCanvas.svelte';

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

  function fmt(v: string | undefined | null, fallback = '—') {
    return v?.trim() || fallback;
  }

  function fmtBool(v: string | undefined | null): string {
    if (v === 'Oui' || v === 'oui') return '☑ Oui  ☐ Non';
    if (v === 'Non' || v === 'non') return '☐ Oui  ☑ Non';
    return '☐ Oui  ☐ Non';
  }

  function printPage() {
    window.print();
  }
</script>

<svelte:head>
  <title>Journal de tir — {journal?.numero_tir ?? ''} — Impression</title>
  <style>
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; color: black !important; }
      .print-page { box-shadow: none !important; margin: 0 !important; border: none !important; }
    }
    @page {
      size: letter portrait;
      margin: 15mm 12mm;
    }
  </style>
</svelte:head>

<!-- Toolbar (no-print) -->
<div class="no-print" style="
  position: fixed; top: 0; left: 0; right: 0; z-index: 999;
  background: #1a1a2e; border-bottom: 1px solid #333;
  padding: 10px 16px; display: flex; align-items: center; gap: 10px;
">
  <button
    onclick={() => goto(base + `/journal/${id}`)}
    style="
      padding: 8px 14px; border-radius: 8px; cursor: pointer;
      background: transparent; border: 1px solid #555;
      color: #aaa; font-size: 13px; font-family: inherit;
    "
  >← Retour</button>
  <div style="flex: 1; font-size: 14px; font-weight: 600; color: #eee;">
    📄 Aperçu impression — Journal de tir par sautage (ASP Construction)
  </div>
  <button
    onclick={printPage}
    style="
      padding: 8px 16px; border-radius: 8px; cursor: pointer;
      background: #4f6ef7; border: none; color: white;
      font-size: 13px; font-weight: 600; font-family: inherit;
    "
  >🖨️ Imprimer / PDF</button>
</div>

<!-- Print content -->
<div class="no-print" style="height: 56px;"></div>

{#if loading}
  <div style="padding: 40px; text-align: center; color: #999;">Chargement...</div>
{:else if journal}
  <div class="print-page" style="
    max-width: 680px; margin: 0 auto; padding: 20px;
    background: white; color: #111;
    font-family: 'Times New Roman', Times, serif;
    font-size: 10pt; line-height: 1.4;
  ">

    <!-- ── Title ──────────────────────────────────────────────────────────── -->
    <div style="text-align: center; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px;">
      <div style="font-size: 16pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
        Journal de tir par sautage
      </div>
      <div style="font-size: 8pt; color: #333; margin-top: 4px;">
        Référence : Annexe 2.2 Journal de tir (art. 4.7.10) — Code de sécurité pour les travaux de construction
      </div>
      <div style="font-size: 8pt; color: #555; margin-top: 2px;">
        ASP Construction — CA04-2025-02 · Numéro de tir : <strong>{fmt(journal.numero_tir)}</strong>
      </div>
    </div>

    <!-- ── Section A — Identification du chantier ───────────────────────── -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
      <thead>
        <tr><th colspan="4" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
          A — IDENTIFICATION DU CHANTIER
        </th></tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; width: 28%; border: 1px solid #ccc;">Nom de l'entreprise :</td>
          <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.nom_entreprise)}</td>
        </tr>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Adresse :</td>
          <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.adresse_entreprise, '—')}</td>
        </tr>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Localisation du chantier :</td>
          <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.chantier)}</td>
        </tr>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Donneur d'ouvrage :</td>
          <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.donneur_ouvrage)}</td>
        </tr>
      </tbody>
    </table>

    <!-- ── Section B — Info sur le sautage / Section C — Conditions ──────── -->
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
          <td style="padding: 3px 6px; border: 1px solid #ccc; width: 28%;">{fmt(journal.station)}</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 22%;">Température :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc; width: 28%;">{fmt(journal.temperature)} °C</td>
        </tr>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Date (j/m/a) :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.date_tir)}</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;" colspan="2">
            {journal.meteo_ensoleille ? '☑' : '☐'} Ensoleillé &nbsp;
            {journal.meteo_nuageux ? '☑' : '☐'} Nuageux &nbsp;
            {journal.meteo_pluie ? '☑' : '☐'} Pluie &nbsp;
            {journal.meteo_neige ? '☑' : '☐'} Neige
          </td>
        </tr>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Heure :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.heure_tir)}</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Dir. et vitesse vents :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.vent_direction_vitesse)}</td>
        </tr>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Nb volées quotidiennes :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.nb_volees_quotidiennes)}</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Conditions du roc :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.conditions_roc)}</td>
        </tr>
      </tbody>
    </table>

    <!-- ── Section D — Données sur le forage ──────────────────────────────── -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
      <thead>
        <tr><th colspan="4" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
          D — DONNÉES SUR LE FORAGE
        </th></tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 30%;">Nb trous et diamètre :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc; width: 20%;">{fmt(journal.nb_trous)} trous, {fmt(journal.diametre)} mm</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 25%;">Fardeau × Espacement :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.fardeau)} m × {fmt(journal.espacement)} m</td>
        </tr>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Prof. moy. par rangée :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.profondeur_prevue)} m</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Hauteur du collet :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.hauteur_collet)} m</td>
        </tr>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Nature de la bourre :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">
            {journal.nature_bourre === 'pierre nette' ? '☑' : '☐'} pierre nette &nbsp;
            {journal.nature_bourre === 'concassée' ? '☑' : '☐'} concassée
          </td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Hauteur mort terrain :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.hauteur_mort_terrain)} m</td>
        </tr>
        <tr>
          <td colspan="4" style="padding: 3px 6px; border: 1px solid #ccc; font-size: 9pt;">
            <strong>Vibrations :</strong>
            ● Valeur à respecter : {fmt(journal.vibrations_valeur_respecter)} &nbsp;
            ● Valeur obtenue : {fmt(journal.vibrations_ppv)} &nbsp;
            ● Sismographes : {fmt(journal.vibrations_sismographes)}
          </td>
        </tr>
        {#if journal.nb_trous_predecoupage}
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Nb trous pré-découpage :</td>
            <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.nb_trous_predecoupage)}</td>
          </tr>
        {/if}
        {#if journal.type_pare_eclats}
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Type pare-éclats :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.type_pare_eclats)}</td>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Dim. / Nb :</td>
            <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.pare_eclats_dimension)} / {fmt(journal.pare_eclats_nombre)}</td>
          </tr>
        {/if}
      </tbody>
    </table>

    <!-- ── Section E — Distances des structures ───────────────────────────── -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
      <thead>
        <tr><th colspan="6" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
          E — DISTANCE DES STRUCTURES LES PLUS PRÈS (en mètre)
        </th></tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Bâtiment :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.dist_batiment)} m</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Pont :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.dist_pont)} m</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Route :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.dist_route)} m</td>
        </tr>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Ligne électrique :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.dist_ligne_electrique)} m</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Structure s-terrain :</td>
          <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.dist_structure_souterraine)} m</td>
        </tr>
      </tbody>
    </table>

    <!-- ── Section F — Explosifs ──────────────────────────────────────────── -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
      <thead>
        <tr><th colspan="4" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
          F — EXPLOSIFS (réf. : Colonne de charge)
        </th></tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 28%;">Type :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc; width: 22%;">{fmt(journal.type_detonateurs)}</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 25%;">Nb détonateurs :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.nb_detonateurs)}</td>
        </tr>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Quantité utilisée :</td>
          <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">
            {fmt(journal.total_explosif_kg)} kg total
            {journal.explosifs && journal.explosifs.length > 0
              ? ' — ' + journal.explosifs.map(e => `${e.type || '?'} (${e.total_kg || '?'} kg)`).join(', ')
              : ''}
          </td>
        </tr>
        {#if journal.type_emulsion_pompee}
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Type émulsion pompée :</td>
            <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.type_emulsion_pompee)}</td>
          </tr>
        {/if}
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Volume de roc :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.volume_roc_m3)} m³</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Facteur chargement :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.facteur_chargement)} kg/m³</td>
        </tr>
      </tbody>
    </table>

    <!-- ── Section G — Recommandations ────────────────────────────────────── -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
      <thead>
        <tr><th colspan="6" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
          G — RECOMMANDATIONS (BONNES PRATIQUES)
        </th></tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 24%;">Caméra vidéo :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc; width: 18%;">{fmtBool(journal.camera_video)}</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 24%;">Écaillage sécurité :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmtBool(journal.ecaillage_securite)}</td>
        </tr>
        <tr>
          <td colspan="4" style="padding: 3px 6px; border: 1px solid #ccc;">
            <strong>Détecteur résidentiel de CO (norme BNQ) :</strong> &nbsp; {fmtBool(journal.detecteur_co_bnq)}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ── Section H — Résultats du sautage ───────────────────────────────── -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
      <thead>
        <tr><th colspan="4" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
          H — RÉSULTAT DU SAUTAGE
        </th></tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 28%;">Concentration max. CO :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc; width: 22%;">{fmt(journal.concentration_co_ppm)}</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 26%;">Fracturation telle qu'exigée :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmtBool(journal.fracturation_exigee)}</td>
        </tr>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Bris hors profil :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmtBool(journal.bris_hors_profil)}</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Trous ratés / canon / fond :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmtBool(journal.trous_rates)}</td>
        </tr>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Projection :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmtBool(journal.projection)}</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Heure mise à feu :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.heure_mise_a_feu)}</td>
        </tr>
        {#if journal.projection === 'Oui'}
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; padding-left: 18px;">● Distance et pierres :</td>
            <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.projection_distance_pierres)}</td>
          </tr>
          <tr>
            <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; padding-left: 18px;">● Description dommages :</td>
            <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.description_dommages)}</td>
          </tr>
        {/if}
      </tbody>
    </table>

    <!-- ── Blast Pattern Canvas (if available) ────────────────────────────── -->
    {#if journal.firingSequence && journal.firingSequence.holes.length > 0}
      <div style="margin-bottom: 6px; border: 1px solid #ccc; padding: 8px;">
        <div style="font-size: 9pt; font-weight: bold; text-transform: uppercase; background: #222; color: white; padding: 4px 6px; margin: -8px -8px 8px -8px;">
          PLAN DE TIR / SÉQUENCE DE DÉTONATION (Vision AI)
        </div>
        <BlastPatternCanvas
          firingSequence={journal.firingSequence}
          title={journal.numero_tir || ''}
          shotInfo="{journal.chantier || ''}{journal.chantier && journal.date_tir ? ' · ' : ''}{journal.date_tir || ''}"
          interactive={false}
          showAnimation={false}
          showExport={false}
        />
        <div style="font-size: 8pt; color: #555; margin-top: 4px; text-align: right;">
          {journal.firingSequence.holes.length} trous · Extrait via Vision AI ({journal.firingSequence.model ?? 'Gemini'})
        </div>
      </div>
    {/if}

    <!-- ── Section I — Remarques ──────────────────────────────────────────── -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
      <thead>
        <tr><th colspan="1" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
          I — REMARQUES
        </th></tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 4px 6px; border: 1px solid #ccc; min-height: 40px; vertical-align: top; white-space: pre-wrap; font-size: 9pt;">
            {fmt(journal.remarques, '')}
            {#if !journal.remarques}<br><br>{/if}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ── Section J — Signature ──────────────────────────────────────────── -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
      <thead>
        <tr><th colspan="4" style="background: #222; color: white; padding: 4px 6px; font-size: 9pt; text-align: left;">
          J — SIGNATURE
        </th></tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 28%;">Nom du boutefeu :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc; width: 22%;">{fmt(journal.boutefeu_prenom)} {fmt(journal.boutefeu_nom)}</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc; width: 22%;">Date :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.signature_date)}</td>
        </tr>
        <tr>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Signature :</td>
          <td colspan="3" style="padding: 3px 6px; border: 1px solid #ccc; height: 60px; vertical-align: middle; text-align: center;">
            {#if journal.signature_data}
              <img
                src={journal.signature_data}
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
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.boutefeu_certificat)}</td>
          <td style="padding: 3px 6px; font-weight: bold; border: 1px solid #ccc;">Permis SQ :</td>
          <td style="padding: 3px 6px; border: 1px solid #ccc;">{fmt(journal.boutefeu_permis_sq)}</td>
        </tr>
      </tbody>
    </table>

    <!-- ── Legal note ─────────────────────────────────────────────────────── -->
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
{/if}

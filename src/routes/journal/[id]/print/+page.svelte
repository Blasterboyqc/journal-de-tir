<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { getJournal, type JournalTir } from '$lib/db';

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
</script>

<svelte:head>
  <title>Journal de tir — {journal?.numero_tir || ''}</title>
</svelte:head>

{#if loading}
  <div style="padding: 40px; text-align: center; color: #666;">Chargement...</div>
{:else if journal}
<div style="
  max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;
  font-size: 11pt; color: #000; background: #fff;
">

  <!-- Print action -->
  <div style="margin-bottom: 16px; text-align: right;" class="no-print">
    <button onclick={() => window.print()} style="
      padding: 8px 16px; background: #4f6ef7; color: #fff; border: none;
      border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;
    ">🖨️ Imprimer</button>
    <button onclick={() => goto(base + `/journal/${journal?.id}`)} style="
      padding: 8px 16px; background: #eee; color: #333; border: none;
      border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; margin-left: 8px;
    ">← Retour</button>
  </div>

  <!-- Title -->
  <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
    <div style="font-size: 14pt; font-weight: bold;">JOURNAL DE TIR PAR SAUTAGE</div>
    <div style="font-size: 9pt;">Annexe 2.2 Journal de tir (art. 4.7.10.) du Code de sécurité pour les travaux de construction</div>
  </div>

  <!-- En-tête -->
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10pt;"><tbody>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; width: 30%; font-weight: bold; background: #f5f5f5;">Nom de l'entreprise</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.nom_entreprise || ''}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Adresse</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.adresse_entreprise || ''}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Localisation du chantier</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.localisation_chantier || ''}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Donneur d'ouvrage</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.donneur_ouvrage || ''}</td>
    </tr>
  </tbody></table>

  <!-- Section: Information sur le sautage -->
  <div style="font-weight: bold; font-size: 10pt; background: #ddd; padding: 4px 6px; border: 1px solid #999; margin-top: 8px;">
    INFORMATION SUR LE SAUTAGE À L'EXPLOSIF
  </div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10pt;"><tbody>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5; width: 30%;">Localisation / chaînage</td>
      <td style="border: 1px solid #999; padding: 4px 6px;" colspan="3">{journal.localisation_chainage || ''}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Date (jour/mois/an)</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{formatDate(journal.date_tir)}</td>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Heure</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.heure_tir || ''}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Nb volées quotidiennes</td>
      <td style="border: 1px solid #999; padding: 4px 6px;" colspan="3">{journal.nb_volees_quotidiennes || ''}</td>
    </tr>
  </tbody></table>

  <!-- Conditions climatiques -->
  <div style="font-weight: bold; font-size: 10pt; background: #ddd; padding: 4px 6px; border: 1px solid #999; margin-top: 8px;">
    CONDITIONS CLIMATIQUES
  </div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10pt;"><tbody>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5; width: 30%;">Température (°C)</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.temperature || ''}</td>
      <td style="border: 1px solid #999; padding: 4px 6px; width: 40%;">
        {journal.meteo_ensoleille ? '☑' : '☐'} Ensoleillé &nbsp;
        {journal.meteo_nuageux ? '☑' : '☐'} Nuageux &nbsp;
        {journal.meteo_pluie ? '☑' : '☐'} Pluie &nbsp;
        {journal.meteo_neige ? '☑' : '☐'} Neige
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Direction et vitesse des vents</td>
      <td style="border: 1px solid #999; padding: 4px 6px;" colspan="2">{journal.vent_direction_vitesse || ''}</td>
    </tr>
  </tbody></table>

  <!-- Données sur le forage -->
  <div style="font-weight: bold; font-size: 10pt; background: #ddd; padding: 4px 6px; border: 1px solid #999; margin-top: 8px;">
    DONNÉES SUR LE FORAGE
  </div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10pt;"><tbody>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5; width: 30%;">Nb trous et diamètre</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.nb_trous || ''} trous · {journal.diametre_forage || ''} mm</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Fardeau / Espacement</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.fardeau || ''} m / {journal.espacement || ''} m</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Profondeur moy. par rangée</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.profondeur_moy_rangee || ''} m</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Hauteur collet / Nature bourre</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">
        {journal.hauteur_collet || ''} m &nbsp;
        {journal.nature_bourre_pierre_nette ? '☑' : '☐'} pierre nette &nbsp;
        {journal.nature_bourre_concassee ? '☑' : '☐'} concassée
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Hauteur mort terrain</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.hauteur_mort_terrain || ''} m</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Vibrations — valeur à respecter</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.vibrations_valeur_respecter || ''}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Vibrations — valeur obtenue</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.vibrations_valeur_obtenue || ''}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Emplacement sismographes</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.vibrations_sismographes || ''}</td>
    </tr>
    {#if journal.nb_trous_predecoupage}
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Nb trous pré-découpage</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.nb_trous_predecoupage}</td>
    </tr>
    {/if}
    {#if journal.type_pare_eclats}
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Pare-éclats</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.type_pare_eclats} · {journal.pare_eclats_dimension || ''} · {journal.pare_eclats_nombre || ''}</td>
    </tr>
    {/if}
  </tbody></table>

  <!-- Distance structures -->
  <div style="font-weight: bold; font-size: 10pt; background: #ddd; padding: 4px 6px; border: 1px solid #999; margin-top: 8px;">
    DISTANCE DES STRUCTURES LES PLUS PRÈS (EN MÈTRE)
  </div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10pt;"><tbody>
    <tr>
      {#each [
        ['Bâtiment', journal.dist_batiment],
        ['Pont', journal.dist_pont],
        ['Route', journal.dist_route],
        ['Ligne élec.', journal.dist_ligne_electrique],
        ['Sous-terr.', journal.dist_structure_souterraine],
      ] as [lbl, val]}
        <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5; text-align: center; font-size: 9pt;">{lbl}</td>
      {/each}
    </tr>
    <tr>
      {#each [journal.dist_batiment, journal.dist_pont, journal.dist_route, journal.dist_ligne_electrique, journal.dist_structure_souterraine] as val}
        <td style="border: 1px solid #999; padding: 4px 6px; text-align: center;">{val || ''}</td>
      {/each}
    </tr>
  </tbody></table>

  <!-- Explosifs -->
  <div style="font-weight: bold; font-size: 10pt; background: #ddd; padding: 4px 6px; border: 1px solid #999; margin-top: 8px;">
    EXPLOSIFS (RÉF.: COLONNE DE CHARGE)
  </div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10pt;"><tbody>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5; width: 30%;">Type de détonateurs</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.type_detonateurs || ''}</td>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5; width: 20%;">Nb détonateurs</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.nb_detonateurs || ''}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Quantité d'explosifs</td>
      <td style="border: 1px solid #999; padding: 4px 6px;" colspan="3">{journal.quantite_explosifs || ''}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Type émulsion pompée</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.type_emulsion_pompee || ''}</td>
      <td style="border: 1px solid #999; padding: 4px 6px; font-weight: bold; background: #f5f5f5;">Volume roc / Facteur</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.volume_roc_m3 || ''} m³ / {journal.facteur_chargement || ''} kg/m³</td>
    </tr>
  </tbody></table>

  <!-- Recommandations -->
  <div style="font-weight: bold; font-size: 10pt; background: #ddd; padding: 4px 6px; border: 1px solid #999; margin-top: 8px;">
    RECOMMANDATIONS (BONNES PRATIQUES)
  </div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10pt;"><tbody>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; width: 55%;">Caméra vidéo</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{yesNo(journal.camera_video)}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px;">Écaillage de sécurité</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{yesNo(journal.ecaillage_securite)}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px;">Détecteur résidentiel de CO selon la norme BNQ</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{yesNo(journal.detecteur_co_bnq)}</td>
    </tr>
  </tbody></table>

  <!-- Résultats -->
  <div style="font-weight: bold; font-size: 10pt; background: #ddd; padding: 4px 6px; border: 1px solid #999; margin-top: 8px;">
    RÉSULTAT DU SAUTAGE
  </div>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10pt;"><tbody>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px; width: 55%;">Concentration max. de CO</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.concentration_co_ppm || ''}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px;">Fracturation telle qu'exigée</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{yesNo(journal.fracturation_exigee)}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px;">Bris hors profil</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{yesNo(journal.bris_hors_profil)}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px;">Trous ratés / canon / fond de trou</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{yesNo(journal.trous_rates)}</td>
    </tr>
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px;">Projection</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">
        {yesNo(journal.projection)}
        {#if journal.projection === true}
          {#if journal.projection_details} — {journal.projection_details}{/if}
        {/if}
      </td>
    </tr>
    {#if journal.description_dommages}
    <tr>
      <td style="border: 1px solid #999; padding: 4px 6px;">Description des dommages</td>
      <td style="border: 1px solid #999; padding: 4px 6px;">{journal.description_dommages}</td>
    </tr>
    {/if}
  </tbody></table>

  <!-- Remarques -->
  <div style="font-weight: bold; font-size: 10pt; background: #ddd; padding: 4px 6px; border: 1px solid #999; margin-top: 8px;">
    REMARQUES
  </div>
  <div style="border: 1px solid #999; border-top: none; padding: 6px; min-height: 50px; font-size: 10pt;">
    {journal.remarques || ''}
  </div>

  <!-- Signature -->
  <div style="margin-top: 16px; border: 1px solid #999; padding: 10px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 10pt;"><tbody>
      <tr>
        <td style="width: 50%; padding-right: 20px;">
          <div style="font-weight: bold; margin-bottom: 4px;">Nom du boutefeu:</div>
          <div>{journal.boutefeu_prenom} {journal.boutefeu_nom}</div>
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

</div>
{/if}

<style>
  @media print {
    .no-print { display: none !important; }
    body { background: white; }
  }
</style>

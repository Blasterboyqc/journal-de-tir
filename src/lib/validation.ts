import type { JournalTir, ExplosifRow } from './db';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  missingRequired: string[];
  filledCount: number;
  totalCount: number;
  /** Validation status per section (index matches sections array) */
  sectionStatus: SectionValidation[];
}

export interface SectionValidation {
  name: string;
  status: 'ok' | 'warning' | 'error' | 'empty';
  errorCount: number;
  warningCount: number;
}

/**
 * Validate a JournalTir object for compliance and completeness.
 * Returns errors (blocking), warnings (informational), and field counts.
 */
export function validateJournal(journal: Partial<JournalTir>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequired: string[] = [];

  // Per-section tracking
  const secErrors: string[][] = [[], [], [], [], [], [], [], []];
  const secWarnings: string[][] = [[], [], [], [], [], [], [], []];

  function reqErr(section: number, field: string, msg: string) {
    errors.push(msg);
    missingRequired.push(field);
    secErrors[section].push(msg);
  }
  function warn(section: number, msg: string) {
    warnings.push(msg);
    secWarnings[section].push(msg);
  }

  // ── Section 0: Identification ─────────────────────────────────────────────
  if (!journal.numero_tir?.trim()) {
    reqErr(0, 'numero_tir', 'Numéro de tir obligatoire');
  }
  if (!journal.date_tir?.trim()) {
    reqErr(0, 'date_tir', 'Date du tir obligatoire');
  }
  if (!journal.chantier?.trim()) {
    warn(0, 'Localisation du chantier non renseignée');
  }
  if (!journal.nom_entreprise?.trim()) {
    warn(0, 'Nom de l\'entreprise non renseigné');
  }
  if (!journal.donneur_ouvrage?.trim()) {
    warn(0, 'Donneur d\'ouvrage non renseigné');
  }
  if (!journal.heure_tir?.trim()) {
    warn(0, 'Heure prévue non renseignée');
  }

  // ── Section 1: Boutefeu ───────────────────────────────────────────────────
  if (!journal.boutefeu_prenom?.trim()) {
    reqErr(1, 'boutefeu_prenom', 'Prénom du boutefeu obligatoire');
  }
  if (!journal.boutefeu_nom?.trim()) {
    reqErr(1, 'boutefeu_nom', 'Nom du boutefeu obligatoire');
  }
  if (!journal.boutefeu_certificat?.trim()) {
    reqErr(1, 'boutefeu_certificat', 'Certificat CSTC obligatoire');
  }
  if (!journal.boutefeu_permis_sq?.trim()) {
    warn(1, 'Permis SQ non renseigné');
  }
  if (!journal.employeur?.trim()) {
    warn(1, 'Employeur non renseigné');
  }

  // ── Section 2: Conditions ─────────────────────────────────────────────────
  if (!journal.temperature?.trim()) {
    warn(2, 'Température non renseignée');
  }
  if (!journal.meteo_ensoleille && !journal.meteo_nuageux && !journal.meteo_pluie && !journal.meteo_neige) {
    warn(2, 'Conditions météo non sélectionnées');
  }
  if (!journal.vent_direction_vitesse?.trim()) {
    warn(2, 'Direction et vitesse des vents non renseignées');
  }

  // ── Section 3: Forage ─────────────────────────────────────────────────────
  if (!journal.nb_trous?.trim()) {
    reqErr(3, 'nb_trous', 'Nombre de trous obligatoire');
  }
  if (!journal.diametre?.trim()) {
    warn(3, 'Diamètre de forage non renseigné');
  }
  if (!journal.profondeur_prevue?.trim()) {
    warn(3, 'Profondeur moyenne non renseignée');
  }
  if (!journal.fardeau?.trim()) {
    warn(3, 'Fardeau non renseigné');
  }
  if (!journal.espacement?.trim()) {
    warn(3, 'Espacement non renseigné');
  }
  if (!journal.hauteur_collet?.trim()) {
    warn(3, 'Hauteur du collet non renseignée');
  }
  if (!journal.type_tir?.trim()) {
    warn(3, 'Type de tir non renseigné');
  }

  // ── Section 4: Explosifs ──────────────────────────────────────────────────
  if (!journal.explosifs || journal.explosifs.length === 0) {
    reqErr(4, 'explosifs', 'Au moins un produit explosif requis');
  } else {
    journal.explosifs.forEach((e: ExplosifRow, i: number) => {
      if (!e.type?.trim()) {
        warn(4, `Produit #${i + 1}: type non renseigné`);
      }
      if (!e.quantite_par_trou?.trim()) {
        warn(4, `Produit #${i + 1}: quantité par trou manquante`);
      }
      if (!e.nb_trous?.trim()) {
        warn(4, `Produit #${i + 1}: nombre de trous manquant`);
      }
    });
  }
  if (!journal.nb_detonateurs?.trim()) {
    warn(4, 'Nombre de détonateurs non renseigné');
  }
  if (!journal.type_detonateurs?.trim()) {
    warn(4, 'Type de détonateurs non renseigné');
  }

  // ── Section 5: Sécurité ───────────────────────────────────────────────────
  if (!journal.zone_securite_m?.trim()) {
    warn(5, 'Zone de sécurité (m) non renseignée');
  }
  if (!journal.procedures_suivies) {
    warn(5, 'Procédures de sécurité non confirmées');
  }
  if (!journal.zone_evacuee) {
    warn(5, 'Zone évacuée non confirmée');
  }
  if (!journal.communication_etablie) {
    warn(5, 'Communication non confirmée');
  }
  if (!journal.inspection_avant) {
    warn(5, 'Inspection pré-tir non confirmée');
  }

  // ── Section 6: Résultats ──────────────────────────────────────────────────
  if (!journal.heure_mise_a_feu?.trim()) {
    warn(6, 'Heure de mise à feu non renseignée');
  }
  if (!journal.fragmentation?.trim()) {
    warn(6, 'Résultat de fragmentation non renseigné');
  }
  if (!journal.fracturation_exigee?.trim()) {
    warn(6, 'Fracturation telle qu\'exigée non renseignée');
  }

  // ── Section 7: Signature ──────────────────────────────────────────────────
  if (!journal.signature_data?.trim()) {
    warn(7, 'Signature du boutefeu manquante');
  }

  // ── Count filled fields ───────────────────────────────────────────────────
  const allFields: string[] = [
    // Section A/Identification
    'numero_tir', 'date_tir', 'heure_tir', 'chantier', 'station', 'contrat',
    'nom_entreprise', 'adresse_entreprise', 'donneur_ouvrage', 'nb_volees_quotidiennes',
    // Section B/Boutefeu
    'boutefeu_prenom', 'boutefeu_nom', 'boutefeu_certificat', 'boutefeu_permis_sq',
    'superviseur', 'employeur',
    // Section C/Conditions
    'temperature', 'meteo', 'vent_direction_vitesse', 'conditions_roc', 'geologie', 'type_roc',
    // Section D/Forage
    'type_tir', 'nb_trous', 'diametre', 'profondeur_prevue', 'profondeur_reelle',
    'espacement', 'fardeau', 'hauteur_collet', 'nature_bourre', 'hauteur_mort_terrain',
    'sous_forage', 'inclinaison', 'orientation',
    'vibrations_valeur_respecter', 'vibrations_ppv', 'vibrations_sismographes',
    'nb_trous_predecoupage', 'type_pare_eclats', 'pare_eclats_dimension', 'pare_eclats_nombre',
    // Section E/Distances
    'dist_batiment', 'dist_pont', 'dist_route', 'dist_ligne_electrique', 'dist_structure_souterraine',
    // Section F/Explosifs
    'detonateurs', 'type_detonateurs', 'sequence_delais', 'nb_detonateurs',
    'type_emulsion_pompee', 'volume_roc_m3', 'facteur_chargement',
    // Section G/Recommandations
    'camera_video', 'ecaillage_securite', 'detecteur_co_bnq',
    // Section H/Résultats
    'heure_mise_a_feu', 'concentration_co_ppm', 'fracturation_exigee',
    'bris_hors_profil', 'trous_rates', 'projection', 'fragmentation',
    'projection_max_m', 'vibrations_ppv', 'bruit_db', 'fumee_couleur', 'resultats_generaux',
    'total_explosif_kg', 'total_detonateurs', 'ratio_poudre',
    // Section I/Remarques
    'remarques',
    // Section J/Signature
    'signature_data',
    // Zone sécurité
    'zone_securite_m', 'signaux_utilises',
  ];

  const totalCount = allFields.length;
  let filledCount = 0;

  for (const field of allFields) {
    const val = (journal as Record<string, unknown>)[field];
    if (val !== undefined && val !== null && val !== '' && val !== false) {
      filledCount++;
    }
  }

  // Count boolean fields (météo checkboxes)
  const meteoFields = ['meteo_ensoleille', 'meteo_nuageux', 'meteo_pluie', 'meteo_neige'];
  for (const f of meteoFields) {
    if ((journal as Record<string, unknown>)[f] === true) filledCount++;
  }

  // Count safety booleans
  const safetyFields = ['procedures_suivies', 'zone_evacuee', 'communication_etablie', 'inspection_avant'];
  for (const f of safetyFields) {
    if ((journal as Record<string, unknown>)[f] === true) filledCount++;
  }

  // Count explosifs as one "group" field
  if (journal.explosifs && journal.explosifs.length > 0) {
    filledCount++;
  }

  const sectionNames = [
    'Identification', 'Boutefeu', 'Conditions', 'Forage',
    'Explosifs', 'Sécurité', 'Résultats', 'Signature',
  ];

  const sectionStatus: SectionValidation[] = sectionNames.map((name, i) => {
    const ec = secErrors[i].length;
    const wc = secWarnings[i].length;
    const status = ec > 0 ? 'error' : wc > 0 ? 'warning' : 'ok';
    return { name, status, errorCount: ec, warningCount: wc };
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    missingRequired,
    filledCount,
    totalCount: totalCount + meteoFields.length + safetyFields.length + 1, // +1 for explosifs group
    sectionStatus,
  };
}

/**
 * Get list of auto-filled fields from parsed PDF data,
 * comparing with the original (empty) state.
 */
export function describeAutoFilledFields(
  original: Partial<JournalTir>,
  updated: Partial<JournalTir>
): { field: string; label: string; value: string }[] {
  const fieldLabels: Record<string, string> = {
    numero_tir: 'Numéro de tir',
    date_tir: 'Date du tir',
    chantier: 'Localisation du chantier',
    station: 'Localisation / chaînage',
    contrat: 'No. contrat',
    nom_entreprise: 'Nom de l\'entreprise',
    donneur_ouvrage: 'Donneur d\'ouvrage',
    type_tir: 'Type de tir',
    nb_trous: 'Nombre de trous',
    diametre: 'Diamètre de forage',
    profondeur_prevue: 'Profondeur prévue',
    espacement: 'Espacement',
    fardeau: 'Fardeau',
    hauteur_collet: 'Hauteur du collet',
    nature_bourre: 'Nature de la bourre',
    hauteur_mort_terrain: 'Hauteur mort terrain',
    sous_forage: 'Sous-forage',
    inclinaison: 'Inclinaison',
    detonateurs: 'Marque détonateurs',
    type_detonateurs: 'Type détonateurs',
    nb_detonateurs: 'Nb détonateurs',
    sequence_delais: 'Séquence délais',
    superviseur: 'Superviseur',
    total_explosif_kg: 'Total explosifs (kg)',
    vibrations_valeur_respecter: 'Vibrations — valeur à respecter',
    vibrations_ppv: 'Vibrations PPV obtenues',
    vibrations_sismographes: 'Emplacement sismographes',
    remarques: 'Remarques',
  };

  const result: { field: string; label: string; value: string }[] = [];

  for (const [field, label] of Object.entries(fieldLabels)) {
    const origVal = (original as Record<string, unknown>)[field];
    const newVal = (updated as Record<string, unknown>)[field];

    if (newVal && newVal !== origVal) {
      result.push({
        field,
        label,
        value: String(newVal).substring(0, 60) + (String(newVal).length > 60 ? '…' : ''),
      });
    }
  }

  return result;
}

import Dexie, { type Table } from 'dexie';

// ─── Profil Boutefeu ──────────────────────────────────────────────────────────

export interface ProfilBoutefeu {
  id?: number;
  prenom: string;
  nom: string;
  certificat_cstc: string;
  cstc_expiry: string;
  permis_sq: string;
  employeur: string;
  chantier_actuel: string;
  telephone: string;
  updatedAt: string;
}

// ─── Schéma de sautage (page 3) ───────────────────────────────────────────────

export interface SchemaForage {
  // Header
  chargement_type: string;        // Chargement-Type
  profondeur_sol_roc: string;     // Profondeur des forages: SOL/ROC (incluant mort terrain)
  // Borehole diagram data
  bourre: string;                 // Bourre / Espaceurs description
  explosifs_amorces: string;      // Explosifs / Amorces description
  // Labels for the hole layers (bullet points on the left)
  couches: string;                // Free text, one label per line
  // Footer
  trous_de: string;               // Trous n°: ___ à ___
  trous_a: string;
}

// ─── Journal de Tir — structure = 3 pages form ───────────────────────────────

export interface JournalTir {
  id?: number;
  numero_tir: string;
  statut: 'brouillon' | 'complete';

  // ── PAGE 1: Journal de tir par sautage ────────────────────────────────────

  // En-tête
  nom_entreprise: string;
  adresse_entreprise: string;
  localisation_chantier: string;
  donneur_ouvrage: string;

  // Information sur le sautage
  localisation_chainage: string;
  date_tir: string;              // YYYY-MM-DD
  heure_tir: string;
  nb_volees_quotidiennes: string;

  // Conditions climatiques
  temperature: string;           // °C
  meteo_ensoleille: boolean;
  meteo_nuageux: boolean;
  meteo_pluie: boolean;
  meteo_neige: boolean;
  vent_direction_vitesse: string;

  // Données sur le forage
  nb_trous: string;              // nombre de trous
  diametre_forage: string;       // diamètre de forage (mm)
  fardeau: string;               // m
  espacement: string;            // m
  profondeur_moy_rangee: string; // profondeur moyenne par rangée (m)
  hauteur_collet: string;        // m
  nature_bourre_pierre_nette: boolean;
  nature_bourre_concassee: boolean;
  hauteur_mort_terrain: string;  // m
  vibrations_valeur_respecter: string;
  vibrations_valeur_obtenue: string;
  vibrations_sismographes: string;
  nb_trous_predecoupage: string;
  type_pare_eclats: string;
  pare_eclats_dimension: string;
  pare_eclats_nombre: string;

  // Distance des structures (m)
  dist_batiment: string;
  dist_pont: string;
  dist_route: string;
  dist_ligne_electrique: string;
  dist_structure_souterraine: string;

  // Explosifs
  type_detonateurs: string;
  nb_detonateurs: string;
  quantite_explosifs: string;    // description: amorces, explosifs en unité/sac/caisse/kg
  type_emulsion_pompee: string;
  volume_roc_m3: string;
  facteur_chargement: string;    // kg/m³

  // Recommandations
  camera_video: boolean | null;
  ecaillage_securite: boolean | null;
  detecteur_co_bnq: boolean | null;

  // Résultat du sautage
  concentration_co_ppm: string;
  fracturation_exigee: boolean | null;
  bris_hors_profil: boolean | null;
  trous_rates: boolean | null;   // trous ratés / canon / fond de trou
  projection: boolean | null;
  projection_details: string;    // si oui, distance et grosseur des pierres
  description_dommages: string;

  // Remarques
  remarques: string;

  // Boutefeu (pré-rempli depuis profil)
  boutefeu_nom: string;
  boutefeu_prenom: string;
  boutefeu_certificat: string;
  boutefeu_permis_sq: string;

  // ── PAGE 2: Plan de tir — Registre de forage ─────────────────────────────

  // 5 items à documenter (texte libre)
  plan_faces_libres: string;
  plan_direction_tir: string;
  plan_sequence_identification: string;
  plan_structures_distance: string;
  plan_zone_tir: string;

  // Dessin libre (canvas data URL)
  patron_forage_dataurl: string;

  // ── PAGE 3: Profil de tir ─────────────────────────────────────────────────

  // Info requises (texte libre)
  profil_description_explosifs: string;
  profil_agents_sautage: string;
  profil_raccordements_delais: string;

  // 6 schémas de sautage
  schemas: SchemaForage[];

  // ── Métadonnées ───────────────────────────────────────────────────────────
  createdAt: string;
  updatedAt: string;
}

// ─── DB Class ─────────────────────────────────────────────────────────────────

class JournalDB extends Dexie {
  profil!: Table<ProfilBoutefeu>;
  journaux!: Table<JournalTir>;

  constructor() {
    super('JournalDeTirDB');
    // Version 6: complete simplification — matching 3-page government form
    this.version(6).stores({
      profil: '++id',
      journaux: '++id, statut, date_tir, localisation_chantier, numero_tir, createdAt'
    });
  }
}

export const db = new JournalDB();

// ─── Default empty schemas ────────────────────────────────────────────────────

export function defaultSchemas(): SchemaForage[] {
  return Array.from({ length: 6 }, () => ({
    chargement_type: '',
    profondeur_sol_roc: '',
    bourre: '',
    explosifs_amorces: '',
    couches: '',
    trous_de: '',
    trous_a: '',
  }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function getProfil(): Promise<ProfilBoutefeu | null> {
  const all = await db.profil.toArray();
  return all[0] || null;
}

export async function saveProfil(data: Omit<ProfilBoutefeu, 'id'>): Promise<void> {
  const existing = await db.profil.toArray();
  if (existing.length > 0) {
    await db.profil.update(existing[0].id!, data);
  } else {
    await db.profil.add(data);
  }
}

export async function getJournaux(): Promise<JournalTir[]> {
  return db.journaux.orderBy('createdAt').reverse().toArray();
}

export async function getJournal(id: number): Promise<JournalTir | undefined> {
  return db.journaux.get(id);
}

export async function saveJournal(data: Omit<JournalTir, 'id'>): Promise<number> {
  return db.journaux.add(data);
}

export async function updateJournal(id: number, data: Partial<JournalTir>): Promise<void> {
  await db.journaux.update(id, { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteJournal(id: number): Promise<void> {
  await db.journaux.delete(id);
}

export function genNumeroTir(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `TIR-${y}${m}${d}-${h}${min}`;
}

export function emptyJournal(profil?: ProfilBoutefeu | null): Omit<JournalTir, 'id'> {
  const now = new Date().toISOString();
  return {
    numero_tir: genNumeroTir(),
    statut: 'brouillon',

    nom_entreprise: profil?.employeur || '',
    adresse_entreprise: '',
    localisation_chantier: profil?.chantier_actuel || '',
    donneur_ouvrage: '',

    localisation_chainage: '',
    date_tir: new Date().toISOString().split('T')[0],
    heure_tir: '',
    nb_volees_quotidiennes: '',

    temperature: '',
    meteo_ensoleille: false,
    meteo_nuageux: false,
    meteo_pluie: false,
    meteo_neige: false,
    vent_direction_vitesse: '',

    nb_trous: '',
    diametre_forage: '',
    fardeau: '',
    espacement: '',
    profondeur_moy_rangee: '',
    hauteur_collet: '',
    nature_bourre_pierre_nette: false,
    nature_bourre_concassee: false,
    hauteur_mort_terrain: '',
    vibrations_valeur_respecter: '',
    vibrations_valeur_obtenue: '',
    vibrations_sismographes: '',
    nb_trous_predecoupage: '',
    type_pare_eclats: '',
    pare_eclats_dimension: '',
    pare_eclats_nombre: '',

    dist_batiment: '',
    dist_pont: '',
    dist_route: '',
    dist_ligne_electrique: '',
    dist_structure_souterraine: '',

    type_detonateurs: '',
    nb_detonateurs: '',
    quantite_explosifs: '',
    type_emulsion_pompee: '',
    volume_roc_m3: '',
    facteur_chargement: '',

    camera_video: null,
    ecaillage_securite: null,
    detecteur_co_bnq: null,

    concentration_co_ppm: '',
    fracturation_exigee: null,
    bris_hors_profil: null,
    trous_rates: null,
    projection: null,
    projection_details: '',
    description_dommages: '',

    remarques: '',

    boutefeu_nom: profil?.nom || '',
    boutefeu_prenom: profil?.prenom || '',
    boutefeu_certificat: profil?.certificat_cstc || '',
    boutefeu_permis_sq: profil?.permis_sq || '',

    plan_faces_libres: '',
    plan_direction_tir: '',
    plan_sequence_identification: '',
    plan_structures_distance: '',
    plan_zone_tir: '',
    patron_forage_dataurl: '',

    profil_description_explosifs: '',
    profil_agents_sautage: '',
    profil_raccordements_delais: '',

    schemas: defaultSchemas(),

    createdAt: now,
    updatedAt: now,
  };
}

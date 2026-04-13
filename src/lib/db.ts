import Dexie, { type Table } from 'dexie';

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
  email: string;
  updatedAt: string;
}

export interface JournalTir {
  id?: number;
  numero_tir: string;
  statut: 'brouillon' | 'complete' | 'archive';

  // ── Section A — Identification du chantier ─────────────────────────────────
  date_tir: string;
  heure_tir: string;
  chantier: string;          // [A3] Localisation du chantier
  station: string;           // [B1] Localisation / chaînage
  contrat: string;
  nom_entreprise: string;    // [A1] Nom de l'entreprise
  adresse_entreprise: string;// [A2] Adresse (optionnel)
  donneur_ouvrage: string;   // [A4] Donneur d'ouvrage
  nb_volees_quotidiennes: string; // [B4] Nombre de volées quotidiennes

  // ── Section B — Boutefeu et permis ────────────────────────────────────────
  boutefeu_prenom: string;
  boutefeu_nom: string;
  boutefeu_certificat: string;
  boutefeu_permis_sq: string;
  superviseur: string;
  employeur: string;

  // ── Section C — Conditions climatiques ────────────────────────────────────
  temperature: string;       // [C1] Température °C
  meteo: string;             // legacy single select (kept for compat)
  meteo_ensoleille: boolean; // [C2] Ensoleillé
  meteo_nuageux: boolean;    // [C3] Nuageux
  meteo_pluie: boolean;      // [C4] Pluie
  meteo_neige: boolean;      // [C5] Neige
  vent_direction_vitesse: string; // [C6] Direction et vitesse des vents
  conditions_roc: string;
  geologie: string;
  type_roc: string;

  // ── Section D — Données sur le forage ──────────────────────────────────────
  type_tir: string;          // type de tir (banc, tranchée, etc.)
  nb_trous: string;          // [D1] nombre de trous (avec diamètre)
  diametre: string;          // [D1] diamètre de forage (mm)
  espacement: string;        // [D2] espacement (m)
  fardeau: string;           // [D2] fardeau (m)
  profondeur_prevue: string; // [D3] profondeur moyenne par rangée (m)
  profondeur_reelle: string;
  hauteur_collet: string;    // [D4] hauteur du collet (m)
  nature_bourre: string;     // [D4b] pierre nette | concassée
  hauteur_mort_terrain: string; // [D5] hauteur du mort terrain (m)
  sous_forage: string;       // sous-forage (m)
  inclinaison: string;       // inclinaison (°)
  orientation: string;
  vibrations_valeur_respecter: string; // [D6a] valeur à respecter
  vibrations_ppv: string;    // [D6b] valeur obtenue (PPV mm/s)
  vibrations_sismographes: string; // [D6c] emplacement des sismographes
  nb_trous_predecoupage: string; // [D7] nombre de trous de pré-découpage
  type_pare_eclats: string;  // [D8] type de pare-éclats
  pare_eclats_dimension: string; // [D8b] dimension
  pare_eclats_nombre: string;   // [D8c] nombre

  // ── Section E — Distance des structures ────────────────────────────────────
  dist_batiment: string;     // [E1] bâtiment (m)
  dist_pont: string;         // [E2] pont (m)
  dist_route: string;        // [E3] route (m)
  dist_ligne_electrique: string; // [E4] ligne électrique (m)
  dist_structure_souterraine: string; // [E5] structure sous-terraine (m)

  // ── Section F — Explosifs ──────────────────────────────────────────────────
  explosifs: ExplosifRow[];
  detonateurs: string;           // marque/modèle détonateurs
  type_detonateurs: string;      // [F2-related] type de détonateurs
  sequence_delais: string;
  nb_detonateurs: string;        // [F2] nombre de détonateurs
  type_emulsion_pompee: string;  // [F4] type d'émulsion pompée
  volume_roc_m3: string;         // [F5] volume de roc (m³)
  facteur_chargement: string;    // [F6] facteur de chargement (kg/m³)

  // ── Section G — Recommandations ────────────────────────────────────────────
  camera_video: string;          // [G1] Oui | Non | ''
  ecaillage_securite: string;    // [G2] Oui | Non | ''
  detecteur_co_bnq: string;      // [G3] Oui | Non | ''

  // ── Sécurité (opérationnelle) ──────────────────────────────────────────────
  zone_securite_m: string;
  signaux_utilises: string;
  gardiens: GardienRow[];
  procedures_suivies: boolean;
  zone_evacuee: boolean;
  communication_etablie: boolean;
  inspection_avant: boolean;

  // ── Section H — Résultats du sautage ──────────────────────────────────────
  heure_mise_a_feu: string;
  concentration_co_ppm: string;  // [H1] concentration max. de CO
  fracturation_exigee: string;   // [H2] Oui | Non | ''
  bris_hors_profil: string;      // [H3] Oui | Non | ''
  trous_rates: string;           // [H4] Oui | Non | 'oui' | 'non' (compat)
  nb_trous_rates: string;
  projection: string;            // [H5] Oui | Non | ''
  projection_distance_pierres: string; // [H5a] si oui, distance et grosseur
  description_dommages: string;  // [H5b] description des dommages
  fragmentation: string;
  projection_max_m: string;
  bruit_db: string;
  fumee_couleur: string;
  description_rates: string;
  procedures_rates: string;
  resultats_generaux: string;

  // ── Récap ──────────────────────────────────────────────────────────────────
  total_explosif_kg: string;
  total_detonateurs: string;
  ratio_poudre: string;

  // ── Section I — Remarques ──────────────────────────────────────────────────
  remarques: string;

  // ── Section J — Signature ──────────────────────────────────────────────────
  signature_data: string;
  signature_date: string;

  // ── Plan du patron de forage (dessin libre) ───────────────────────────────
  patron_forage_dataurl?: string;

  // ── Vision AI — Firing Sequence (Phase 2) ─────────────────────────────────
  firingSequence?: FiringSequence;

  createdAt: string;
  updatedAt: string;
}

export interface ExplosifRow {
  id: string;
  type: string;
  fabricant: string;
  lot: string;
  quantite_par_trou: string;
  nb_trous: string;
  total_kg: string;
  unite: string;
}

export interface GardienRow {
  id: string;
  nom: string;
  poste: string;
}

// ─── Vision AI / Firing Sequence ──────────────────────────────────────────────

export interface FiringHole {
  id: number;
  x: number;         // 0-1 normalized horizontal position (0=left, 1=right)
  y: number;         // 0-1 normalized vertical position (0=top, 1=bottom)
  delay_ms: number;  // delay in milliseconds (-1 if unknown)
  type?: 'bouchon' | 'masse' | 'tampon';
}

export interface FiringConnection {
  from: number;  // source hole ID
  to: number;    // destination hole ID
}

export interface FiringSequence {
  holes: FiringHole[];
  connections?: FiringConnection[];
  extractedAt?: string;  // ISO timestamp
  confidence?: number;   // 0-1 extraction confidence
  model?: string;        // AI model used
  totalHolesDetected?: number;
  delayRange?: { min: number; max: number };
}

class JournalDB extends Dexie {
  profil!: Table<ProfilBoutefeu>;
  journaux!: Table<JournalTir>;

  constructor() {
    super('JournalDeTirDB');
    this.version(1).stores({
      profil: '++id',
      journaux: '++id, statut, date_tir, chantier, numero_tir, createdAt'
    });
    // Version 2: adds firingSequence field (non-indexed — stored as JSON blob)
    this.version(2).stores({
      profil: '++id',
      journaux: '++id, statut, date_tir, chantier, numero_tir, createdAt'
    });
    // Version 3: adds full ASP form fields (sections A-J)
    this.version(3).stores({
      profil: '++id',
      journaux: '++id, statut, date_tir, chantier, numero_tir, createdAt'
    });
    // Version 4: adds patron_forage_dataurl (freehand drawing canvas)
    this.version(4).stores({
      profil: '++id',
      journaux: '++id, statut, date_tir, chantier, numero_tir, createdAt'
    });
  }
}

export const db = new JournalDB();

// Helpers
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

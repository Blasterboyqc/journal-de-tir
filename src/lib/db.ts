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
  // Identification
  date_tir: string;
  heure_tir: string;
  chantier: string;
  station: string;
  contrat: string;
  // Boutefeu
  boutefeu_prenom: string;
  boutefeu_nom: string;
  boutefeu_certificat: string;
  boutefeu_permis_sq: string;
  superviseur: string;
  employeur: string;
  // Conditions
  temperature: string;
  meteo: string;
  conditions_roc: string;
  geologie: string;
  type_roc: string;
  // Plan de forage
  type_tir: string;
  nb_trous: string;
  profondeur_prevue: string;
  profondeur_reelle: string;
  diametre: string;
  espacement: string;
  fardeau: string;
  sous_forage: string;
  inclinaison: string;
  orientation: string;
  // Explosifs
  explosifs: ExplosifRow[];
  detonateurs: string;
  type_detonateurs: string;
  sequence_delais: string;
  nb_detonateurs: string;
  // Sécurité
  zone_securite_m: string;
  signaux_utilises: string;
  gardiens: GardienRow[];
  procedures_suivies: boolean;
  zone_evacuee: boolean;
  communication_etablie: boolean;
  inspection_avant: boolean;
  // Résultats
  heure_mise_a_feu: string;
  fragmentation: string;
  projection_max_m: string;
  vibrations_ppv: string;
  bruit_db: string;
  fumee_couleur: string;
  trous_rates: string;
  nb_trous_rates: string;
  description_rates: string;
  procedures_rates: string;
  resultats_generaux: string;
  // Récap
  total_explosif_kg: string;
  total_detonateurs: string;
  ratio_poudre: string;
  // Notes
  remarques: string;
  // Signature
  signature_data: string;
  signature_date: string;
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

class JournalDB extends Dexie {
  profil!: Table<ProfilBoutefeu>;
  journaux!: Table<JournalTir>;

  constructor() {
    super('JournalDeTirDB');
    this.version(1).stores({
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

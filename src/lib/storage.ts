import type { AppData, Profil } from '../types';
import { cibleSuggeree } from './nutrition';

export const CLE_STOCKAGE = 'nutri-forme-data';
export const VERSION_DONNEES = 1;

export function profilParDefaut(): Profil {
  const base = {
    sexe: 'homme' as const,
    age: 35,
    taille: 175,
    poids: 75,
    activite: 'leger' as const,
    objectif: 'maintien' as const,
  };
  return {
    ...base,
    kcalCible: cibleSuggeree(base),
    kcalManuel: false,
    macros: { prot: 25, gluc: 45, lip: 30 },
    nbRepas: 3,
    exclus: [],
    regime: 'omnivore',
    budget: 'normal',
  };
}

export function donneesParDefaut(): AppData {
  return {
    version: VERSION_DONNEES,
    profil: profilParDefaut(),
    semaineCourante: null,
    historique: [],
    courses: { semaineId: null, coches: [], ajouts: [] },
    pesees: [],
    theme: null,
  };
}

/** Fusionne des données (éventuellement partielles ou anciennes) avec les valeurs par défaut */
export function normaliser(brut: unknown): AppData {
  const def = donneesParDefaut();
  if (!brut || typeof brut !== 'object') return def;
  const d = brut as Partial<AppData>;
  return {
    version: VERSION_DONNEES,
    profil: { ...def.profil, ...(d.profil ?? {}), macros: { ...def.profil.macros, ...(d.profil?.macros ?? {}) } },
    semaineCourante: d.semaineCourante ?? null,
    historique: Array.isArray(d.historique) ? d.historique : [],
    courses: { ...def.courses, ...(d.courses ?? {}) },
    pesees: Array.isArray(d.pesees) ? d.pesees : [],
    theme: d.theme ?? null,
  };
}

export function charger(): AppData {
  try {
    const raw = localStorage.getItem(CLE_STOCKAGE);
    return raw ? normaliser(JSON.parse(raw)) : donneesParDefaut();
  } catch {
    return donneesParDefaut();
  }
}

export function sauvegarder(data: AppData): void {
  try {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(data));
  } catch {
    // Stockage plein ou indisponible (navigation privée) : on ignore silencieusement
  }
}

/** Déclenche le téléchargement d'un fichier JSON de sauvegarde */
export function exporterJSON(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nutrition-forme-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Lit un fichier JSON importé ; lève une erreur si le format est invalide */
export async function importerJSON(fichier: File): Promise<AppData> {
  const texte = await fichier.text();
  const brut = JSON.parse(texte);
  if (!brut || typeof brut !== 'object' || !('profil' in brut)) {
    throw new Error('Ce fichier ne ressemble pas à une sauvegarde de l’application.');
  }
  return normaliser(brut);
}

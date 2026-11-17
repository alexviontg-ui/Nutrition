import { getIngredient } from '../data/ingredients';
import type { IngredientQuantite, Macros, NiveauActivite, Objectif, Profil, RepartitionMacros } from '../types';

// ============================================================
// Calculs nutritionnels
// ============================================================

export const NIVEAUX_ACTIVITE: { id: NiveauActivite; label: string; coef: number; desc: string }[] = [
  { id: 'sedentaire', label: 'Sédentaire', coef: 1.2, desc: 'Travail assis, peu ou pas de sport' },
  { id: 'leger', label: 'Légèrement actif', coef: 1.375, desc: 'Sport léger 1 à 3 fois par semaine' },
  { id: 'modere', label: 'Modérément actif', coef: 1.55, desc: 'Sport modéré 3 à 5 fois par semaine' },
  { id: 'actif', label: 'Actif', coef: 1.725, desc: 'Sport intense 6 à 7 fois par semaine' },
  { id: 'tres_actif', label: 'Très actif', coef: 1.9, desc: 'Travail physique et sport quotidien' },
];

export const OBJECTIFS: { id: Objectif; label: string; ajustement: number }[] = [
  { id: 'perte', label: 'Perte de poids', ajustement: -0.15 },
  { id: 'maintien', label: 'Maintien', ajustement: 0 },
  { id: 'prise', label: 'Prise de poids', ajustement: 0.1 },
];

/** Seuil sous lequel on recommande un avis médical */
export const SEUIL_KCAL_MIN = 1200;

/**
 * Métabolisme de base — équation de Mifflin-St Jeor (1990) :
 *   Homme : 10 × poids(kg) + 6,25 × taille(cm) − 5 × âge + 5
 *   Femme : 10 × poids(kg) + 6,25 × taille(cm) − 5 × âge − 161
 */
export function metabolismeBase(p: Pick<Profil, 'sexe' | 'poids' | 'taille' | 'age'>): number {
  const base = 10 * p.poids + 6.25 * p.taille - 5 * p.age;
  return p.sexe === 'homme' ? base + 5 : base - 161;
}

/** Dépense énergétique totale = métabolisme de base × coefficient d'activité */
export function depenseTotale(p: Pick<Profil, 'sexe' | 'poids' | 'taille' | 'age' | 'activite'>): number {
  const coef = NIVEAUX_ACTIVITE.find((n) => n.id === p.activite)?.coef ?? 1.2;
  return metabolismeBase(p) * coef;
}

/**
 * Objectif calorique suggéré : dépense totale ajustée selon l'objectif
 * (−15 % en perte, +10 % en prise), arrondi à 10 kcal.
 */
export function cibleSuggeree(p: Pick<Profil, 'sexe' | 'poids' | 'taille' | 'age' | 'activite' | 'objectif'>): number {
  const aj = OBJECTIFS.find((o) => o.id === p.objectif)?.ajustement ?? 0;
  return Math.round((depenseTotale(p) * (1 + aj)) / 10) * 10;
}

/**
 * Conversion de la répartition en grammes :
 * protéines et glucides = 4 kcal/g, lipides = 9 kcal/g.
 */
export function grammesMacros(kcal: number, rep: RepartitionMacros) {
  return {
    prot: Math.round((kcal * rep.prot) / 100 / 4),
    gluc: Math.round((kcal * rep.gluc) / 100 / 4),
    lip: Math.round((kcal * rep.lip) / 100 / 9),
  };
}

/** Valeurs nutritionnelles d'une liste d'ingrédients (valeurs base 100 g × quantité / 100) */
export function macrosDe(ings: IngredientQuantite[]): Macros {
  const t: Macros = { kcal: 0, prot: 0, gluc: 0, lip: 0 };
  for (const { id, g } of ings) {
    const i = getIngredient(id);
    const k = g / 100;
    t.kcal += i.kcal * k;
    t.prot += i.prot * k;
    t.gluc += i.gluc * k;
    t.lip += i.lip * k;
  }
  return t;
}

export function sommeMacros(liste: Macros[]): Macros {
  return liste.reduce(
    (a, m) => ({ kcal: a.kcal + m.kcal, prot: a.prot + m.prot, gluc: a.gluc + m.gluc, lip: a.lip + m.lip }),
    { kcal: 0, prot: 0, gluc: 0, lip: 0 },
  );
}

/** Indice de masse corporelle = poids (kg) / taille (m)² */
export function imc(poids: number, tailleCm: number): number {
  const m = tailleCm / 100;
  return poids / (m * m);
}

export function categorieImc(v: number): string {
  if (v < 18.5) return 'Insuffisance pondérale';
  if (v < 25) return 'Corpulence normale';
  if (v < 30) return 'Surpoids';
  return 'Obésité';
}

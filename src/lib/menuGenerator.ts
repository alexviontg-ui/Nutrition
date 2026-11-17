import { getIngredient } from '../data/ingredients';
import { RECETTES, RECETTES_MAP } from '../data/recipes';
import type {
  Budget,
  Ingredient,
  IngredientQuantite,
  JourMenu,
  RepartitionMacros,
  Recette,
  Regime,
  RepasPlanifie,
  SemaineMenu,
  TypeRepas,
} from '../types';
import { ajouterJours } from './dates';
import { macrosDe } from './nutrition';
import { creerRng, melanger, type Rng } from './random';

// ============================================================
// GÉNÉRATEUR DE MENUS
//
// Principe :
//  1. La cible journalière est répartie entre les repas (PARTS_REPAS).
//  2. Pour chaque repas, on choisit une recette compatible (régime,
//     exclusions, budget), en limitant les répétitions (≤ 2 / semaine).
//  3. La recette est mise à l'échelle : facteur = kcal visées / kcal recette,
//     puis chaque quantité est arrondie en unité pratique (œuf entier,
//     demi-cuillère, pas de 5 g).
//  4. Les arrondis décalant le total, une phase d'équilibrage corrige
//     la journée en jouant d'abord sur les ingrédients « ajustables »
//     (féculents, pain, huile…), puis sur l'ensemble des ingrédients.
//  5. Si la journée reste hors tolérance, on retente avec d'autres recettes.
// ============================================================

/** Tolérance garantie sur le total journalier (±5 %) */
export const TOLERANCE = 0.05;
/** Tolérance visée pendant l'équilibrage (marge de sécurité) */
const TOLERANCE_VISEE = 0.025;
/** Nombre maximal d'apparitions d'une même recette dans la semaine */
export const MAX_REPETITIONS = 2;

/** Part de la cible calorique attribuée à chaque repas */
export const PARTS_REPAS: Record<3 | 4, Partial<Record<TypeRepas, number>>> = {
  3: { petitdej: 0.25, dejeuner: 0.4, diner: 0.35 },
  4: { petitdej: 0.2, dejeuner: 0.35, collation: 0.15, diner: 0.3 },
};

/** Ordre d'affichage des repas dans la journée */
export const ORDRE_REPAS: TypeRepas[] = ['petitdej', 'dejeuner', 'collation', 'diner'];

export const LABEL_REPAS: Record<TypeRepas, string> = {
  petitdej: 'Petit-déjeuner',
  dejeuner: 'Déjeuner',
  collation: 'Collation',
  diner: 'Dîner',
};

export interface OptionsGeneration {
  kcalCible: number;
  nbRepas: 3 | 4;
  regime: Regime;
  exclus: string[];
  budget: Budget;
  macros: RepartitionMacros;
}

export function typesRepas(nbRepas: 3 | 4): TypeRepas[] {
  return ORDRE_REPAS.filter((t) => PARTS_REPAS[nbRepas][t] !== undefined);
}

/** Recettes utilisables pour un type de repas selon les préférences */
export function recettesCompatibles(opts: Pick<OptionsGeneration, 'regime' | 'exclus' | 'budget'>, type: TypeRepas): Recette[] {
  return RECETTES.filter(
    (r) =>
      r.repas.includes(type) &&
      (opts.regime === 'omnivore' || r.vege) &&
      (opts.budget === 'normal' || r.cout < 3) &&
      !r.ingredients.some((i) => opts.exclus.includes(i.id)),
  );
}

// ------------------------------------------------------------
// Arrondis pratiques
// ------------------------------------------------------------

/**
 * Arrondit une quantité (g) à une valeur « praticable » en cuisine :
 *  - ingrédients comptés à la pièce (œuf, tortilla, yaourt) : nombre entier ≥ 1
 *  - ingrédients mesurés à la cuillère : demi-cuillère près
 *  - petites quantités (< 10 g) : gramme près
 *  - sinon : multiple de 5 g
 */
export function arrondirQuantite(ing: Ingredient, g: number): number {
  if (ing.entier && ing.piece) {
    const n = Math.max(1, Math.round(g / ing.piece.g));
    return n * ing.piece.g;
  }
  if (ing.cuillere) {
    const pas = ing.cuillere.g / 2;
    return Math.max(pas, Math.round(g / pas) * pas);
  }
  if (g < 10) return Math.max(1, Math.round(g));
  return Math.round(g / 5) * 5;
}

/** Quantité de base (recette d'origine) d'un ingrédient, pour borner les ajustements */
function quantiteBase(recetteId: string, ingId: string): number {
  const r = RECETTES_MAP[recetteId];
  return r?.ingredients.find((i) => i.id === ingId)?.g ?? 0;
}

/** Bornes de mise à l'échelle d'un ingrédient par rapport à la recette d'origine */
const FACTEUR_MIN = 0.3;
const FACTEUR_MAX = 3;

/** Met une recette à l'échelle (les ingrédients « fixes » ne bougent pas) */
function mettreAEchelle(recette: Recette, facteur: number): IngredientQuantite[] {
  return recette.ingredients.map(({ id, g }) => {
    const ing = getIngredient(id);
    return { id, g: ing.fixe ? g : arrondirQuantite(ing, g * facteur) };
  });
}

export const kcalDe = (ings: IngredientQuantite[]) => macrosDe(ings).kcal;
export const kcalJour = (repas: RepasPlanifie[]) => repas.reduce((s, r) => s + kcalDe(r.ingredients), 0);

/**
 * Prépare un repas à partir d'une recette, mis à l'échelle pour
 * approcher les kcal visées. Le facteur est borné [0,5 ; 2,2] pour
 * conserver des portions réalistes ; l'équilibrage fera le reste.
 */
export function planifierRepas(recette: Recette, type: TypeRepas, kcalVisees: number): RepasPlanifie {
  const base = kcalDe(recette.ingredients);
  const facteur = Math.min(2.2, Math.max(0.5, kcalVisees / base));
  return {
    type,
    recetteId: recette.id,
    nom: recette.nom,
    temps: recette.temps,
    ingredients: mettreAEchelle(recette, facteur),
    etapes: recette.etapes,
  };
}

// ------------------------------------------------------------
// Équilibrage d'une journée
// ------------------------------------------------------------

/**
 * Applique un facteur multiplicatif aux ingrédients sélectionnés par `filtre`
 * dans les repas modifiables, afin de combler `ecart` kcal.
 *   facteur = 1 + écart / (kcal des ingrédients concernés)
 * Le facteur est borné à [0,5 ; 1,8] par passe pour éviter les sauts brutaux,
 * et chaque quantité reste dans [0,3 ; 3] × quantité de la recette d'origine.
 */
function appliquerCorrection(
  repas: RepasPlanifie[],
  indices: number[],
  filtre: (ing: Ingredient) => boolean,
  ecart: number,
): void {
  let kcalConcernees = 0;
  for (const idx of indices) {
    for (const q of repas[idx].ingredients) {
      const ing = getIngredient(q.id);
      if (filtre(ing)) kcalConcernees += (ing.kcal * q.g) / 100;
    }
  }
  if (kcalConcernees < 1) return;

  const facteur = Math.min(1.8, Math.max(0.5, 1 + ecart / kcalConcernees));
  for (const idx of indices) {
    const r = repas[idx];
    r.ingredients = r.ingredients.map((q) => {
      const ing = getIngredient(q.id);
      if (!filtre(ing)) return q;
      const base = quantiteBase(r.recetteId, q.id) || q.g;
      const borne = Math.min(base * FACTEUR_MAX, Math.max(base * FACTEUR_MIN, q.g * facteur));
      return { id: q.id, g: arrondirQuantite(ing, borne) };
    });
  }
}

/**
 * Ajuste les quantités pour que le total de la journée approche la cible.
 * Modifie `repas` en place. `indices` = repas autorisés à bouger.
 */
export function equilibrerJournee(repas: RepasPlanifie[], cible: number, indices: number[]): void {
  const estAjustable = (i: Ingredient) => !!i.ajustable && !i.fixe && !i.entier;
  const estVariable = (i: Ingredient) => !i.fixe && !i.entier;

  for (let iter = 0; iter < 12; iter++) {
    let ecart = cible - kcalJour(repas);
    if (Math.abs(ecart) <= cible * TOLERANCE_VISEE) return;

    // Phase 1 : on agit d'abord sur les féculents / pain / huile
    appliquerCorrection(repas, indices, estAjustable, ecart);

    ecart = cible - kcalJour(repas);
    if (Math.abs(ecart) <= cible * TOLERANCE_VISEE) return;

    // Phase 2 : si ce n'est pas suffisant, on ajuste toute la portion
    appliquerCorrection(repas, indices, estVariable, ecart);
  }
}

export function ecartRelatif(repas: RepasPlanifie[], cible: number): number {
  return (kcalJour(repas) - cible) / cible;
}

// ------------------------------------------------------------
// Choix des recettes
// ------------------------------------------------------------

/**
 * Choisit une recette parmi les candidates : on en tire 3 au hasard et on
 * garde celle qui minimise un score combinant
 *   - le nombre d'utilisations dans la semaine (favorise la variété)
 *   - l'écart entre sa part de protéines et la cible de protéines.
 */
function choisirRecette(candidates: Recette[], usage: Map<string, number>, rng: Rng, protCible: number): Recette {
  const tirage = melanger(candidates, rng).slice(0, 3);
  let meilleure = tirage[0];
  let meilleurScore = Infinity;
  for (const r of tirage) {
    const m = macrosDe(r.ingredients);
    const partProt = (m.prot * 4) / m.kcal;
    const score = (usage.get(r.id) ?? 0) * 0.15 + Math.abs(partProt - protCible);
    if (score < meilleurScore) {
      meilleurScore = score;
      meilleure = r;
    }
  }
  return meilleure;
}

/** Génère une journée complète en respectant la cible ±5 % */
function genererJour(
  date: string,
  opts: OptionsGeneration,
  compatibles: Partial<Record<TypeRepas, Recette[]>>,
  usage: Map<string, number>,
  rng: Rng,
): JourMenu {
  const types = typesRepas(opts.nbRepas);
  const parts = PARTS_REPAS[opts.nbRepas];
  let meilleur: RepasPlanifie[] | null = null;
  let meilleurEcart = Infinity;

  for (let essai = 0; essai < 60; essai++) {
    const utilisesJour = new Set<string>();
    const repas: RepasPlanifie[] = [];

    for (const type of types) {
      const toutes = compatibles[type] ?? [];
      let candidates = toutes.filter(
        (r) => (usage.get(r.id) ?? 0) < MAX_REPETITIONS && !utilisesJour.has(r.id),
      );
      // Si les exclusions ont trop réduit le choix, on relâche la limite de répétition
      if (candidates.length === 0) candidates = toutes.filter((r) => !utilisesJour.has(r.id));
      if (candidates.length === 0) candidates = toutes;
      if (candidates.length === 0) {
        throw new Error(`Aucune recette disponible pour le repas « ${LABEL_REPAS[type]} » avec ces préférences.`);
      }
      const recette = choisirRecette(candidates, usage, rng, opts.macros.prot / 100);
      utilisesJour.add(recette.id);
      repas.push(planifierRepas(recette, type, opts.kcalCible * (parts[type] ?? 0)));
    }

    equilibrerJournee(repas, opts.kcalCible, repas.map((_, i) => i));
    const ecart = Math.abs(ecartRelatif(repas, opts.kcalCible));
    if (ecart < meilleurEcart) {
      meilleurEcart = ecart;
      meilleur = repas;
    }
    if (ecart <= TOLERANCE_VISEE * 1.2) break;
  }

  const final = meilleur!;
  for (const r of final) usage.set(r.recetteId, (usage.get(r.recetteId) ?? 0) + 1);
  return { date, repas: final };
}

/** Génère une semaine (7 jours) à partir du lundi `debut` */
export function genererSemaine(opts: OptionsGeneration, debut: string, seed?: number): SemaineMenu {
  const rng = creerRng(seed ?? Date.now());
  const compatibles: Partial<Record<TypeRepas, Recette[]>> = {};
  for (const t of typesRepas(opts.nbRepas)) compatibles[t] = recettesCompatibles(opts, t);

  const usage = new Map<string, number>();
  const jours: JourMenu[] = [];
  for (let i = 0; i < 7; i++) {
    jours.push(genererJour(ajouterJours(debut, i), opts, compatibles, usage, rng));
  }
  return {
    id: `sem-${debut}-${Math.floor(rng() * 1e9).toString(36)}`,
    debut,
    creeLe: new Date().toISOString(),
    kcalCible: opts.kcalCible,
    nbRepas: opts.nbRepas,
    jours,
  };
}

/** Nombre d'apparitions de chaque recette dans la semaine */
export function usageSemaine(semaine: SemaineMenu): Map<string, number> {
  const usage = new Map<string, number>();
  for (const j of semaine.jours) for (const r of j.repas) usage.set(r.recetteId, (usage.get(r.recetteId) ?? 0) + 1);
  return usage;
}

/**
 * Remplace un repas par une autre recette en gardant l'équilibre de la journée :
 *  - la nouvelle recette vise « cible − kcal des autres repas » ;
 *  - on équilibre d'abord en ne touchant QUE ce repas ;
 *  - si nécessaire, on rééquilibre toute la journée.
 * Retourne la nouvelle journée, ou null si aucune alternative ne convient.
 */
export function changerRepas(
  semaine: SemaineMenu,
  jourIndex: number,
  repasIndex: number,
  opts: OptionsGeneration,
  seed?: number,
): JourMenu | null {
  const rng = creerRng(seed ?? Date.now());
  const jour = semaine.jours[jourIndex];
  const actuel = jour.repas[repasIndex];
  const usage = usageSemaine(semaine);
  usage.set(actuel.recetteId, (usage.get(actuel.recetteId) ?? 1) - 1);
  const autresDuJour = new Set(jour.repas.map((r) => r.recetteId));

  const candidates = melanger(
    recettesCompatibles(opts, actuel.type).filter(
      (r) => !autresDuJour.has(r.id) && (usage.get(r.id) ?? 0) < MAX_REPETITIONS,
    ),
    rng,
  );
  const cible = semaine.kcalCible;
  const kcalAutres = kcalJour(jour.repas.filter((_, i) => i !== repasIndex));

  let secours: JourMenu | null = null;
  for (const recette of candidates.slice(0, 20)) {
    const repas = jour.repas.map((r) => ({ ...r, ingredients: r.ingredients.map((q) => ({ ...q })) }));
    repas[repasIndex] = planifierRepas(recette, actuel.type, Math.max(80, cible - kcalAutres));
    equilibrerJournee(repas, cible, [repasIndex]);
    if (Math.abs(ecartRelatif(repas, cible)) <= TOLERANCE_VISEE * 1.2) return { date: jour.date, repas };
    equilibrerJournee(repas, cible, repas.map((_, i) => i));
    if (Math.abs(ecartRelatif(repas, cible)) <= TOLERANCE_VISEE * 1.6 && !secours) {
      secours = { date: jour.date, repas };
    }
  }
  return secours;
}

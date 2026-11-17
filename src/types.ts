// ============================================================
// Modèle de données de l'application
// ============================================================

export type Sexe = 'homme' | 'femme';
export type NiveauActivite = 'sedentaire' | 'leger' | 'modere' | 'actif' | 'tres_actif';
export type Objectif = 'perte' | 'maintien' | 'prise';
export type Regime = 'omnivore' | 'vegetarien';
export type Budget = 'economique' | 'normal';
export type TypeRepas = 'petitdej' | 'dejeuner' | 'diner' | 'collation';

export type Rayon =
  | 'fruits-legumes'
  | 'viandes-poissons'
  | 'cremerie'
  | 'boulangerie'
  | 'epicerie'
  | 'surgeles';

/** Valeurs nutritionnelles (pour 100 g, ou totales selon le contexte) */
export interface Macros {
  kcal: number;
  prot: number;
  gluc: number;
  lip: number;
}

/** Ingrédient de la base locale. Les valeurs sont données pour 100 g. */
export interface Ingredient extends Macros {
  id: string;
  nom: string;
  rayon: Rayon;
  /** Pièce de référence (ex. 1 œuf = 55 g), pour l'affichage et les courses */
  piece?: { g: number; nom: string; pluriel: string };
  /** Si vrai, la quantité est toujours un nombre entier de pièces (œufs, tortillas…) */
  entier?: boolean;
  /** Mesure en cuillère (affichage « 1 c. à soupe ») */
  cuillere?: { type: 'cs' | 'cc'; g: number };
  /** Ingrédient « variable d'ajustement » (féculents, pain, huile…) */
  ajustable?: boolean;
  /** Liquide : quantités affichées en ml (1 g ≈ 1 ml) */
  liquide?: boolean;
  /** Quantité fixe, jamais mise à l'échelle (condiments) */
  fixe?: boolean;
  /** Conditionnements vendus en magasin (en g, ou en pièces si enPieces) */
  achat?: { tailles: number[]; label: string; enPieces?: boolean };
}

export interface IngredientQuantite {
  id: string;
  g: number;
}

export interface Recette {
  id: string;
  nom: string;
  repas: TypeRepas[];
  vege: boolean;
  /** 1 = économique, 2 = moyen, 3 = plus cher (exclu en budget économique) */
  cout: 1 | 2 | 3;
  temps: number; // minutes
  ingredients: IngredientQuantite[];
  etapes: string[];
}

export interface RepartitionMacros {
  prot: number; // %
  gluc: number; // %
  lip: number; // %
}

export interface Profil {
  sexe: Sexe;
  age: number;
  taille: number; // cm
  poids: number; // kg
  activite: NiveauActivite;
  objectif: Objectif;
  kcalCible: number;
  /** Vrai si l'utilisateur a modifié l'objectif lui-même (on ne l'écrase plus) */
  kcalManuel: boolean;
  macros: RepartitionMacros;
  nbRepas: 3 | 4;
  exclus: string[]; // ids d'ingrédients
  regime: Regime;
  budget: Budget;
  poidsObjectif?: number;
}

/** Repas planifié : on fige les quantités finales (indépendant de la base de recettes) */
export interface RepasPlanifie {
  type: TypeRepas;
  recetteId: string;
  nom: string;
  temps: number;
  ingredients: IngredientQuantite[];
  etapes: string[];
}

export interface JourMenu {
  date: string; // AAAA-MM-JJ
  repas: RepasPlanifie[];
}

export interface SemaineMenu {
  id: string;
  debut: string; // AAAA-MM-JJ (lundi)
  creeLe: string; // ISO
  kcalCible: number;
  nbRepas: 3 | 4;
  jours: JourMenu[];
}

export interface ArticleManuel {
  id: string;
  label: string;
}

export interface EtatCourses {
  semaineId: string | null;
  coches: string[];
  ajouts: ArticleManuel[];
}

export interface Pesee {
  id: string;
  date: string; // AAAA-MM-JJ
  poids: number;
  tourTaille?: number;
  commentaire?: string;
}

export interface AppData {
  version: number;
  profil: Profil;
  semaineCourante: SemaineMenu | null;
  historique: SemaineMenu[];
  courses: EtatCourses;
  pesees: Pesee[];
  theme: 'clair' | 'sombre' | null;
}

// ---------- Exercices ----------
export type GroupeMusculaire =
  | 'jambes'
  | 'fessiers'
  | 'pectoraux'
  | 'dos'
  | 'epaules'
  | 'bras'
  | 'abdos';
export type Niveau = 'debutant' | 'intermediaire' | 'avance';

export interface Exercice {
  id: string;
  nom: string;
  groupes: GroupeMusculaire[];
  niveau: Niveau;
  materiel: string; // « Aucun », « Chaise », « Bouteilles d'eau »
  /** 'reps' = répétitions, 'duree' = exercice tenu en secondes */
  mode: 'reps' | 'duree';
  etapes: string[];
  muscles: string;
  erreurs: string[];
  /** Séries × répétitions (ou secondes) conseillées par niveau */
  dosage: Record<Niveau, string>;
  facile: string;
  difficile: string;
}

export interface ProgrammeEtape {
  exerciceId: string;
  consigne: string; // ex. « 3 × 12 » ou « 3 × 30 s »
  repos: number; // secondes
}

export interface Programme {
  id: string;
  nom: string;
  duree: string;
  frequence: string;
  niveau: Niveau;
  description: string;
  etapes: ProgrammeEtape[];
}

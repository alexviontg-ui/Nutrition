import type { Ingredient, Rayon } from '../types';

// ============================================================
// Base d'ingrédients — valeurs nutritionnelles INDICATIVES pour 100 g
// (ordres de grandeur proches des tables publiques type Ciqual).
// Féculents secs (pâtes, riz, semoule…) : valeurs pour le produit CRU/SEC.
// ============================================================

type Opts = Omit<Ingredient, 'id' | 'nom' | 'rayon' | 'kcal' | 'prot' | 'gluc' | 'lip'>;

function ing(
  id: string,
  nom: string,
  rayon: Rayon,
  kcal: number,
  prot: number,
  gluc: number,
  lip: number,
  opts: Opts = {},
): Ingredient {
  return { id, nom, rayon, kcal, prot, gluc, lip, ...opts };
}

const FL: Rayon = 'fruits-legumes';
const VP: Rayon = 'viandes-poissons';
const CR: Rayon = 'cremerie';
const BO: Rayon = 'boulangerie';
const EP: Rayon = 'epicerie';
const SU: Rayon = 'surgeles';

const pc = (g: number, nom: string, pluriel: string) => ({ g, nom, pluriel });

export const INGREDIENTS: Ingredient[] = [
  // ---------- Fruits & légumes ----------
  ing('tomate', 'Tomate', FL, 18, 0.9, 3.9, 0.2, { piece: pc(120, 'tomate', 'tomates') }),
  ing('concombre', 'Concombre', FL, 15, 0.7, 3.6, 0.1, { piece: pc(300, 'concombre', 'concombres') }),
  ing('carotte', 'Carotte', FL, 36, 0.8, 7.6, 0.3, { piece: pc(100, 'carotte', 'carottes') }),
  ing('courgette', 'Courgette', FL, 17, 1.2, 3.1, 0.3, { piece: pc(200, 'courgette', 'courgettes') }),
  ing('poivron', 'Poivron', FL, 27, 0.9, 6, 0.3, { piece: pc(150, 'poivron', 'poivrons') }),
  ing('oignon', 'Oignon', FL, 40, 1.1, 9, 0.1, { piece: pc(100, 'oignon', 'oignons') }),
  ing('poireau', 'Poireau', FL, 30, 1.5, 5.5, 0.3, { piece: pc(200, 'poireau', 'poireaux') }),
  ing('aubergine', 'Aubergine', FL, 25, 1, 4, 0.2, { piece: pc(300, 'aubergine', 'aubergines') }),
  ing('brocoli', 'Brocoli', FL, 34, 2.8, 7, 0.4, { piece: pc(400, 'brocoli', 'brocolis') }),
  ing('champignon', 'Champignons de Paris', FL, 22, 3, 1.5, 0.3, {
    achat: { tailles: [250, 500], label: 'barquette' },
  }),
  ing('salade', 'Salade verte', FL, 15, 1.2, 1.6, 0.2, { piece: pc(300, 'salade', 'salades') }),
  ing('pomme_de_terre', 'Pommes de terre', FL, 80, 2, 17, 0.1, {
    ajustable: true,
    achat: { tailles: [1000, 2500], label: 'filet' },
  }),
  ing('patate_douce', 'Patate douce', FL, 86, 1.6, 20, 0.1, { ajustable: true, piece: pc(300, 'patate douce', 'patates douces') }),
  ing('pomme', 'Pomme', FL, 52, 0.3, 12, 0.2, { piece: pc(150, 'pomme', 'pommes') }),
  ing('banane', 'Banane', FL, 90, 1.1, 20, 0.3, { piece: pc(120, 'banane', 'bananes') }),
  ing('orange', 'Orange', FL, 46, 0.9, 9, 0.1, { piece: pc(180, 'orange', 'oranges') }),
  ing('kiwi', 'Kiwi', FL, 60, 1, 12, 0.5, { piece: pc(80, 'kiwi', 'kiwis') }),
  ing('citron', 'Citron', FL, 30, 0.7, 3, 0.3, { piece: pc(100, 'citron', 'citrons') }),
  ing('avocat', 'Avocat', FL, 160, 2, 8.5, 14.7, { piece: pc(150, 'avocat', 'avocats') }),

  // ---------- Viandes & poissons ----------
  ing('poulet', 'Blanc de poulet', VP, 110, 23, 0, 2, { achat: { tailles: [250, 500, 1000], label: 'barquette' } }),
  ing('dinde', 'Escalope de dinde', VP, 105, 23, 0, 1.2, { achat: { tailles: [250, 500], label: 'barquette' } }),
  ing('steak_hache', 'Steak haché 5 %', VP, 125, 21, 0, 4.5, { achat: { tailles: [200, 400, 800], label: 'barquette' } }),
  ing('porc_filet', 'Filet mignon de porc', VP, 120, 22, 0, 3.5, { achat: { tailles: [500], label: 'pièce' } }),
  ing('jambon', 'Jambon blanc', VP, 110, 20, 1, 3, {
    piece: pc(40, 'tranche', 'tranches'),
    achat: { tailles: [160, 240], label: 'paquet' },
  }),
  ing('lardons', 'Lardons', VP, 270, 16, 0.5, 23, { achat: { tailles: [100, 200], label: 'barquette' } }),
  ing('saumon', 'Pavé de saumon', VP, 200, 20, 0, 13, { achat: { tailles: [250, 500], label: 'barquette' } }),
  ing('crevettes', 'Crevettes cuites décortiquées', VP, 100, 22, 0, 1.5, { achat: { tailles: [200, 400], label: 'barquette' } }),

  // ---------- Crémerie & œufs ----------
  ing('oeuf', 'Œuf', CR, 140, 12.5, 0.7, 9.5, {
    piece: pc(55, 'œuf', 'œufs'),
    entier: true,
    achat: { tailles: [6, 12], label: 'boîte', enPieces: true },
  }),
  ing('lait', 'Lait demi-écrémé', CR, 46, 3.3, 4.8, 1.6, { liquide: true, achat: { tailles: [1000], label: 'brique' } }),
  ing('yaourt', 'Yaourt nature', CR, 55, 4.2, 5, 1.5, {
    piece: pc(125, 'yaourt', 'yaourts'),
    entier: true,
    achat: { tailles: [4, 8, 16], label: 'pack', enPieces: true },
  }),
  ing('fromage_blanc', 'Fromage blanc 0 %', CR, 47, 7.4, 4.1, 0.2, { ajustable: true, achat: { tailles: [500, 1000], label: 'pot' } }),
  ing('emmental', 'Emmental râpé', CR, 380, 28, 0.5, 29, { achat: { tailles: [100, 200], label: 'sachet' } }),
  ing('mozzarella', 'Mozzarella', CR, 250, 18, 1, 19, { achat: { tailles: [125, 250], label: 'sachet' } }),
  ing('feta', 'Feta', CR, 270, 15, 1, 22.5, { achat: { tailles: [200], label: 'barquette' } }),
  ing('parmesan', 'Parmesan', CR, 400, 33, 0, 30, { achat: { tailles: [100], label: 'sachet' } }),
  ing('chevre', 'Bûche de chèvre', CR, 250, 15, 1, 20, { achat: { tailles: [180], label: 'bûche' } }),
  ing('comte', 'Comté', CR, 410, 28, 0, 33, { achat: { tailles: [200], label: 'morceau' } }),
  ing('creme', 'Crème fraîche légère 15 %', CR, 160, 3, 4, 15, {
    cuillere: { type: 'cs', g: 15 },
    achat: { tailles: [200], label: 'pot' },
  }),
  ing('beurre', 'Beurre', CR, 745, 0.7, 0.5, 82, { achat: { tailles: [250], label: 'plaquette' } }),
  ing('tofu', 'Tofu ferme', CR, 130, 13, 1.5, 8, { achat: { tailles: [200, 400], label: 'bloc' } }),
  ing('houmous', 'Houmous', CR, 290, 7, 13, 23, { achat: { tailles: [200], label: 'pot' } }),
  ing('pate_brisee', 'Pâte brisée', CR, 400, 5.5, 41, 24, { achat: { tailles: [230], label: 'rouleau' } }),

  // ---------- Boulangerie ----------
  ing('pain_complet', 'Pain complet', BO, 240, 9, 43, 3, {
    ajustable: true,
    piece: pc(40, 'tranche', 'tranches'),
    achat: { tailles: [400, 800], label: 'pain' },
  }),
  ing('baguette', 'Baguette', BO, 270, 9.5, 55, 1.3, { ajustable: true, achat: { tailles: [250], label: 'baguette' } }),

  // ---------- Épicerie ----------
  ing('pates', 'Pâtes (sèches)', EP, 355, 12.5, 71, 1.5, { ajustable: true, achat: { tailles: [500, 1000], label: 'paquet' } }),
  ing('pates_completes', 'Pâtes complètes (sèches)', EP, 345, 13, 64, 2.5, { ajustable: true, achat: { tailles: [500], label: 'paquet' } }),
  ing('riz', 'Riz (sec)', EP, 355, 8, 78, 0.6, { ajustable: true, achat: { tailles: [500, 1000], label: 'paquet' } }),
  ing('semoule', 'Semoule (sèche)', EP, 360, 12, 73, 1.5, { ajustable: true, achat: { tailles: [500, 1000], label: 'paquet' } }),
  ing('quinoa', 'Quinoa (sec)', EP, 370, 14, 64, 6, { ajustable: true, achat: { tailles: [500], label: 'paquet' } }),
  ing('lentilles', 'Lentilles vertes (sèches)', EP, 336, 24, 49, 1.3, { ajustable: true, achat: { tailles: [500, 1000], label: 'paquet' } }),
  ing('flocons_avoine', "Flocons d'avoine", EP, 370, 13, 59, 7, { ajustable: true, achat: { tailles: [500, 1000], label: 'paquet' } }),
  ing('muesli', 'Muesli sans sucre ajouté', EP, 370, 10, 62, 7, { ajustable: true, achat: { tailles: [500, 750], label: 'paquet' } }),
  ing('tortilla', 'Tortilla de blé', EP, 300, 8.5, 50, 7, {
    piece: pc(60, 'tortilla', 'tortillas'),
    entier: true,
    achat: { tailles: [8], label: 'paquet', enPieces: true },
  }),
  ing('pois_chiches', 'Pois chiches en conserve (égouttés)', EP, 120, 7, 15, 2.5, { achat: { tailles: [265], label: 'boîte' } }),
  ing('haricots_rouges', 'Haricots rouges en conserve (égouttés)', EP, 100, 7, 13, 0.5, { achat: { tailles: [250], label: 'boîte' } }),
  ing('mais', 'Maïs doux en conserve', EP, 100, 3, 17, 1.5, { achat: { tailles: [140, 285], label: 'boîte' } }),
  ing('tomates_concassees', 'Tomates concassées', EP, 25, 1.2, 4, 0.2, { achat: { tailles: [400], label: 'boîte' } }),
  ing('lait_coco', 'Lait de coco', EP, 180, 2, 3, 18, { liquide: true, achat: { tailles: [200, 400], label: 'brique' } }),
  ing('thon', 'Thon au naturel (égoutté)', EP, 115, 26, 0, 1, { achat: { tailles: [140], label: 'boîte' } }),
  ing('sardines', "Sardines à l'huile (égouttées)", EP, 210, 24, 0, 12.5, { achat: { tailles: [115], label: 'boîte' } }),
  ing('huile_olive', "Huile d'olive", EP, 900, 0, 0, 100, {
    ajustable: true,
    cuillere: { type: 'cs', g: 10 },
    achat: { tailles: [500, 1000], label: 'bouteille' },
  }),
  ing('sauce_soja', 'Sauce soja', EP, 60, 8, 6, 0.1, {
    fixe: true,
    cuillere: { type: 'cs', g: 15 },
    achat: { tailles: [150], label: 'bouteille' },
  }),
  ing('moutarde', 'Moutarde', EP, 150, 7, 4, 11, {
    fixe: true,
    cuillere: { type: 'cc', g: 5 },
    achat: { tailles: [200], label: 'pot' },
  }),
  ing('pesto', 'Pesto', EP, 450, 5, 6, 45, { cuillere: { type: 'cs', g: 15 }, achat: { tailles: [190], label: 'pot' } }),
  ing('miel', 'Miel', EP, 320, 0.4, 80, 0, { cuillere: { type: 'cc', g: 7 }, achat: { tailles: [250, 500], label: 'pot' } }),
  ing('confiture', 'Confiture', EP, 240, 0.5, 58, 0.2, { cuillere: { type: 'cs', g: 15 }, achat: { tailles: [370], label: 'pot' } }),
  ing('beurre_cacahuete', 'Beurre de cacahuète', EP, 600, 25, 15, 50, {
    cuillere: { type: 'cs', g: 15 },
    achat: { tailles: [350], label: 'pot' },
  }),
  ing('amandes', 'Amandes', EP, 610, 25, 7, 52, { ajustable: true, achat: { tailles: [100, 200], label: 'sachet' } }),
  ing('noix', 'Cerneaux de noix', EP, 690, 15, 7, 65, { achat: { tailles: [100, 200], label: 'sachet' } }),
  ing('chocolat_noir', 'Chocolat noir 70 %', EP, 570, 8, 33, 42, { achat: { tailles: [100], label: 'tablette' } }),
  ing('compote', 'Compote sans sucre ajouté', EP, 60, 0.3, 13, 0.2, {
    piece: pc(100, 'pot', 'pots'),
    entier: true,
    achat: { tailles: [4, 8], label: 'lot', enPieces: true },
  }),

  // ---------- Surgelés ----------
  ing('haricots_verts', 'Haricots verts surgelés', SU, 30, 1.8, 4.5, 0.2, { achat: { tailles: [500, 1000], label: 'sachet' } }),
  ing('epinards', 'Épinards surgelés', SU, 23, 2.9, 1.1, 0.4, { achat: { tailles: [500, 1000], label: 'sachet' } }),
  ing('petits_pois', 'Petits pois surgelés', SU, 70, 5, 9.5, 0.4, { achat: { tailles: [500, 1000], label: 'sachet' } }),
  ing('fruits_rouges', 'Fruits rouges surgelés', SU, 45, 1, 8, 0.3, { achat: { tailles: [300, 500], label: 'sachet' } }),
  ing('cabillaud', 'Filet de cabillaud surgelé', SU, 80, 18, 0, 0.7, { achat: { tailles: [400, 1000], label: 'sachet' } }),
];

export const INGREDIENTS_MAP: Record<string, Ingredient> = Object.fromEntries(
  INGREDIENTS.map((i) => [i.id, i]),
);

export function getIngredient(id: string): Ingredient {
  const i = INGREDIENTS_MAP[id];
  if (!i) throw new Error(`Ingrédient inconnu : ${id}`);
  return i;
}

export const RAYONS: { id: Rayon; label: string; emoji: string }[] = [
  { id: 'fruits-legumes', label: 'Fruits & légumes', emoji: '🥕' },
  { id: 'viandes-poissons', label: 'Viandes & poissons', emoji: '🍗' },
  { id: 'cremerie', label: 'Crémerie & œufs', emoji: '🧀' },
  { id: 'boulangerie', label: 'Boulangerie', emoji: '🥖' },
  { id: 'epicerie', label: 'Épicerie', emoji: '🥫' },
  { id: 'surgeles', label: 'Surgelés', emoji: '❄️' },
];

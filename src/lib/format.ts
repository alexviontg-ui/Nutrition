import type { Ingredient } from '../types';

const nf1 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

export const fmt1 = (n: number) => nf1.format(n);
export const fmt0 = (n: number) => nf0.format(n);

/** Affiche une fraction au demi près : 1,5 → « 1 ½ », 0,5 → « ½ » */
export function demi(n: number): string {
  const arrondi = Math.round(n * 2) / 2;
  const entier = Math.floor(arrondi);
  const reste = arrondi - entier;
  if (reste === 0) return String(entier);
  return entier === 0 ? '½' : `${entier} ½`;
}

/** Masse (ou volume) lisible : 1250 → « 1,25 kg » */
export function masse(g: number, liquide = false): string {
  if (g >= 1000) return `${nf1.format(g / 1000)} ${liquide ? 'L' : 'kg'}`;
  return `${nf0.format(g)} ${liquide ? 'ml' : 'g'}`;
}

/**
 * Quantité d'un ingrédient dans une recette, en unité pratique :
 *  - pièces entières : « 2 œufs »
 *  - cuillères : « 1 ½ c. à soupe (15 g) »
 *  - pièces approximatives : « 170 g (≈ 1 ½ tomate) »
 *  - sinon : « 80 g »
 */
export function quantiteLisible(ing: Ingredient, g: number): string {
  if (ing.entier && ing.piece) {
    const n = Math.round(g / ing.piece.g);
    return `${n} ${n > 1 ? ing.piece.pluriel : ing.piece.nom}`;
  }
  if (ing.cuillere) {
    const n = g / ing.cuillere.g;
    const type = ing.cuillere.type === 'cs' ? 'c. à soupe' : 'c. à café';
    return `${demi(n)} ${type} (${masse(g, ing.liquide)})`;
  }
  if (ing.piece) {
    const n = g / ing.piece.g;
    if (n >= 0.4 && n <= 12) {
      const nom = n > 1.25 ? ing.piece.pluriel : ing.piece.nom;
      return `${masse(g, ing.liquide)} (≈ ${demi(n)} ${nom})`;
    }
  }
  return masse(g, ing.liquide);
}

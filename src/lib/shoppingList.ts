import { getIngredient, RAYONS } from '../data/ingredients';
import type { Ingredient, Rayon, SemaineMenu } from '../types';
import { masse } from './format';

// ============================================================
// Liste de courses : agrégation des ingrédients du menu
// ============================================================

export interface LigneCourses {
  id: string;
  nom: string;
  rayon: Rayon;
  /** Quantité totale exacte nécessaire (g ou ml), somme des repas */
  besoinG: number;
  besoin: string;
  achat: string;
}

/** Somme exacte des quantités de chaque ingrédient sur toute la semaine */
export function besoinsSemaine(semaine: SemaineMenu): Map<string, number> {
  const besoins = new Map<string, number>();
  for (const jour of semaine.jours) {
    for (const repas of jour.repas) {
      for (const { id, g } of repas.ingredients) {
        besoins.set(id, (besoins.get(id) ?? 0) + g);
      }
    }
  }
  return besoins;
}

const pluriel = (n: number, mot: string) => (n > 1 ? `${mot}s` : mot);

/**
 * Choix du conditionnement : pour chaque taille t disponible, il faut
 * k = ⌈besoin / t⌉ paquets, avec un surplus de k × t − besoin.
 * On retient l'option de score minimal :
 *   score = surplus + 10 % de la taille par paquet supplémentaire
 * (on limite le gaspillage, sans multiplier les petits paquets).
 */
export function conditionnement(besoin: number, tailles: number[]): { n: number; taille: number } {
  let meilleur = { n: 1, taille: tailles[0] };
  let meilleurScore = Infinity;
  for (const t of tailles) {
    const n = Math.max(1, Math.ceil(besoin / t - 1e-9));
    const score = n * t - besoin + 0.1 * t * (n - 1);
    if (score < meilleurScore) {
      meilleurScore = score;
      meilleur = { n, taille: t };
    }
  }
  return meilleur;
}

/** Besoin exact lisible : en pièces pour les produits entiers (œufs…), sinon en g/ml */
function besoinLisible(ing: Ingredient, g: number): string {
  if (ing.entier && ing.piece) {
    const n = Math.round(g / ing.piece.g);
    return `${n} ${n > 1 ? ing.piece.pluriel : ing.piece.nom}`;
  }
  return masse(g, ing.liquide);
}

/** Texte « à acheter » arrondi en conditionnement pratique */
export function achatPratique(ing: Ingredient, g: number): string {
  // Produits vendus à la pièce par paquet (œufs, yaourts, tortillas…)
  if (ing.achat?.enPieces && ing.piece) {
    const pieces = Math.ceil(g / ing.piece.g - 1e-9);
    const { n, taille } = conditionnement(pieces, ing.achat.tailles);
    return `${n} ${pluriel(n, ing.achat.label)} de ${taille}`;
  }
  // Produits conditionnés au poids
  if (ing.achat) {
    const { n, taille } = conditionnement(g, ing.achat.tailles);
    return `${n} ${pluriel(n, ing.achat.label)} de ${masse(taille, ing.liquide)}`;
  }
  // Fruits et légumes à la pièce
  if (ing.piece) {
    const n = Math.max(1, Math.ceil(g / ing.piece.g - 0.15));
    return `${n} ${n > 1 ? ing.piece.pluriel : ing.piece.nom}`;
  }
  // Vrac : arrondi aux 50 g supérieurs
  return `≈ ${masse(Math.ceil(g / 50) * 50, ing.liquide)}`;
}

/** Liste de courses triée par rayon puis par nom */
export function genererListe(semaine: SemaineMenu): LigneCourses[] {
  const ordreRayon = new Map(RAYONS.map((r, i) => [r.id, i]));
  return [...besoinsSemaine(semaine).entries()]
    .map(([id, g]) => {
      const ing = getIngredient(id);
      return {
        id,
        nom: ing.nom,
        rayon: ing.rayon,
        besoinG: g,
        besoin: besoinLisible(ing, g),
        achat: achatPratique(ing, g),
      };
    })
    .sort((a, b) => (ordreRayon.get(a.rayon)! - ordreRayon.get(b.rayon)!) || a.nom.localeCompare(b.nom, 'fr'));
}

/** Version texte brut (pour le bouton « Copier la liste ») */
export function listeEnTexte(lignes: LigneCourses[], ajouts: { label: string }[], coches: string[]): string {
  const parties: string[] = ['LISTE DE COURSES', ''];
  for (const rayon of RAYONS) {
    const items = lignes.filter((l) => l.rayon === rayon.id);
    if (!items.length) continue;
    parties.push(rayon.label.toUpperCase());
    for (const l of items) parties.push(`${coches.includes(l.id) ? '[x]' : '[ ]'} ${l.nom} — ${l.achat} (besoin : ${l.besoin})`);
    parties.push('');
  }
  if (ajouts.length) {
    parties.push('AUTRES');
    for (const a of ajouts) parties.push(`[ ] ${a.label}`);
  }
  return parties.join('\n').trim();
}

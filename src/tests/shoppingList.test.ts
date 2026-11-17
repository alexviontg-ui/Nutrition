import { describe, expect, it } from 'vitest';
import { genererSemaine } from '../lib/menuGenerator';
import { besoinsSemaine, conditionnement, genererListe } from '../lib/shoppingList';

describe('Conditionnement', () => {
  it('achète toujours au moins la quantité nécessaire', () => {
    const jeux = [[250, 500, 1000], [200, 400, 800], [6, 12], [140], [500]];
    for (const tailles of jeux) {
      for (let besoin = 1; besoin <= 3000; besoin += 7) {
        const { n, taille } = conditionnement(besoin, tailles);
        expect(n * taille).toBeGreaterThanOrEqual(besoin);
        expect(tailles).toContain(taille);
      }
    }
    expect(conditionnement(500, [200, 400, 800])).toEqual({ n: 3, taille: 200 });
    expect(conditionnement(7, [6, 12])).toEqual({ n: 1, taille: 12 });
  });
});

describe('Liste de courses', () => {
  for (const kcalCible of [1500, 2000, 2500]) {
    it(`correspond exactement aux ingrédients du menu (${kcalCible} kcal)`, () => {
      const semaine = genererSemaine(
        { kcalCible, nbRepas: 4, regime: 'omnivore', exclus: [], budget: 'normal', macros: { prot: 25, gluc: 45, lip: 30 } },
        '2026-11-16', kcalCible,
      );

      // Somme de référence calculée indépendamment, repas par repas
      const attendu = new Map<string, number>();
      let totalMenu = 0;
      for (const j of semaine.jours) {
        for (const r of j.repas) {
          for (const q of r.ingredients) {
            attendu.set(q.id, (attendu.get(q.id) ?? 0) + q.g);
            totalMenu += q.g;
          }
        }
      }

      const liste = genererListe(semaine);
      // Mêmes ingrédients, ni manquant ni en trop, sans doublon
      expect(new Set(liste.map((l) => l.id))).toEqual(new Set(attendu.keys()));
      expect(liste.length).toBe(attendu.size);
      // Mêmes quantités, au gramme près
      for (const l of liste) expect(l.besoinG, l.id).toBe(attendu.get(l.id));
      expect(liste.reduce((s, l) => s + l.besoinG, 0)).toBe(totalMenu);
      expect(besoinsSemaine(semaine)).toEqual(attendu);
      // Chaque ligne propose un conditionnement d'achat
      for (const l of liste) expect(l.achat.length).toBeGreaterThan(0);
    });
  }
});

import { describe, expect, it } from 'vitest';
import { EXERCICES, EXERCICES_MAP, PROGRAMMES } from '../data/exercises';
import { INGREDIENTS_MAP } from '../data/ingredients';
import { RECETTES } from '../data/recipes';
import {
  changerRepas,
  genererSemaine,
  kcalJour,
  MAX_REPETITIONS,
  TOLERANCE,
  usageSemaine,
  type OptionsGeneration,
} from '../lib/menuGenerator';
import type { Regime } from '../types';

const NON_VEGE = ['poulet', 'dinde', 'steak_hache', 'porc_filet', 'jambon', 'lardons', 'saumon', 'crevettes', 'cabillaud', 'thon', 'sardines'];

describe('Base de données', () => {
  it('contient au moins 60 recettes et 20 exercices', () => {
    expect(RECETTES.length).toBeGreaterThanOrEqual(60);
    expect(EXERCICES.length).toBeGreaterThanOrEqual(20);
  });

  it('chaque ingrédient de recette existe dans la base', () => {
    for (const r of RECETTES) for (const i of r.ingredients) expect(INGREDIENTS_MAP[i.id], `${r.id} → ${i.id}`).toBeDefined();
  });

  it('les recettes végétariennes ne contiennent ni viande ni poisson', () => {
    for (const r of RECETTES.filter((x) => x.vege)) {
      for (const i of r.ingredients) expect(NON_VEGE, `${r.id} contient ${i.id}`).not.toContain(i.id);
    }
  });

  it('les identifiants de recettes sont uniques', () => {
    expect(new Set(RECETTES.map((r) => r.id)).size).toBe(RECETTES.length);
  });

  it('les programmes référencent des exercices existants', () => {
    for (const p of PROGRAMMES) for (const e of p.etapes) expect(EXERCICES_MAP[e.exerciceId], e.exerciceId).toBeDefined();
  });
});

describe('Générateur de menus : cible ±5 %', () => {
  const cibles = [1500, 2000, 2500];
  const regimes: Regime[] = ['omnivore', 'vegetarien'];
  const nbRepasListe: (3 | 4)[] = [3, 4];
  const graines = Array.from({ length: 12 }, (_, i) => 1000 + i * 7919);

  for (const kcalCible of cibles) {
    for (const regime of regimes) {
      for (const nbRepas of nbRepasListe) {
        it(`${kcalCible} kcal — ${regime} — ${nbRepas} repas : chaque jour dans ±5 %`, () => {
          let pireEcart = 0;
          for (const seed of graines) {
            const opts: OptionsGeneration = {
              kcalCible, nbRepas, regime, exclus: [], budget: seed % 2 ? 'economique' : 'normal',
              macros: { prot: 25, gluc: 45, lip: 30 },
            };
            const semaine = genererSemaine(opts, '2026-11-16', seed);
            expect(semaine.jours).toHaveLength(7);
            for (const jour of semaine.jours) {
              expect(jour.repas).toHaveLength(nbRepas);
              const ecart = Math.abs(kcalJour(jour.repas) - kcalCible) / kcalCible;
              pireEcart = Math.max(pireEcart, ecart);
              expect(ecart, `${jour.date} : ${Math.round(kcalJour(jour.repas))} kcal`).toBeLessThanOrEqual(TOLERANCE);
              // Aucune quantité nulle ou négative
              for (const r of jour.repas) for (const q of r.ingredients) expect(q.g).toBeGreaterThan(0);
            }
            // Pas plus de 2 fois la même recette dans la semaine
            for (const [id, n] of usageSemaine(semaine)) expect(n, id).toBeLessThanOrEqual(MAX_REPETITIONS);
          }
          // eslint-disable-next-line no-console
          console.log(`  ${kcalCible} kcal / ${regime} / ${nbRepas} repas → écart max ${(pireEcart * 100).toFixed(1)} %`);
        });
      }
    }
  }

  it('les régimes et exclusions sont respectés', () => {
    const semaine = genererSemaine(
      { kcalCible: 2000, nbRepas: 4, regime: 'vegetarien', exclus: ['oeuf'], budget: 'normal', macros: { prot: 25, gluc: 45, lip: 30 } },
      '2026-11-16', 42,
    );
    for (const j of semaine.jours) {
      for (const r of j.repas) {
        for (const q of r.ingredients) {
          expect(NON_VEGE).not.toContain(q.id);
          expect(q.id).not.toBe('oeuf');
        }
      }
    }
  });
});

describe('Changer un repas', () => {
  it('garde la journée dans ±5 % et respecte la limite de répétition', () => {
    for (const kcalCible of [1500, 2000, 2500]) {
      const opts: OptionsGeneration = {
        kcalCible, nbRepas: 4, regime: 'omnivore', exclus: [], budget: 'normal', macros: { prot: 25, gluc: 45, lip: 30 },
      };
      const semaine = genererSemaine(opts, '2026-11-16', 7);
      for (let j = 0; j < 7; j++) {
        for (let r = 0; r < 4; r++) {
          const nouveau = changerRepas(semaine, j, r, opts, j * 10 + r);
          expect(nouveau).not.toBeNull();
          expect(nouveau!.repas[r].recetteId).not.toBe(semaine.jours[j].repas[r].recetteId);
          const ecart = Math.abs(kcalJour(nouveau!.repas) - kcalCible) / kcalCible;
          expect(ecart).toBeLessThanOrEqual(TOLERANCE);
          const copie = { ...semaine, jours: semaine.jours.map((x, i) => (i === j ? nouveau! : x)) };
          for (const [, n] of usageSemaine(copie)) expect(n).toBeLessThanOrEqual(MAX_REPETITIONS);
        }
      }
    }
  });
});

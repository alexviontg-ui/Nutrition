import { useState } from 'react';
import type { RepasPlanifie } from '../../types';
import { getIngredient } from '../../data/ingredients';
import { LABEL_REPAS } from '../../lib/menuGenerator';
import { macrosDe } from '../../lib/nutrition';
import { fmt0, quantiteLisible } from '../../lib/format';

const COULEUR_REPAS: Record<RepasPlanifie['type'], string> = {
  petitdej: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  dejeuner: 'bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200',
  collation: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
  diner: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
};

export function CarteRepas({ repas, onChanger, imprime = false }: { repas: RepasPlanifie; onChanger?: () => void; imprime?: boolean }) {
  const [ouvert, setOuvert] = useState(false);
  const m = macrosDe(repas.ingredients);
  const detailsVisibles = ouvert || imprime;

  return (
    <article className="card flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${COULEUR_REPAS[repas.type]}`}>
            {LABEL_REPAS[repas.type]}
          </span>
          <h3 className="mt-2 text-base font-semibold leading-snug">{repas.nom}</h3>
          <p className="mt-1 text-sm muted">⏱ {repas.temps} min</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-lg font-bold tabular-nums">{fmt0(m.kcal)}</div>
          <div className="text-xs muted">kcal</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums muted">
        <span>Protéines {fmt0(m.prot)} g</span>
        <span>Glucides {fmt0(m.gluc)} g</span>
        <span>Lipides {fmt0(m.lip)} g</span>
      </div>

      {detailsVisibles && (
        <div className="mt-4 grid gap-4 border-t border-stone-200 pt-4 dark:border-stone-800 sm:grid-cols-2 print:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold">Ingrédients</h4>
            <ul className="space-y-1 text-sm">
              {repas.ingredients.map((q) => {
                const ing = getIngredient(q.id);
                return (
                  <li key={q.id} className="flex justify-between gap-3">
                    <span>{ing.nom}</span>
                    <span className="text-right tabular-nums muted">{quantiteLisible(ing, q.g)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold">Préparation</h4>
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              {repas.etapes.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {!imprime && (
        <div className="mt-4 flex gap-2 print:hidden">
          <button className="btn-secondary flex-1" onClick={() => setOuvert((o) => !o)} aria-expanded={ouvert}>
            {ouvert ? 'Masquer la recette' : 'Voir la recette'}
          </button>
          {onChanger && (
            <button className="btn-ghost border border-transparent" onClick={onChanger} title="Remplacer ce repas en gardant l’équilibre de la journée">
              🔄 Changer
            </button>
          )}
        </div>
      )}
    </article>
  );
}

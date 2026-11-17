import type { RepartitionMacros, RepasPlanifie } from '../../types';
import { grammesMacros, macrosDe, sommeMacros } from '../../lib/nutrition';
import { fmt0 } from '../../lib/format';
import { Jauge } from '../ui';

/** Récapitulatif d'une journée : kcal et macros, avec écart à l'objectif */
export function RecapJour({ repas, kcalCible, macros }: { repas: RepasPlanifie[]; kcalCible: number; macros: RepartitionMacros }) {
  const total = sommeMacros(repas.map((r) => macrosDe(r.ingredients)));
  const cibles = grammesMacros(kcalCible, macros);
  const ecart = total.kcal - kcalCible;
  const ecartPct = (ecart / kcalCible) * 100;
  const ok = Math.abs(ecartPct) <= 5;

  const lignes = [
    { label: 'Protéines', valeur: total.prot, cible: cibles.prot, couleur: 'bg-sky-500' },
    { label: 'Glucides', valeur: total.gluc, cible: cibles.gluc, couleur: 'bg-amber-500' },
    { label: 'Lipides', valeur: total.lip, cible: cibles.lip, couleur: 'bg-rose-400' },
  ];

  return (
    <div className="card grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide muted">Total du jour</div>
        <div className="mt-1 text-3xl font-bold tabular-nums">
          {fmt0(total.kcal)} <span className="text-base font-medium muted">/ {fmt0(kcalCible)} kcal</span>
        </div>
        <div className={`mt-1 text-sm font-medium ${ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
          {ok ? '✓' : '⚠'} Écart : {ecart >= 0 ? '+' : '−'}
          {fmt0(Math.abs(ecart))} kcal ({ecartPct >= 0 ? '+' : '−'}
          {Math.abs(ecartPct).toFixed(1).replace('.', ',')} %)
        </div>
      </div>
      <div className="space-y-2.5">
        {lignes.map((l) => {
          const d = l.valeur - l.cible;
          return (
            <div key={l.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${l.couleur}`} aria-hidden />
                  {l.label}
                </span>
                <span className="tabular-nums">
                  <strong>{fmt0(l.valeur)} g</strong> <span className="muted">/ {l.cible} g ({d >= 0 ? '+' : '−'}{fmt0(Math.abs(d))})</span>
                </span>
              </div>
              <Jauge valeur={l.valeur} max={l.cible} couleur={l.couleur} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from 'react';
import type { RepartitionMacros, SemaineMenu } from '../../types';
import { aujourdhui, dateCourte, dateLongue, jourCourt } from '../../lib/dates';
import { kcalJour } from '../../lib/menuGenerator';
import { fmt0 } from '../../lib/format';
import { RecapJour } from './RecapJour';
import { CarteRepas } from './CarteRepas';

/**
 * Affiche une semaine : sélecteur de jour + détail du jour à l'écran,
 * et TOUS les jours détaillés à l'impression.
 */
export function VueSemaine({ semaine, macros, onChanger }: {
  semaine: SemaineMenu;
  macros: RepartitionMacros;
  onChanger?: (jourIndex: number, repasIndex: number) => void;
}) {
  const indexAujourdhui = semaine.jours.findIndex((j) => j.date === aujourdhui());
  const [jourIndex, setJourIndex] = useState(indexAujourdhui >= 0 ? indexAujourdhui : 0);
  const jour = semaine.jours[jourIndex];

  return (
    <>
      {/* ---------- Écran ---------- */}
      <div className="space-y-4 print:hidden">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="flex min-w-max gap-2 sm:grid sm:min-w-0 sm:grid-cols-7" role="tablist" aria-label="Jours de la semaine">
            {semaine.jours.map((j, i) => {
              const ecart = (kcalJour(j.repas) - semaine.kcalCible) / semaine.kcalCible;
              return (
                <button
                  key={j.date}
                  role="tab"
                  aria-selected={i === jourIndex}
                  onClick={() => setJourIndex(i)}
                  className={`flex min-h-[64px] min-w-[72px] flex-col items-center justify-center rounded-xl border px-2 py-2 text-sm transition ${
                    i === jourIndex
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-stone-200 bg-white hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800'
                  }`}
                >
                  <span className="font-semibold capitalize">{jourCourt(j.date)}</span>
                  <span className={`text-xs ${i === jourIndex ? 'text-brand-50' : 'muted'}`}>{dateCourte(j.date)}</span>
                  <span className={`mt-0.5 text-[11px] tabular-nums ${i === jourIndex ? 'text-brand-50' : 'muted'}`}>
                    {fmt0(kcalJour(j.repas))} kcal {Math.abs(ecart) > 0.05 ? '⚠️' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <h2 className="text-xl font-semibold first-letter:uppercase">{dateLongue(jour.date)}</h2>
        <RecapJour repas={jour.repas} kcalCible={semaine.kcalCible} macros={macros} />
        <div className="grid gap-4 lg:grid-cols-2">
          {jour.repas.map((r, i) => (
            <CarteRepas key={`${jour.date}-${i}-${r.recetteId}`} repas={r} onChanger={onChanger ? () => onChanger(jourIndex, i) : undefined} />
          ))}
        </div>
      </div>

      {/* ---------- Impression : toute la semaine ---------- */}
      <div className="hidden print:block">
        {semaine.jours.map((j, i) => (
          <div key={j.date} className={i > 0 ? 'print-break' : ''}>
            <h2 className="mb-2 text-xl font-bold first-letter:uppercase">{dateLongue(j.date)}</h2>
            <RecapJour repas={j.repas} kcalCible={semaine.kcalCible} macros={macros} />
            <div className="mt-3 space-y-3">
              {j.repas.map((r, k) => (
                <CarteRepas key={k} repas={r} imprime />
              ))}
            </div>
          </div>
        ))}
        <p className="mt-6 text-xs">Valeurs nutritionnelles indicatives.</p>
      </div>
    </>
  );
}

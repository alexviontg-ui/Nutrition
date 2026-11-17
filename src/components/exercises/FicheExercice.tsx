import type { Exercice } from '../../types';
import { GROUPES, NIVEAUX } from '../../data/exercises';
import { Modale } from '../ui';
import { BadgeNiveau } from './ExercicesPage';

/** Extrait une durée en secondes d'un dosage du type « 3 × 30 s » */
function dureeDepuisDosage(dosage: string): number | null {
  const m = dosage.match(/(\d+)\s*s\b/);
  return m ? Number(m[1]) : null;
}

export function FicheExercice({ exercice, onFermer, onMinuteur }: {
  exercice: Exercice | null;
  onFermer: () => void;
  onMinuteur: (secondes: number, libelle: string) => void;
}) {
  const e = exercice;
  return (
    <Modale ouverte={!!e} onFermer={onFermer} titre={e?.nom ?? ''} large>
      {e && (
        <div className="space-y-5 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <BadgeNiveau niveau={e.niveau} />
            {e.groupes.map((g) => (
              <span key={g} className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs dark:bg-stone-800">
                {GROUPES.find((x) => x.id === g)?.label}
              </span>
            ))}
            <span className="text-xs muted">Matériel : {e.materiel}</span>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Exécution</h3>
            <ol className="list-decimal space-y-1.5 pl-5">
              {e.etapes.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="mb-1 font-semibold">Muscles travaillés</h3>
            <p>{e.muscles}</p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Erreurs fréquentes</h3>
            <ul className="space-y-1">
              {e.erreurs.map((x, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden>✗</span>
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Séries conseillées</h3>
            <div className="grid gap-2 sm:grid-cols-3">
              {NIVEAUX.map((n) => {
                const duree = e.mode === 'duree' ? dureeDepuisDosage(e.dosage[n.id]) : null;
                return (
                  <div key={n.id} className="rounded-xl bg-stone-100 p-3 dark:bg-stone-800/70">
                    <div className="text-xs muted">{n.label}</div>
                    <div className="font-semibold">{e.dosage[n.id]}</div>
                    {duree && (
                      <button
                        className="mt-2 text-xs font-medium text-brand-700 underline dark:text-brand-300"
                        onClick={() => {
                          onMinuteur(duree, `${e.nom} — ${duree} s`);
                          onFermer();
                        }}
                      >
                        ⏱ Lancer {duree} s
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 p-3 dark:border-emerald-900">
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Variante plus facile</div>
              <p className="mt-1">{e.facile}</p>
            </div>
            <div className="rounded-xl border border-rose-200 p-3 dark:border-rose-900">
              <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">Variante plus difficile</div>
              <p className="mt-1">{e.difficile}</p>
            </div>
          </div>

          <p className="text-xs muted">Gardez une respiration régulière et arrêtez en cas de douleur.</p>
        </div>
      )}
    </Modale>
  );
}

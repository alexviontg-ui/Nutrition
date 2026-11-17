import type { Exercice } from '../../types';
import { EXERCICES_MAP, PROGRAMMES } from '../../data/exercises';
import { BadgeNiveau } from './ExercicesPage';

export function Programmes({ onOuvrir, onMinuteur }: {
  onOuvrir: (e: Exercice) => void;
  onMinuteur: (secondes: number, libelle: string) => void;
}) {
  return (
    <div className="space-y-4">
      {PROGRAMMES.map((p) => (
        <section key={p.id} className="card">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold">{p.nom}</h3>
              <p className="text-sm muted">
                {p.duree} · {p.frequence}
              </p>
            </div>
            <BadgeNiveau niveau={p.niveau} />
          </div>
          <p className="mt-2 text-sm">{p.description}</p>
          <p className="mt-2 text-xs muted">Toujours commencer par 5 min d’échauffement.</p>
          <ol className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
            {p.etapes.map((etape, i) => {
              const ex = EXERCICES_MAP[etape.exerciceId];
              const duree = etape.consigne.match(/^(\d+)\s*s/)?.[1];
              return (
                <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800 dark:bg-brand-900/50 dark:text-brand-200">
                    {i + 1}
                  </span>
                  <button className="min-h-[40px] flex-1 text-left font-medium underline-offset-2 hover:underline" onClick={() => onOuvrir(ex)}>
                    {ex.nom}
                    <span className="block text-sm font-normal muted">{etape.consigne}</span>
                  </button>
                  <div className="flex gap-2">
                    {duree && (
                      <button className="btn-secondary !min-h-[40px] !px-3 text-xs" onClick={() => onMinuteur(Number(duree), `${ex.nom} — ${duree} s`)}>
                        ⏱ {duree} s
                      </button>
                    )}
                    <button className="btn-ghost !min-h-[40px] !px-3 text-xs" onClick={() => onMinuteur(etape.repos, `Repos — ${etape.repos} s`)}>
                      Repos {etape.repos} s
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

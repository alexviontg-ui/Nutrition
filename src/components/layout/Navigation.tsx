import type { ReactNode } from 'react';
import { IconeCourses, IconeExercices, IconeLune, IconeMenus, IconePoids, IconeProfil, IconeSoleil } from './Icones';

export type OngletId = 'profil' | 'menus' | 'courses' | 'poids' | 'exercices';

export const ONGLETS: { id: OngletId; label: string; court: string; icone: ReactNode }[] = [
  { id: 'profil', label: 'Profil & objectifs', court: 'Profil', icone: <IconeProfil /> },
  { id: 'menus', label: 'Menus de la semaine', court: 'Menus', icone: <IconeMenus /> },
  { id: 'courses', label: 'Liste de courses', court: 'Courses', icone: <IconeCourses /> },
  { id: 'poids', label: 'Suivi du poids', court: 'Poids', icone: <IconePoids /> },
  { id: 'exercices', label: 'Exercices maison', court: 'Exercices', icone: <IconeExercices /> },
];

export function Navigation({ actif, onChange, sombre, onTheme }: {
  actif: OngletId;
  onChange: (id: OngletId) => void;
  sombre: boolean;
  onTheme: () => void;
}) {
  return (
    <>
      {/* Barre latérale (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-stone-200 bg-white px-4 py-6 dark:border-stone-800 dark:bg-stone-900 md:flex print:hidden">
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="text-2xl" aria-hidden>🥗</span>
          <span className="text-lg font-bold tracking-tight">Nutrition & Forme</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Navigation principale">
          {ONGLETS.map((o) => (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              aria-current={actif === o.id ? 'page' : undefined}
              className={`flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition ${
                actif === o.id
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                  : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
              }`}
            >
              {o.icone}
              {o.label}
            </button>
          ))}
        </nav>
        <button onClick={onTheme} className="btn-ghost justify-start">
          {sombre ? <IconeSoleil /> : <IconeLune />}
          {sombre ? 'Mode clair' : 'Mode sombre'}
        </button>
      </aside>

      {/* En-tête compact (mobile) */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white/90 px-4 py-2 backdrop-blur dark:border-stone-800 dark:bg-stone-900/90 md:hidden print:hidden">
        <span className="font-bold">🥗 Nutrition & Forme</span>
        <button onClick={onTheme} className="btn-ghost !px-3" aria-label={sombre ? 'Passer en mode clair' : 'Passer en mode sombre'}>
          {sombre ? <IconeSoleil /> : <IconeLune />}
        </button>
      </div>

      {/* Barre d'onglets en bas (mobile) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-stone-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-stone-800 dark:bg-stone-900 md:hidden print:hidden"
        aria-label="Navigation principale"
      >
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            aria-current={actif === o.id ? 'page' : undefined}
            className={`flex min-h-[64px] flex-col items-center justify-center gap-1 text-[11px] font-medium ${
              actif === o.id ? 'text-brand-600 dark:text-brand-300' : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            {o.icone}
            {o.court}
          </button>
        ))}
      </nav>
    </>
  );
}

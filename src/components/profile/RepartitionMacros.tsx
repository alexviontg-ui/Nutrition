import type { Profil, RepartitionMacros } from '../../types';
import { grammesMacros } from '../../lib/nutrition';
import { ChampNombre } from '../ChampNombre';
import { Alerte, Section } from '../ui';

const DEFAUT: RepartitionMacros = { prot: 25, gluc: 45, lip: 30 };

const LIGNES: { cle: keyof RepartitionMacros; label: string; kcalParG: number; couleur: string }[] = [
  { cle: 'prot', label: 'Protéines', kcalParG: 4, couleur: 'bg-sky-500' },
  { cle: 'gluc', label: 'Glucides', kcalParG: 4, couleur: 'bg-amber-500' },
  { cle: 'lip', label: 'Lipides', kcalParG: 9, couleur: 'bg-rose-400' },
];

export function RepartitionMacrosForm({ profil, onChange }: { profil: Profil; onChange: (p: Partial<Profil>) => void }) {
  const m = profil.macros;
  const total = m.prot + m.gluc + m.lip;
  const g = grammesMacros(profil.kcalCible, m);

  return (
    <Section
      titre="Répartition des macronutriments"
      sousTitre="En % des calories. Utilisée pour le choix des recettes et le récapitulatif."
      actions={
        <button className="btn-ghost !min-h-[36px] text-sm" onClick={() => onChange({ macros: DEFAUT })}>
          Par défaut
        </button>
      }
    >
      <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700" aria-hidden>
        {LIGNES.map((l) => (
          <div key={l.cle} className={`${l.couleur} h-full border-r-2 border-white last:border-r-0 dark:border-stone-900`} style={{ width: `${(m[l.cle] / Math.max(total, 100)) * 100}%` }} />
        ))}
      </div>
      <div className="space-y-3">
        {LIGNES.map((l) => (
          <div key={l.cle} className="grid grid-cols-[1fr_7rem_5rem] items-center gap-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className={`h-3 w-3 rounded-full ${l.couleur}`} aria-hidden />
              {l.label}
            </span>
            <ChampNombre
              ariaLabel={`${l.label} en %`}
              valeur={m[l.cle]}
              min={0}
              max={100}
              suffixe="%"
              onChange={(v) => v !== undefined && onChange({ macros: { ...m, [l.cle]: v } })}
            />
            <span className="text-right text-sm tabular-nums muted">{g[l.cle]} g/j</span>
          </div>
        ))}
      </div>
      {total !== 100 ? (
        <Alerte ton="attention" className="mt-4">
          Le total fait {total} % : il doit être égal à 100 %.
        </Alerte>
      ) : (
        <p className="mt-4 text-xs muted">1 g de protéines ou de glucides = 4 kcal ; 1 g de lipides = 9 kcal.</p>
      )}
    </Section>
  );
}

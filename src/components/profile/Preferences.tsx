import { useState } from 'react';
import type { Profil } from '../../types';
import { INGREDIENTS, INGREDIENTS_MAP } from '../../data/ingredients';
import { Section, Segmente } from '../ui';

const normaliser = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function Preferences({ profil, onChange }: { profil: Profil; onChange: (p: Partial<Profil>) => void }) {
  const [recherche, setRecherche] = useState('');
  const q = normaliser(recherche.trim());
  const suggestions = q
    ? INGREDIENTS.filter((i) => !profil.exclus.includes(i.id) && normaliser(i.nom).includes(q)).slice(0, 6)
    : [];

  const exclure = (id: string) => {
    onChange({ exclus: [...profil.exclus, id] });
    setRecherche('');
  };

  return (
    <Section titre="Préférences alimentaires">
      <div className="space-y-4">
        <div>
          <span className="label">Repas par jour</span>
          <Segmente
            valeur={profil.nbRepas}
            onChange={(nbRepas) => onChange({ nbRepas })}
            options={[{ id: 3, label: '3 repas' }, { id: 4, label: '4 repas (avec collation)' }]}
          />
        </div>
        <div>
          <span className="label">Régime</span>
          <Segmente
            valeur={profil.regime}
            onChange={(regime) => onChange({ regime })}
            options={[{ id: 'omnivore', label: 'Omnivore' }, { id: 'vegetarien', label: 'Végétarien' }]}
          />
        </div>
        <div>
          <span className="label">Budget</span>
          <Segmente
            valeur={profil.budget}
            onChange={(budget) => onChange({ budget })}
            options={[{ id: 'economique', label: 'Économique' }, { id: 'normal', label: 'Normal' }]}
          />
          {profil.budget === 'economique' && <p className="mt-1 text-xs muted">Les recettes les plus coûteuses (saumon…) sont écartées.</p>}
        </div>
        <div>
          <label className="label" htmlFor="exclus">
            Aliments exclus
          </label>
          <div className="relative">
            <input
              id="exclus"
              className="input"
              placeholder="Rechercher un aliment (ex. œuf, champignons…)"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && suggestions[0]) {
                  e.preventDefault();
                  exclure(suggestions[0].id);
                }
              }}
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-800">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <button type="button" className="w-full px-3 py-3 text-left text-sm hover:bg-stone-100 dark:hover:bg-stone-700" onClick={() => exclure(s.id)}>
                      {s.nom}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {profil.exclus.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {profil.exclus.map((id) => (
                <button
                  key={id}
                  className="chip border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
                  onClick={() => onChange({ exclus: profil.exclus.filter((x) => x !== id) })}
                  aria-label={`Retirer ${INGREDIENTS_MAP[id]?.nom ?? id} des exclusions`}
                >
                  {INGREDIENTS_MAP[id]?.nom ?? id} <span className="ml-2" aria-hidden>✕</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-xs muted">Aucun aliment exclu. Les recettes contenant un aliment exclu ne seront pas proposées.</p>
          )}
        </div>
      </div>
    </Section>
  );
}

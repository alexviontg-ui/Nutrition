import type { Profil } from '../../types';
import { cibleSuggeree, depenseTotale, metabolismeBase, NIVEAUX_ACTIVITE, OBJECTIFS, SEUIL_KCAL_MIN } from '../../lib/nutrition';
import { fmt0 } from '../../lib/format';
import { ChampNombre } from '../ChampNombre';
import { Alerte, Section } from '../ui';

export function AlerteKcalBasse({ kcal }: { kcal: number }) {
  if (kcal >= SEUIL_KCAL_MIN) return null;
  return (
    <Alerte ton="danger">
      <strong>Objectif inférieur à {fmt0(SEUIL_KCAL_MIN)} kcal/jour.</strong> Un apport aussi bas peut entraîner des carences
      et une perte musculaire. Il est recommandé de demander l’avis d’un médecin ou d’un diététicien avant de le suivre.
    </Alerte>
  );
}

export function BesoinCalorique({ profil, onChange }: { profil: Profil; onChange: (p: Partial<Profil>) => void }) {
  const mb = metabolismeBase(profil);
  const dt = depenseTotale(profil);
  const sugg = cibleSuggeree(profil);
  const coef = NIVEAUX_ACTIVITE.find((n) => n.id === profil.activite)!.coef;
  const aj = OBJECTIFS.find((o) => o.id === profil.objectif)!.ajustement;

  return (
    <Section titre="Objectif calorique" sousTitre="Le calcul est indicatif : vous gardez la main sur la valeur finale.">
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="kcal-cible">
            Objectif calorique journalier
          </label>
          <ChampNombre
            id="kcal-cible"
            valeur={profil.kcalCible}
            min={800}
            max={6000}
            suffixe="kcal"
            className="text-2xl"
            onChange={(v) => v && onChange({ kcalCible: v, kcalManuel: true })}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {profil.kcalManuel ? (
              <>
                <span className="muted">Valeur personnalisée.</span>
                {profil.kcalCible !== sugg && (
                  <button className="btn-ghost !min-h-[36px] !px-3 text-brand-700 dark:text-brand-300" onClick={() => onChange({ kcalCible: sugg, kcalManuel: false })}>
                    Revenir au calcul ({fmt0(sugg)} kcal)
                  </button>
                )}
              </>
            ) : (
              <span className="muted">Pré-rempli avec le calcul ci-dessous (mis à jour automatiquement).</span>
            )}
          </div>
        </div>

        <AlerteKcalBasse kcal={profil.kcalCible} />

        <div className="rounded-xl bg-stone-100 p-4 text-sm dark:bg-stone-800/70">
          <h3 className="mb-2 font-semibold">Méthode de calcul</h3>
          <ol className="space-y-2">
            <li>
              <strong>1. Métabolisme de base</strong> (Mifflin-St Jeor) :<br />
              <span className="muted">
                10 × {profil.poids} kg + 6,25 × {profil.taille} cm − 5 × {profil.age} ans {profil.sexe === 'homme' ? '+ 5' : '− 161'}
              </span>{' '}
              = <strong>{fmt0(mb)} kcal</strong>
            </li>
            <li>
              <strong>2. Dépense totale</strong> : {fmt0(mb)} × {String(coef).replace('.', ',')} (activité) ={' '}
              <strong>{fmt0(dt)} kcal</strong>
            </li>
            <li>
              <strong>3. Selon l’objectif</strong> : {aj === 0 ? 'aucun ajustement' : `${aj > 0 ? '+' : '−'}${Math.abs(aj * 100)} %`} →{' '}
              <strong>{fmt0(sugg)} kcal/jour</strong> (arrondi à 10 kcal)
            </li>
          </ol>
        </div>
      </div>
    </Section>
  );
}

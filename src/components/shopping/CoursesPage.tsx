import { useMemo, useState } from 'react';
import { useStore } from '../../store';
import { RAYONS } from '../../data/ingredients';
import { genererListe, listeEnTexte } from '../../lib/shoppingList';
import { ajouterJours, dateCourte } from '../../lib/dates';
import { uid } from '../../lib/random';
import { Alerte, EnTetePage } from '../ui';

function CaseACocher({ coche, onChange, children }: { coche: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="flex min-h-[52px] cursor-pointer items-center gap-3 px-1 py-2">
      <input
        type="checkbox"
        checked={coche}
        onChange={onChange}
        className="h-6 w-6 shrink-0 cursor-pointer rounded-md border-stone-300 accent-brand-500"
      />
      <div className={`min-w-0 flex-1 ${coche ? 'line-through opacity-50' : ''}`}>{children}</div>
    </label>
  );
}

export function CoursesPage() {
  const { data, maj } = useStore();
  const semaine = data.semaineCourante;
  const { coches, ajouts } = data.courses;
  const [nouvelArticle, setNouvelArticle] = useState('');
  const [copie, setCopie] = useState(false);

  const lignes = useMemo(() => (semaine ? genererListe(semaine) : []), [semaine]);

  const basculer = (id: string) =>
    maj((d) => ({
      ...d,
      courses: {
        ...d.courses,
        coches: d.courses.coches.includes(id) ? d.courses.coches.filter((x) => x !== id) : [...d.courses.coches, id],
      },
    }));

  const ajouter = () => {
    const label = nouvelArticle.trim();
    if (!label) return;
    maj((d) => ({ ...d, courses: { ...d.courses, ajouts: [...d.courses.ajouts, { id: uid('art'), label }] } }));
    setNouvelArticle('');
  };

  const copier = async () => {
    const texte = listeEnTexte(lignes, ajouts, coches);
    try {
      await navigator.clipboard.writeText(texte);
    } catch {
      // Repli pour les navigateurs sans API presse-papiers
      const t = document.createElement('textarea');
      t.value = texte;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  const nbCoches = lignes.filter((l) => coches.includes(l.id)).length + ajouts.filter((a) => coches.includes(a.id)).length;
  const nbTotal = lignes.length + ajouts.length;

  return (
    <div className="space-y-5">
      <EnTetePage
        titre="Liste de courses"
        description={
          semaine
            ? `Semaine du ${dateCourte(semaine.debut)} au ${dateCourte(ajouterJours(semaine.debut, 6))} · ${nbCoches}/${nbTotal} articles cochés`
            : undefined
        }
        actions={
          <>
            <button className="btn-secondary" onClick={copier} disabled={!nbTotal}>
              {copie ? '✓ Copiée' : '📋 Copier la liste'}
            </button>
            <button className="btn-secondary" onClick={() => window.print()} disabled={!nbTotal}>
              🖨️ Imprimer
            </button>
          </>
        }
      />

      {!semaine && (
        <Alerte ton="info" className="print:hidden">
          Générez d’abord un menu (onglet « Menus ») : la liste sera calculée automatiquement à partir de ses ingrédients.
        </Alerte>
      )}

      {semaine && (
        <p className="text-sm muted print:hidden">
          Quantités additionnées sur les 7 jours. En gras : ce qu’il faut acheter (arrondi au conditionnement) ; en dessous : le besoin exact.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 print:block">
        {RAYONS.map((rayon) => {
          const items = lignes.filter((l) => l.rayon === rayon.id);
          if (!items.length) return null;
          return (
            <section key={rayon.id} className="card print:mb-3">
              <h2 className="h2 mb-1 flex items-center gap-2">
                <span aria-hidden>{rayon.emoji}</span> {rayon.label}
              </h2>
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {items.map((l) => (
                  <li key={l.id}>
                    <CaseACocher coche={coches.includes(l.id)} onChange={() => basculer(l.id)}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <span className="font-medium">{l.nom}</span>
                        <span className="text-sm font-semibold">{l.achat}</span>
                      </div>
                      <div className="text-xs muted">Besoin : {l.besoin}</div>
                    </CaseACocher>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section className="card print:mb-3">
          <h2 className="h2 mb-1 flex items-center gap-2">
            <span aria-hidden>📝</span> Autres articles
          </h2>
          {ajouts.length > 0 && (
            <ul className="divide-y divide-stone-100 dark:divide-stone-800">
              {ajouts.map((a) => (
                <li key={a.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <CaseACocher coche={coches.includes(a.id)} onChange={() => basculer(a.id)}>
                      {a.label}
                    </CaseACocher>
                  </div>
                  <button
                    className="btn-ghost !px-3 print:hidden"
                    aria-label={`Supprimer ${a.label}`}
                    onClick={() =>
                      maj((d) => ({
                        ...d,
                        courses: { ...d.courses, ajouts: d.courses.ajouts.filter((x) => x.id !== a.id), coches: d.courses.coches.filter((x) => x !== a.id) },
                      }))
                    }
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form
            className="mt-3 flex gap-2 print:hidden"
            onSubmit={(e) => {
              e.preventDefault();
              ajouter();
            }}
          >
            <input className="input" placeholder="Ajouter un article (ex. éponges, café…)" value={nouvelArticle} onChange={(e) => setNouvelArticle(e.target.value)} />
            <button className="btn-primary shrink-0" type="submit" disabled={!nouvelArticle.trim()}>
              Ajouter
            </button>
          </form>
        </section>
      </div>

      {nbCoches > 0 && (
        <button className="btn-ghost print:hidden" onClick={() => maj((d) => ({ ...d, courses: { ...d.courses, coches: [] } }))}>
          Tout décocher
        </button>
      )}
    </div>
  );
}

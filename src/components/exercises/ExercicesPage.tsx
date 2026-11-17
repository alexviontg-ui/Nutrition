import { useState } from 'react';
import type { Exercice, GroupeMusculaire, Niveau } from '../../types';
import { EXERCICES, GROUPES, NIVEAUX } from '../../data/exercises';
import { Alerte, EnTetePage, Segmente } from '../ui';
import { FicheExercice } from './FicheExercice';
import { Programmes } from './Programmes';
import { Minuteur, type DemandeMinuteur } from './Minuteur';

const LABEL_NIVEAU: Record<Niveau, string> = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' };
const COULEUR_NIVEAU: Record<Niveau, string> = {
  debutant: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  intermediaire: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  avance: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
};

export function BadgeNiveau({ niveau }: { niveau: Niveau }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${COULEUR_NIVEAU[niveau]}`}>{LABEL_NIVEAU[niveau]}</span>;
}

export function ExercicesPage() {
  const [vue, setVue] = useState<'bibliotheque' | 'programmes'>('bibliotheque');
  const [groupe, setGroupe] = useState<GroupeMusculaire | 'tous'>('tous');
  const [niveau, setNiveau] = useState<Niveau | 'tous'>('tous');
  const [fiche, setFiche] = useState<Exercice | null>(null);
  const [demande, setDemande] = useState<DemandeMinuteur | null>(null);

  const lancerMinuteur = (secondes: number, libelle: string) => setDemande({ secondes, libelle, id: Date.now() });

  const filtres = EXERCICES.filter((e) => (groupe === 'tous' || e.groupes.includes(groupe)) && (niveau === 'tous' || e.niveau === niveau));

  return (
    <div className="space-y-5">
      <EnTetePage titre="Exercices maison" description="Au poids du corps, sans matériel ou avec une chaise et des bouteilles d’eau." />

      <Alerte ton="attention">
        <strong>Échauffez-vous 5 minutes</strong> avant chaque séance (marche sur place, rotations des bras et des chevilles, montées de genoux).{' '}
        <strong>Arrêtez immédiatement en cas de douleur</strong>, de vertige ou d’essoufflement inhabituel. En cas de problème de santé, demandez l’avis d’un médecin
        avant de commencer.
      </Alerte>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Segmente
            valeur={vue}
            onChange={setVue}
            options={[{ id: 'bibliotheque', label: `Bibliothèque (${EXERCICES.length})` }, { id: 'programmes', label: 'Programmes' }]}
          />

          {vue === 'bibliotheque' ? (
            <>
              <div className="card space-y-3">
                <div>
                  <span className="label">Groupe musculaire</span>
                  <div className="-mx-1 flex flex-wrap gap-2 px-1">
                    <button className={groupe === 'tous' ? 'chip-on' : 'chip-off'} onClick={() => setGroupe('tous')}>
                      Tous
                    </button>
                    {GROUPES.map((g) => (
                      <button key={g.id} className={groupe === g.id ? 'chip-on' : 'chip-off'} onClick={() => setGroupe(g.id)}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="label">Niveau</span>
                  <Segmente
                    valeur={niveau}
                    onChange={setNiveau}
                    options={[{ id: 'tous' as const, label: 'Tous' }, ...NIVEAUX.map((n) => ({ id: n.id, label: n.label }))]}
                  />
                </div>
              </div>

              {filtres.length === 0 ? (
                <p className="card text-center text-sm muted">Aucun exercice ne correspond à ces filtres.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filtres.map((e) => (
                    <button key={e.id} onClick={() => setFiche(e)} className="card text-left transition hover:border-brand-300 hover:shadow-md">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{e.nom}</h3>
                        <BadgeNiveau niveau={e.niveau} />
                      </div>
                      <p className="mt-1 text-sm muted">{e.groupes.map((g) => GROUPES.find((x) => x.id === g)?.label).join(' · ')}</p>
                      <p className="mt-2 text-xs muted">
                        {e.materiel} · {e.mode === 'duree' ? 'En durée' : 'En répétitions'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Programmes onOuvrir={setFiche} onMinuteur={lancerMinuteur} />
          )}
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Minuteur demande={demande} />
        </aside>
      </div>

      <FicheExercice exercice={fiche} onFermer={() => setFiche(null)} onMinuteur={lancerMinuteur} />
    </div>
  );
}

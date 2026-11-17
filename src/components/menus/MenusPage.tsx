import { useState } from 'react';
import { useStore } from '../../store';
import type { SemaineMenu } from '../../types';
import { changerRepas, genererSemaine, type OptionsGeneration } from '../../lib/menuGenerator';
import { ajouterJours, dateCourte, lundiDe } from '../../lib/dates';
import { fmt0 } from '../../lib/format';
import { Alerte, Confirmation, EnTetePage, Segmente } from '../ui';
import { AlerteKcalBasse } from '../profile/BesoinCalorique';
import { VueSemaine } from './VueSemaine';
import { HistoriqueMenus } from './HistoriqueMenus';

export function MenusPage() {
  const { data, maj } = useStore();
  const { profil, semaineCourante } = data;
  const [quand, setQuand] = useState<'cette' | 'prochaine'>('cette');
  const [confirmer, setConfirmer] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const totalMacros = profil.macros.prot + profil.macros.gluc + profil.macros.lip;
  const options = (kcalCible = profil.kcalCible): OptionsGeneration => ({
    kcalCible,
    nbRepas: profil.nbRepas,
    regime: profil.regime,
    exclus: profil.exclus,
    budget: profil.budget,
    macros: profil.macros,
  });

  const generer = () => {
    setConfirmer(false);
    setErreur(null);
    try {
      const lundi = lundiDe(new Date());
      const debut = quand === 'cette' ? lundi : ajouterJours(lundi, 7);
      const nouvelle = genererSemaine(options(), debut);
      maj((d) => ({
        ...d,
        historique: d.semaineCourante ? [d.semaineCourante, ...d.historique].slice(0, 20) : d.historique,
        semaineCourante: nouvelle,
        courses: { semaineId: nouvelle.id, coches: [], ajouts: d.courses.ajouts },
      }));
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'La génération a échoué.');
    }
  };

  const changer = (jourIndex: number, repasIndex: number) => {
    if (!semaineCourante) return;
    setErreur(null);
    const opts = { ...options(semaineCourante.kcalCible), nbRepas: semaineCourante.nbRepas };
    const jour = changerRepas(semaineCourante, jourIndex, repasIndex, opts);
    if (!jour) {
      setErreur('Aucune autre recette compatible ne permet de garder l’équilibre de cette journée.');
      return;
    }
    maj((d) => {
      if (!d.semaineCourante) return d;
      const jours = d.semaineCourante.jours.map((j, i) => (i === jourIndex ? jour : j));
      return { ...d, semaineCourante: { ...d.semaineCourante, jours } };
    });
  };

  const restaurer = (s: SemaineMenu) =>
    maj((d) => ({
      ...d,
      historique: [...(d.semaineCourante ? [d.semaineCourante] : []), ...d.historique.filter((h) => h.id !== s.id)],
      semaineCourante: s,
      courses: { semaineId: s.id, coches: [], ajouts: d.courses.ajouts },
    }));

  const lundi = lundiDe(new Date());

  return (
    <div className="space-y-5">
      <EnTetePage
        titre="Menus de la semaine"
        description={`Objectif : ${fmt0(profil.kcalCible)} kcal/jour · ${profil.nbRepas} repas · ${profil.regime === 'vegetarien' ? 'végétarien' : 'omnivore'}`}
        actions={
          semaineCourante && (
            <button className="btn-secondary" onClick={() => window.print()}>
              🖨️ Imprimer / PDF
            </button>
          )
        }
      />

      <div className="card space-y-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <Segmente
            label="Semaine à générer"
            valeur={quand}
            onChange={setQuand}
            options={[
              { id: 'cette', label: `Cette semaine (${dateCourte(lundi)})` },
              { id: 'prochaine', label: `Semaine prochaine (${dateCourte(ajouterJours(lundi, 7))})` },
            ]}
          />
        </div>
        <button
          className="btn-primary w-full sm:w-auto"
          disabled={totalMacros !== 100}
          onClick={() => (semaineCourante ? setConfirmer(true) : generer())}
        >
          ✨ Générer le menu de la semaine
        </button>
        {totalMacros !== 100 && <Alerte ton="attention">La répartition des macros doit faire 100 % (onglet Profil).</Alerte>}
        <AlerteKcalBasse kcal={profil.kcalCible} />
        {erreur && <Alerte ton="danger">{erreur}</Alerte>}
      </div>

      {semaineCourante ? (
        <>
          {semaineCourante.kcalCible !== profil.kcalCible && (
            <Alerte ton="info" className="print:hidden">
              Ce menu a été généré pour {fmt0(semaineCourante.kcalCible)} kcal/jour. Votre objectif actuel est de {fmt0(profil.kcalCible)} kcal :
              régénérez le menu pour l’appliquer.
            </Alerte>
          )}
          <VueSemaine semaine={semaineCourante} macros={profil.macros} onChanger={changer} />
        </>
      ) : (
        <div className="card py-12 text-center">
          <div className="text-4xl" aria-hidden>🍽️</div>
          <p className="mt-3 font-medium">Aucun menu pour le moment</p>
          <p className="mt-1 text-sm muted">Vérifiez votre profil, puis cliquez sur « Générer le menu de la semaine ».</p>
        </div>
      )}

      <HistoriqueMenus
        historique={data.historique}
        macros={profil.macros}
        onRestaurer={restaurer}
        onSupprimer={(id) => maj((d) => ({ ...d, historique: d.historique.filter((h) => h.id !== id) }))}
      />

      <Confirmation
        ouverte={confirmer}
        titre="Générer un nouveau menu ?"
        message="Le menu actuel sera conservé dans l’historique et la liste de courses sera recalculée."
        libelle="Générer"
        onAnnuler={() => setConfirmer(false)}
        onConfirmer={generer}
      />
    </div>
  );
}

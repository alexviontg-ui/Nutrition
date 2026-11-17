import { useState } from 'react';
import { useStore } from '../../store';
import type { Pesee } from '../../types';
import { statsPoids, trierPesees } from '../../lib/weightStats';
import { categorieImc, imc } from '../../lib/nutrition';
import { dateCourte, parseISODate } from '../../lib/dates';
import { fmt1 } from '../../lib/format';
import { Confirmation, EnTetePage, Section, Tuile } from '../ui';
import { FormulairePesee } from './FormulairePesee';
import { GraphiquePoids } from './GraphiquePoids';

const signe = (v: number | null, unite = 'kg') => (v === null ? '—' : `${v > 0 ? '+' : v < 0 ? '−' : ''}${fmt1(Math.abs(v))} ${unite}`);

export function PoidsPage() {
  const { data, maj } = useStore();
  const { pesees, profil } = data;
  const [edition, setEdition] = useState<Pesee | null>(null);
  const [aSupprimer, setASupprimer] = useState<Pesee | null>(null);

  const stats = statsPoids(pesees);
  const valeurImc = stats.actuel ? imc(stats.actuel, profil.taille) : null;
  const triees = trierPesees(pesees);
  const derniereTaille = [...triees].reverse().find((p) => p.tourTaille)?.tourTaille;
  const premiereTaille = triees.find((p) => p.tourTaille)?.tourTaille;

  /** Enregistre une pesée ; si c'est la plus récente, met aussi à jour le poids du profil */
  const enregistrer = (p: Pesee) => {
    maj((d) => {
      const autres = d.pesees.filter((x) => x.id !== p.id);
      const nouvelles = [...autres, p];
      const plusRecente = trierPesees(nouvelles).at(-1)!;
      return { ...d, pesees: nouvelles, profil: { ...d.profil, poids: plusRecente.poids } };
    });
    setEdition(null);
  };

  return (
    <div className="space-y-5">
      <EnTetePage titre="Suivi du poids" description="Pesez-vous idéalement le matin, à jeun, dans les mêmes conditions." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Tuile label="Départ" valeur={stats.depart ? `${fmt1(stats.depart)} kg` : '—'} detail={triees[0] && dateCourte(triees[0].date)} />
        <Tuile label="Actuel" valeur={stats.actuel ? `${fmt1(stats.actuel)} kg` : '—'} detail={triees.at(-1) && dateCourte(triees.at(-1)!.date)} />
        <Tuile label="Variation totale" valeur={signe(stats.variationTotale)} />
        <Tuile label="Sur 7 jours" valeur={signe(stats.variation7)} />
        <Tuile label="Sur 30 jours" valeur={signe(stats.variation30)} />
        <Tuile label="IMC" valeur={valeurImc ? fmt1(valeurImc) : '—'} detail={valeurImc ? categorieImc(valeurImc) : `Taille : ${profil.taille} cm`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Section
          titre="Évolution"
          sousTitre={profil.poidsObjectif ? `Objectif : ${fmt1(profil.poidsObjectif)} kg` : 'Ajoutez un poids objectif dans l’onglet Profil pour l’afficher.'}
        >
          <GraphiquePoids pesees={pesees} objectif={profil.poidsObjectif} />
        </Section>
        <Section titre={edition ? 'Modifier la pesée' : 'Nouvelle pesée'}>
          <FormulairePesee key={edition?.id ?? 'nouveau'} initial={edition} onValider={enregistrer} onAnnuler={edition ? () => setEdition(null) : undefined} />
        </Section>
      </div>

      {derniereTaille && (
        <Section titre="Tour de taille">
          <p className="text-sm">
            Actuel : <strong>{fmt1(derniereTaille)} cm</strong>
            {premiereTaille && premiereTaille !== derniereTaille && <> · variation depuis le début : <strong>{signe(derniereTaille - premiereTaille, 'cm')}</strong></>}
          </p>
        </Section>
      )}

      {triees.length > 0 && (
        <Section titre="Historique des pesées">
          <div className="-mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left muted dark:border-stone-800">
                  <th className="px-4 py-2 font-medium sm:px-2">Date</th>
                  <th className="px-2 py-2 text-right font-medium">Poids</th>
                  <th className="px-2 py-2 text-right font-medium">Tour de taille</th>
                  <th className="px-2 py-2 font-medium">Commentaire</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {[...triees].reverse().map((p) => (
                  <tr key={p.id} className="border-b border-stone-100 dark:border-stone-800/60">
                    <td className="px-4 py-2 sm:px-2">{parseISODate(p.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-2 py-2 text-right font-medium tabular-nums">{fmt1(p.poids)} kg</td>
                    <td className="px-2 py-2 text-right tabular-nums">{p.tourTaille ? `${fmt1(p.tourTaille)} cm` : '—'}</td>
                    <td className="max-w-[16rem] truncate px-2 py-2 muted">{p.commentaire}</td>
                    <td className="whitespace-nowrap px-2 py-1 text-right">
                      <button className="btn-ghost !min-h-[40px] !px-3" onClick={() => setEdition(p)} aria-label="Modifier">
                        ✏️
                      </button>
                      <button className="btn-ghost !min-h-[40px] !px-3" onClick={() => setASupprimer(p)} aria-label="Supprimer">
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <Confirmation
        ouverte={!!aSupprimer}
        titre="Supprimer cette pesée ?"
        message={aSupprimer && `Pesée du ${parseISODate(aSupprimer.date).toLocaleDateString('fr-FR')} : ${fmt1(aSupprimer.poids)} kg.`}
        libelle="Supprimer"
        danger
        onAnnuler={() => setASupprimer(null)}
        onConfirmer={() => {
          if (aSupprimer) maj((d) => ({ ...d, pesees: d.pesees.filter((x) => x.id !== aSupprimer.id) }));
          if (edition?.id === aSupprimer?.id) setEdition(null);
          setASupprimer(null);
        }}
      />
    </div>
  );
}

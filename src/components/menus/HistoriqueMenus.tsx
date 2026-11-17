import { useState } from 'react';
import type { RepartitionMacros, SemaineMenu } from '../../types';
import { ajouterJours, dateCourte } from '../../lib/dates';
import { fmt0 } from '../../lib/format';
import { Confirmation, Modale, Section } from '../ui';
import { VueSemaine } from './VueSemaine';

export function HistoriqueMenus({ historique, macros, onRestaurer, onSupprimer }: {
  historique: SemaineMenu[];
  macros: RepartitionMacros;
  onRestaurer: (s: SemaineMenu) => void;
  onSupprimer: (id: string) => void;
}) {
  const [vue, setVue] = useState<SemaineMenu | null>(null);
  const [aSupprimer, setASupprimer] = useState<SemaineMenu | null>(null);
  if (!historique.length) return null;

  return (
    <Section titre="Historique des menus" sousTitre="Les semaines précédemment générées." className="print:hidden">
      <ul className="divide-y divide-stone-200 dark:divide-stone-800">
        {historique.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
            <div>
              <div className="font-medium">
                Semaine du {dateCourte(s.debut)} au {dateCourte(ajouterJours(s.debut, 6))}
              </div>
              <div className="text-sm muted">
                {fmt0(s.kcalCible)} kcal/jour · {s.nbRepas} repas · créé le {new Date(s.creeLe).toLocaleDateString('fr-FR')}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary !min-h-[40px]" onClick={() => setVue(s)}>
                Voir
              </button>
              <button className="btn-ghost !min-h-[40px]" onClick={() => onRestaurer(s)}>
                Réutiliser
              </button>
              <button className="btn-ghost !min-h-[40px] text-rose-600 dark:text-rose-400" onClick={() => setASupprimer(s)} aria-label="Supprimer cette semaine">
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Modale ouverte={!!vue} onFermer={() => setVue(null)} titre={vue ? `Semaine du ${dateCourte(vue.debut)}` : ''} large>
        {vue && <VueSemaine semaine={vue} macros={macros} />}
      </Modale>
      <Confirmation
        ouverte={!!aSupprimer}
        titre="Supprimer cette semaine ?"
        message="Ce menu sera retiré de l’historique."
        libelle="Supprimer"
        danger
        onAnnuler={() => setASupprimer(null)}
        onConfirmer={() => {
          if (aSupprimer) onSupprimer(aSupprimer.id);
          setASupprimer(null);
        }}
      />
    </Section>
  );
}

import { useStore } from '../../store';
import type { Profil } from '../../types';
import { cibleSuggeree } from '../../lib/nutrition';
import { EnTetePage } from '../ui';
import { InfosPersonnelles } from './InfosPersonnelles';
import { BesoinCalorique } from './BesoinCalorique';
import { RepartitionMacrosForm } from './RepartitionMacros';
import { Preferences } from './Preferences';
import { GestionDonnees } from './GestionDonnees';

const CHAMPS_CALCUL: (keyof Profil)[] = ['sexe', 'age', 'taille', 'poids', 'activite', 'objectif'];

export function ProfilPage() {
  const { data, maj } = useStore();
  const profil = data.profil;

  /** Met à jour le profil ; recalcule l'objectif tant qu'il n'a pas été saisi manuellement */
  const majProfil = (patch: Partial<Profil>) =>
    maj((d) => {
      const p = { ...d.profil, ...patch };
      const touchesCalcul = Object.keys(patch).some((k) => CHAMPS_CALCUL.includes(k as keyof Profil));
      if (touchesCalcul && !p.kcalManuel) p.kcalCible = cibleSuggeree(p);
      return { ...d, profil: p };
    });

  return (
    <div className="space-y-5">
      <EnTetePage titre="Profil & objectifs" description="Vos informations servent à calculer un besoin calorique indicatif et à générer les menus." />
      <div className="grid gap-5 lg:grid-cols-2">
        <InfosPersonnelles profil={profil} onChange={majProfil} />
        <BesoinCalorique profil={profil} onChange={majProfil} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <RepartitionMacrosForm profil={profil} onChange={majProfil} />
        <Preferences profil={profil} onChange={majProfil} />
      </div>
      <GestionDonnees />
    </div>
  );
}

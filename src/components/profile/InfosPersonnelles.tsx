import type { Profil } from '../../types';
import { NIVEAUX_ACTIVITE, OBJECTIFS } from '../../lib/nutrition';
import { ChampNombre } from '../ChampNombre';
import { Champ, Section, Segmente } from '../ui';

export function InfosPersonnelles({ profil, onChange }: { profil: Profil; onChange: (p: Partial<Profil>) => void }) {
  return (
    <Section titre="Mes informations">
      <div className="space-y-4">
        <div>
          <span className="label">Sexe</span>
          <Segmente
            label="Sexe"
            valeur={profil.sexe}
            onChange={(sexe) => onChange({ sexe })}
            options={[{ id: 'femme', label: 'Femme' }, { id: 'homme', label: 'Homme' }]}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Champ label="Âge">
            <ChampNombre valeur={profil.age} min={15} max={100} suffixe="ans" onChange={(v) => v && onChange({ age: v })} />
          </Champ>
          <Champ label="Taille">
            <ChampNombre valeur={profil.taille} min={120} max={230} suffixe="cm" onChange={(v) => v && onChange({ taille: v })} />
          </Champ>
          <Champ label="Poids">
            <ChampNombre valeur={profil.poids} min={30} max={300} pas={0.1} suffixe="kg" onChange={(v) => v && onChange({ poids: v })} />
          </Champ>
        </div>
        <Champ label="Niveau d’activité" aide={NIVEAUX_ACTIVITE.find((n) => n.id === profil.activite)?.desc}>
          <select className="input" value={profil.activite} onChange={(e) => onChange({ activite: e.target.value as Profil['activite'] })}>
            {NIVEAUX_ACTIVITE.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label} (× {String(n.coef).replace('.', ',')})
              </option>
            ))}
          </select>
        </Champ>
        <div>
          <span className="label">Objectif</span>
          <Segmente
            label="Objectif"
            valeur={profil.objectif}
            onChange={(objectif) => onChange({ objectif })}
            options={OBJECTIFS.map((o) => ({ id: o.id, label: o.label }))}
          />
        </div>
        <Champ label="Poids objectif (optionnel)" aide="Affiché sur le graphique du suivi du poids.">
          <ChampNombre
            valeur={profil.poidsObjectif}
            min={30}
            max={300}
            pas={0.1}
            suffixe="kg"
            onChange={(v) => onChange({ poidsObjectif: v })}
          />
        </Champ>
      </div>
    </Section>
  );
}

import { useState } from 'react';
import type { Pesee } from '../../types';
import { aujourdhui } from '../../lib/dates';
import { uid } from '../../lib/random';
import { ChampNombre } from '../ChampNombre';
import { Champ } from '../ui';

export function FormulairePesee({ initial, onValider, onAnnuler }: {
  initial: Pesee | null;
  onValider: (p: Pesee) => void;
  onAnnuler?: () => void;
}) {
  const [date, setDate] = useState(initial?.date ?? aujourdhui());
  const [poids, setPoids] = useState<number | undefined>(initial?.poids);
  const [tourTaille, setTourTaille] = useState<number | undefined>(initial?.tourTaille);
  const [commentaire, setCommentaire] = useState(initial?.commentaire ?? '');

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!poids || !date) return;
        onValider({ id: initial?.id ?? uid('pesee'), date, poids, tourTaille, commentaire: commentaire.trim() || undefined });
        if (!initial) {
          setPoids(undefined);
          setTourTaille(undefined);
          setCommentaire('');
        }
      }}
    >
      <Champ label="Date">
        <input type="date" className="input" value={date} max={aujourdhui()} onChange={(e) => setDate(e.target.value)} required />
      </Champ>
      <div className="grid grid-cols-2 gap-3">
        <Champ label="Poids *">
          <ChampNombre valeur={poids} onChange={setPoids} min={30} max={300} pas={0.1} suffixe="kg" />
        </Champ>
        <Champ label="Tour de taille">
          <ChampNombre valeur={tourTaille} onChange={setTourTaille} min={40} max={200} pas={0.5} suffixe="cm" />
        </Champ>
      </div>
      <Champ label="Commentaire (optionnel)">
        <input className="input" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Ex. après les vacances" maxLength={120} />
      </Champ>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1" disabled={!poids}>
          {initial ? 'Enregistrer' : 'Ajouter la pesée'}
        </button>
        {onAnnuler && (
          <button type="button" className="btn-secondary" onClick={onAnnuler}>
            Annuler
          </button>
        )}
      </div>
      <p className="text-xs muted">La pesée la plus récente met à jour le poids de votre profil.</p>
    </form>
  );
}

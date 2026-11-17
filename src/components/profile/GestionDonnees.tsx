import { useRef, useState } from 'react';
import { useStore } from '../../store';
import { donneesParDefaut, exporterJSON, importerJSON } from '../../lib/storage';
import { Alerte, Confirmation, Section } from '../ui';

export function GestionDonnees() {
  const { data, remplacer } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ton: 'succes' | 'danger'; texte: string } | null>(null);
  const [confirmerReset, setConfirmerReset] = useState(false);

  const onImport = async (f: File | undefined) => {
    if (!f) return;
    try {
      remplacer(await importerJSON(f));
      setMessage({ ton: 'succes', texte: 'Données importées avec succès.' });
    } catch (e) {
      setMessage({ ton: 'danger', texte: e instanceof Error ? e.message : 'Fichier illisible.' });
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Section titre="Mes données" sousTitre="Tout est enregistré dans ce navigateur uniquement. Pensez à faire des sauvegardes.">
      <div className="flex flex-wrap gap-2">
        <button className="btn-secondary" onClick={() => exporterJSON(data)}>
          ⬇️ Exporter (JSON)
        </button>
        <button className="btn-secondary" onClick={() => inputRef.current?.click()}>
          ⬆️ Importer une sauvegarde
        </button>
        <input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => onImport(e.target.files?.[0])} />
        <button className="btn-ghost text-rose-600 dark:text-rose-400" onClick={() => setConfirmerReset(true)}>
          Réinitialiser toutes les données
        </button>
      </div>
      {message && (
        <Alerte ton={message.ton} className="mt-4">
          {message.texte}
        </Alerte>
      )}
      <Confirmation
        ouverte={confirmerReset}
        titre="Tout réinitialiser ?"
        message={
          <>
            Le profil, les menus, l’historique, la liste de courses et toutes les pesées seront <strong>définitivement effacés</strong> de cet
            appareil. Exportez une sauvegarde avant si vous souhaitez les conserver.
          </>
        }
        libelle="Tout effacer"
        danger
        onAnnuler={() => setConfirmerReset(false)}
        onConfirmer={() => {
          remplacer({ ...donneesParDefaut(), theme: data.theme });
          setConfirmerReset(false);
          setMessage({ ton: 'succes', texte: 'Toutes les données ont été réinitialisées.' });
        }}
      />
    </Section>
  );
}

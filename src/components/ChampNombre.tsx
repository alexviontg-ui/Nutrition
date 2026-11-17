import { useEffect, useState } from 'react';

/**
 * Champ numérique tolérant la saisie (champ vide, virgule décimale).
 * La valeur n'est transmise que lorsqu'elle est valide et dans les bornes.
 */
export function ChampNombre({ valeur, onChange, min, max, pas = 1, suffixe, id, className = '', ariaLabel }: {
  valeur: number | undefined;
  onChange: (v: number | undefined) => void;
  min?: number;
  max?: number;
  pas?: number;
  suffixe?: string;
  id?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const [texte, setTexte] = useState(valeur === undefined ? '' : String(valeur).replace('.', ','));

  useEffect(() => {
    const courant = parseFloat(texte.replace(',', '.'));
    if (valeur !== courant && !(valeur === undefined && texte === '')) {
      setTexte(valeur === undefined ? '' : String(valeur).replace('.', ','));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valeur]);

  const invalide = (() => {
    if (texte.trim() === '') return false;
    const n = parseFloat(texte.replace(',', '.'));
    return Number.isNaN(n) || (min !== undefined && n < min) || (max !== undefined && n > max);
  })();

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        aria-label={ariaLabel}
        inputMode={pas < 1 ? 'decimal' : 'numeric'}
        className={`input tabular-nums ${suffixe ? 'pr-14' : ''} ${invalide ? '!border-rose-400' : ''}`}
        value={texte}
        aria-invalid={invalide}
        onChange={(e) => {
          const t = e.target.value.replace(/[^0-9.,-]/g, '');
          setTexte(t);
          if (t.trim() === '') return onChange(undefined);
          const n = parseFloat(t.replace(',', '.'));
          if (!Number.isNaN(n) && (min === undefined || n >= min) && (max === undefined || n <= max)) onChange(n);
        }}
      />
      {suffixe && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm muted">{suffixe}</span>}
    </div>
  );
}

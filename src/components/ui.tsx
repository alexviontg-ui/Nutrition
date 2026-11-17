import { useEffect, type ReactNode } from 'react';

// Petits composants d'interface réutilisables

export function Section({ titre, sousTitre, actions, children, className = '' }: {
  titre: string;
  sousTitre?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="h2">{titre}</h2>
          {sousTitre && <p className="mt-0.5 text-sm muted">{sousTitre}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export function EnTetePage({ titre, description, actions }: { titre: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{titre}</h1>
        {description && <p className="mt-1 muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 print:hidden">{actions}</div>}
    </header>
  );
}

/** Groupe de boutons à choix unique */
export function Segmente<T extends string | number>({ options, valeur, onChange, label }: {
  options: { id: T; label: string }[];
  valeur: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={String(o.id)}
          type="button"
          role="radio"
          aria-checked={valeur === o.id}
          onClick={() => onChange(o.id)}
          className={valeur === o.id ? 'chip-on' : 'chip-off'}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Champ({ label, children, aide }: { label: string; children: ReactNode; aide?: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {aide && <span className="mt-1 block text-xs muted">{aide}</span>}
    </label>
  );
}

type TonAlerte = 'info' | 'attention' | 'danger' | 'succes';
const TONS: Record<TonAlerte, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-100',
  attention: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100',
  danger: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-100',
  succes: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100',
};
const ICONES: Record<TonAlerte, string> = { info: 'ℹ️', attention: '⚠️', danger: '⛔', succes: '✅' };

export function Alerte({ ton = 'info', children, className = '' }: { ton?: TonAlerte; children: ReactNode; className?: string }) {
  return (
    <div role={ton === 'danger' ? 'alert' : 'status'} className={`flex gap-3 rounded-xl border p-3 text-sm ${TONS[ton]} ${className}`}>
      <span aria-hidden>{ICONES[ton]}</span>
      <div>{children}</div>
    </div>
  );
}

export function Tuile({ label, valeur, detail }: { label: string; valeur: ReactNode; detail?: ReactNode }) {
  return (
    <div className="rounded-xl bg-stone-100 p-3 dark:bg-stone-800/70">
      <div className="text-xs font-medium uppercase tracking-wide muted">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{valeur}</div>
      {detail && <div className="mt-0.5 text-xs muted">{detail}</div>}
    </div>
  );
}

export function Modale({ ouverte, onFermer, titre, children, large = false }: {
  ouverte: boolean;
  onFermer: () => void;
  titre: string;
  children: ReactNode;
  large?: boolean;
}) {
  useEffect(() => {
    if (!ouverte) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onFermer();
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [ouverte, onFermer]);

  if (!ouverte) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4 print:hidden" onClick={onFermer}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl dark:bg-stone-900 sm:rounded-3xl ${large ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold">{titre}</h2>
          <button onClick={onFermer} className="btn-ghost -mr-2 -mt-2 !min-h-[40px] !px-3" aria-label="Fermer">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Confirmation({ ouverte, titre, message, libelle = 'Confirmer', danger = false, onConfirmer, onAnnuler }: {
  ouverte: boolean;
  titre: string;
  message: ReactNode;
  libelle?: string;
  danger?: boolean;
  onConfirmer: () => void;
  onAnnuler: () => void;
}) {
  return (
    <Modale ouverte={ouverte} onFermer={onAnnuler} titre={titre}>
      <div className="text-sm text-stone-600 dark:text-stone-300">{message}</div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button className="btn-secondary" onClick={onAnnuler}>
          Annuler
        </button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirmer}>
          {libelle}
        </button>
      </div>
    </Modale>
  );
}

/** Barre de progression simple (ex. kcal consommées / cible) */
export function Jauge({ valeur, max, couleur = 'bg-brand-500' }: { valeur: number; max: number; couleur?: string }) {
  const pct = Math.max(0, Math.min(100, (valeur / max) * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
      <div className={`h-full rounded-full ${couleur}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

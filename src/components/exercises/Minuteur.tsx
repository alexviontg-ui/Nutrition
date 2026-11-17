import { useEffect, useRef, useState } from 'react';

export interface DemandeMinuteur {
  secondes: number;
  libelle: string;
  id: number; // change à chaque demande pour relancer le minuteur
}

const PRESETS = [20, 30, 45, 60, 90];

/** Petit bip via Web Audio (aucun fichier son nécessaire) */
function bip(frequence = 880, duree = 0.15) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequence;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duree);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duree);
    osc.onended = () => ctx.close();
  } catch {
    /* audio indisponible */
  }
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function Minuteur({ demande }: { demande: DemandeMinuteur | null }) {
  const [duree, setDuree] = useState(30);
  const [reste, setReste] = useState(30);
  const [actif, setActif] = useState(false);
  const [libelle, setLibelle] = useState('Minuteur');
  const finRef = useRef<number>(0);

  // Démarrage automatique quand une demande arrive (programme, fiche exercice)
  useEffect(() => {
    if (!demande) return;
    setDuree(demande.secondes);
    setReste(demande.secondes);
    setLibelle(demande.libelle);
    finRef.current = Date.now() + demande.secondes * 1000;
    setActif(true);
  }, [demande]);

  // Décompte basé sur l'heure de fin (reste précis même si l'onglet ralentit)
  useEffect(() => {
    if (!actif) return;
    const t = window.setInterval(() => {
      const r = Math.max(0, Math.ceil((finRef.current - Date.now()) / 1000));
      setReste((avant) => {
        if (r !== avant && r > 0 && r <= 3) bip(660, 0.1);
        return r;
      });
      if (r === 0) {
        setActif(false);
        bip(880, 0.5);
        navigator.vibrate?.([200, 100, 200]);
      }
    }, 200);
    return () => window.clearInterval(t);
  }, [actif]);

  const demarrer = () => {
    const depart = reste > 0 ? reste : duree;
    setReste(depart);
    finRef.current = Date.now() + depart * 1000;
    setActif(true);
  };

  const choisir = (s: number) => {
    setActif(false);
    setDuree(s);
    setReste(s);
    setLibelle('Minuteur');
  };

  const ajuster = (delta: number) => {
    const n = Math.max(5, Math.min(600, duree + delta));
    choisir(n);
  };

  const progression = duree > 0 ? reste / duree : 0;
  const R = 54;
  const C = 2 * Math.PI * R;

  return (
    <section className="card" aria-label="Minuteur">
      <h2 className="h2">⏱ Minuteur</h2>
      <p className="mt-0.5 truncate text-sm muted" aria-live="polite">
        {reste === 0 ? 'Terminé !' : libelle}
      </p>

      <div className="relative mx-auto my-4 h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="60" cy="60" r={R} fill="none" strokeWidth="8" className="stroke-stone-200 dark:stroke-stone-700" />
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className="stroke-brand-500 transition-[stroke-dashoffset] duration-200"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progression)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold tabular-nums" role="timer">
          {mmss(reste)}
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {actif ? (
          <button className="btn-secondary min-w-[110px]" onClick={() => setActif(false)}>
            ⏸ Pause
          </button>
        ) : (
          <button className="btn-primary min-w-[110px]" onClick={demarrer}>
            ▶ {reste > 0 && reste < duree ? 'Reprendre' : 'Démarrer'}
          </button>
        )}
        <button className="btn-ghost" onClick={() => choisir(duree)}>
          ↺ Réinitialiser
        </button>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button className="chip-off !px-3" onClick={() => ajuster(-5)} aria-label="Retirer 5 secondes">
          −5 s
        </button>
        {PRESETS.map((s) => (
          <button key={s} className={duree === s ? 'chip-on !px-3' : 'chip-off !px-3'} onClick={() => choisir(s)}>
            {s} s
          </button>
        ))}
        <button className="chip-off !px-3" onClick={() => ajuster(5)} aria-label="Ajouter 5 secondes">
          +5 s
        </button>
      </div>
      <p className="mt-3 text-center text-xs muted">Bip sonore à 3, 2, 1 et à la fin.</p>
    </section>
  );
}

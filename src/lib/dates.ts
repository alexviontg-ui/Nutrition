// Utilitaires de dates en heure LOCALE (format AAAA-MM-JJ), sans décalage UTC.

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const j = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${j}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function ajouterJours(s: string, n: number): string {
  const d = parseISODate(s);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** Lundi de la semaine contenant la date donnée */
export function lundiDe(d: Date): string {
  const copie = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const jour = (copie.getDay() + 6) % 7; // 0 = lundi
  copie.setDate(copie.getDate() - jour);
  return toISODate(copie);
}

/** Écart en jours entre deux dates AAAA-MM-JJ (b - a) */
export function ecartJours(a: string, b: string): number {
  return Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / 86400000);
}

export function aujourdhui(): string {
  return toISODate(new Date());
}

const fmtLong = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtCourt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
const fmtJour = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });

export const dateLongue = (s: string) => fmtLong.format(parseISODate(s));
export const dateCourte = (s: string) => fmtCourt.format(parseISODate(s));
export const jourCourt = (s: string) => fmtJour.format(parseISODate(s)).replace('.', '');

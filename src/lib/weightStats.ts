import type { Pesee } from '../types';
import { ajouterJours, ecartJours } from './dates';

// ============================================================
// Statistiques de suivi du poids
// ============================================================

export function trierPesees(p: Pesee[]): Pesee[] {
  return [...p].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Moyenne mobile sur 7 jours calendaires : pour chaque pesée, moyenne
 * des pesées dont la date est comprise entre J−6 et J (inclus).
 * Lisse les variations quotidiennes (eau, repas…).
 */
export function moyenneMobile7(pesees: Pesee[]): { date: string; moyenne: number }[] {
  const triees = trierPesees(pesees);
  return triees.map((p) => {
    const debut = ajouterJours(p.date, -6);
    const fenetre = triees.filter((x) => x.date >= debut && x.date <= p.date);
    const moyenne = fenetre.reduce((s, x) => s + x.poids, 0) / fenetre.length;
    return { date: p.date, moyenne: Math.round(moyenne * 100) / 100 };
  });
}

/**
 * Variation sur N jours : poids actuel − dernière pesée datant d'au moins N jours
 * avant la plus récente. null si l'historique est trop court.
 */
export function variationSur(pesees: Pesee[], jours: number): number | null {
  const triees = trierPesees(pesees);
  if (triees.length < 2) return null;
  const derniere = triees[triees.length - 1];
  const reference = [...triees].reverse().find((p) => ecartJours(p.date, derniere.date) >= jours);
  return reference ? derniere.poids - reference.poids : null;
}

export interface StatsPoids {
  depart: number | null;
  actuel: number | null;
  variationTotale: number | null;
  variation7: number | null;
  variation30: number | null;
}

export function statsPoids(pesees: Pesee[]): StatsPoids {
  const triees = trierPesees(pesees);
  if (!triees.length) {
    return { depart: null, actuel: null, variationTotale: null, variation7: null, variation30: null };
  }
  const depart = triees[0].poids;
  const actuel = triees[triees.length - 1].poids;
  return {
    depart,
    actuel,
    variationTotale: actuel - depart,
    variation7: variationSur(triees, 7),
    variation30: variationSur(triees, 30),
  };
}

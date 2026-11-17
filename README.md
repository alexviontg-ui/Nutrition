# Nutrition & Forme

Application web personnelle de suivi nutrition et forme, en français, utilisable sur PC et mobile.
Aucune donnée ne quitte l’appareil : tout est enregistré dans le `localStorage` du navigateur.

> ⚠️ Les valeurs nutritionnelles (ordres de grandeur proches des tables publiques type Ciqual) et le besoin
> calorique (formule de Mifflin-St Jeor) sont **indicatifs**. L’application ne remplace pas l’avis d’un médecin
> ou d’un diététicien, en particulier pour un objectif inférieur à 1 200 kcal/jour.

## Installation et lancement

Prérequis : [Node.js](https://nodejs.org) 18 ou plus récent.

```bash
npm install
npm run dev
```

Ouvrir ensuite l’adresse affichée (par défaut http://localhost:5173).

Pour l’utiliser sur votre téléphone (même réseau Wi-Fi) : `npm run dev -- --host`, puis ouvrir l’adresse « Network » affichée.
Attention : les données du téléphone et du PC sont séparées (utilisez Export / Import pour les transférer).

Autres commandes :

| Commande | Rôle |
|---|---|
| `npm test` | Lance les tests (Vitest) |
| `npm run build` | Construit la version de production dans `dist/` |
| `npm run preview` | Sert la version construite |

## Fonctionnalités

1. **Profil & objectifs** : calcul du besoin calorique (Mifflin-St Jeor × coefficient d’activité ± objectif),
   objectif journalier modifiable, répartition des macros, préférences (3/4 repas, régime, budget, aliments exclus),
   alerte sous 1 200 kcal, export / import JSON et réinitialisation.
2. **Menus de la semaine** : génération sur 7 jours à partir de 74 recettes, cible respectée à ±5 %, bouton
   « Changer » par repas, récapitulatif kcal et macros par jour, historique, impression / PDF.
3. **Liste de courses** : générée depuis le menu, quantités additionnées, arrondies au conditionnement, regroupées
   par rayon, cases à cocher sauvegardées, ajout manuel, copie en texte et impression.
4. **Suivi du poids** : saisie, modification et suppression, graphique avec moyenne mobile sur 7 jours et poids objectif,
   variations sur 7 et 30 jours, IMC, tour de taille.
5. **Exercices maison** : 23 exercices au poids du corps, filtres, fiches détaillées, 3 programmes types et minuteur.

## Comment sont générés les menus

Le code est dans `src/lib/menuGenerator.ts` et il est commenté.

1. La cible du jour est répartie entre les repas. Avec 3 repas : petit-déjeuner 25 %, déjeuner 40 %, dîner 35 %.
   Avec 4 repas : 20 %, 35 %, collation 15 %, dîner 30 %.
2. Une recette compatible est tirée au sort. Elle doit respecter le régime, les exclusions et le budget. Une même
   recette ne revient pas plus de 2 fois dans la semaine. Le tirage favorise aussi les recettes proches de la cible
   de protéines.
3. La recette est mise à l’échelle, puis chaque quantité est arrondie en unité pratique : œuf entier,
   demi-cuillère ou pas de 5 g.
4. Une phase d’équilibrage corrige l’écart dû aux arrondis. Elle ajuste d’abord les féculents, le pain et l’huile,
   puis l’ensemble des portions.
5. Si la journée reste hors tolérance, d’autres recettes sont tirées.

## Tests

`npm test` vérifie notamment :

- que **chaque journée** générée respecte la cible **±5 %** pour **1 500, 2 000 et 2 500 kcal**, en omnivore et
  en végétarien, avec 3 ou 4 repas, sur 12 semaines par combinaison. L’écart maximal observé est d’environ 2,5 % ;
- que le bouton « Changer » conserve la journée dans les ±5 % ;
- que la limite de 2 répétitions par semaine est respectée, ainsi que les régimes et les exclusions ;
- que la **liste de courses correspond exactement** aux ingrédients du menu : mêmes ingrédients et mêmes quantités
  au gramme près ;
- que le conditionnement acheté couvre toujours le besoin.

## Structure

```
src/
  data/        ingrédients (valeurs / 100 g), recettes, exercices et programmes
  lib/         calculs : nutrition, générateur de menus, liste de courses, stats de poids, stockage
  components/  interface, découpée par onglet (profile, menus, shopping, weight, exercises, layout)
  tests/       tests Vitest
```

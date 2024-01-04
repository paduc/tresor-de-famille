# Trésor de Famille

Certains souvenirs familiaux méritent d'être traités comme des trésors.

La mission de trésor de famille est d'aider les familles à enrichir et perreniser leurs souvenirs en les numérisant, en aidant à l'annotation et le visionnage et en les stockant de manière sécurisée et durable.

Trésor de famille est en cours de construction mais a vocation à être un commun numérique qui appartient avant tout à ses utilisateurs. 

## Situation actuelle

Janvier 2024: La version alpha privée est en production. Des utilisateurs sont en train de tester les fonctionnalités et orientent les évolutions en fonction de leurs besoins et envies.

Nous appelons cette version "alpha" parce que les fonctionnalités changent encore beaucoup. Seuls des utilisateurs sélectionnés y ont accès, parce qu'elle demande plus de travail (allers-retours réguliers).

La prochaine phase, quand les fonctionnalités se seront stabilisée, sera la phase "beta", ouverte à un plus grand nombre d'utilisateurs et dont l'objectifs sera de detecter les bugs et d'affiner les détails.

## Ce repo

Le code de ce repo est public par soucis de transparence. Aucune licence "ouverte" n'est encore proposée et les droits d'auteurs s'appliquent.

### Utilisation courante

Installation:

```
yarn
yarn db
```

Lancements:

```
yarn watch
```

Attention, `yarn db` remets la table à zéro et donc les données.

Il est important dans ce cas, de remettre à zéro l'index algolia. Il faut se connecter, selectionner la bonne app (cf id dans l'env), l'index et faire "Clear" dans "Manage Index".

L'utilisateur qui arrive sur l'application est invité dans un onboarding à se présenter et présenter sa famille.

(Un import de fichier GEDCOM est encore présent mais masqué, n'étant destiné qu'à une famille pour le moment... la mienne ;) )

### Dev de composants React

Pour le développement de composants, il est conseillé d'utiliser storybook.

```
yarn sb
```

Pour manipuler les valeurs injectées dans les props, modifier les `.stories.tsx` qui sont nommés à partir du nom des composants et placés dans le même dossier.

### Devtools

L'application a une persistence un peu spéciale ([event sourcing simplifié](https://github.com/oklmdev/persiste)).  
J'ai bricolé quelques outils pour m'aider à savoir ce qui se passait.

J'ai une note [ici](src/facts/README.md).

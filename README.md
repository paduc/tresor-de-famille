Juillet 2023: Très tôt dans le dev, mais on s'approche de l'alpha !

### Utilisation courante

```
yarn
yarn db
yarn watch
```

Attention, `yarn db` remets la table à zéro et donc les données.

Il est important dans ce cas, de remettre à zéro l'index algolia. Il faut se connecter, selectionner la bonne app (cf id dans l'env), l'index et faire "Clear" dans "Manage Index".

L'utilisateur qui arrive sur l'application est invité dans un onboarding à se présenter et présenter sa famille.

(Un import de fichier GEDCOM est encore présent mais masqué, n'étant destiné qu'à une famille pour le moment... la mienne ;) )

### Devtools

L'application a une persistence un peu spéciale ([event sourcing simplifié](https://github.com/oklmdev/persiste)).  
J'ai bricolé quelques outils pour m'aider à savoir ce qui se passait.

J'ai une note [ici](src/facts/README.md).
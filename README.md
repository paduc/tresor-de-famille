Mars 2023: Très tôt dans le dev, même pas encore alpha :)

```
yarn db
yarn watch
```

Attention, `yarn db` remets la table à zéro et donc les données.

Il est important dans ce cas, de remettre à zéro l'index algolia. Il faut se connecter, selectionner la bonne app (cf id dans l'env), l'index et faire "Clear" dans "Manage Index".

On peut ensuite réimporter le fichier GEDCOM à l'url `/importGedcom.html` et ensuite relancer l'indexation via `/indexPersonsOnAlgolia`. Ces points d'entrée sont expérimentaux et ne sont pas accessibles aux utilisateurs lambda, pour qui je propose d'abord de créer l'arbre à partir de zéro (je garde l'import gedcom pour les power users).
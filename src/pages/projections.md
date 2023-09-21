
# Projection

## Constat sur un exemple

Prenons une fonction comme `getPersonById`. Elle a été créée en dehors d'un module ou d'une page parce qu'il y avait trop de répétition (utilisé à 5 endroits) et d'événements à gérer (construit à partir de 5 événements actuellement).

Cette fonction ne sert qu'à retourner un `name` pour un `personId` donné (et pour un `userId` donné, car chacun peut avoir donné un nom différent). Aucun cas particulier avec plus d'informations sur la personne.

Ca aurait pu s'appeler `getPersonNameById: (personId: UUID, userId: UUID) => Promise<string | null>`.

## Objectifs

Découvrir un api de projection qui permettrait de précalculer l'équivalent de la query `getPersonById`.

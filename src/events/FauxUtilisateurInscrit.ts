import { DomainEvent, makeDomainEvent } from '../dependencies/DomainEvent'

export type FauxUtilisateurInscrit = DomainEvent<
  'FauxUtilisateurInscrit',
  {
    userId: string
    nom: string
  }
>

export const FauxUtilisateurInscrit = makeDomainEvent<FauxUtilisateurInscrit>('FauxUtilisateurInscrit')

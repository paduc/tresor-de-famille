import { DomainEvent, makeDomainEvent } from '../dependencies/addToHistory'

export type FauxUtilisateurInscrit = DomainEvent<
  'FauxUtilisateurInscrit',
  {
    userId: string
    nom: string
  }
>

export const FauxUtilisateurInscrit = makeDomainEvent<FauxUtilisateurInscrit>('FauxUtilisateurInscrit')

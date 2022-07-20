import { BaseDomainEvent, makeDomainEvent } from '../libs/eventSourcing/types/DomainEvent'

export type FauxUtilisateurInscrit = BaseDomainEvent & {
  type: 'FauxUtilisateurInscrit'
  payload: {
    userId: string
    nom: string
  }
}

export const FauxUtilisateurInscrit = (payload: FauxUtilisateurInscrit['payload']): FauxUtilisateurInscrit =>
  makeDomainEvent({
    type: 'FauxUtilisateurInscrit',
    payload,
  })

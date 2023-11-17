import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { AppUserId } from '../../domain/AppUserId'
import { FamilyId } from '../../domain/FamilyId'
import { FamilyMemberRelationship } from '../../domain/FamilyMemberRelationship'
import { PersonId } from '../../domain/PersonId'

export type UserPostedRelationUsingOpenAI = DomainEvent<
  'UserPostedRelationUsingOpenAI',
  {
    personId: PersonId
    userAnswer: string

    messages: {
      role: 'assistant' | 'user' | 'system'
      content: string | null
      function_call?: { name: string; arguments: string }
    }[]

    relationship: FamilyMemberRelationship

    userId: AppUserId
    familyId: FamilyId
  }
>

export const UserPostedRelationUsingOpenAI = makeDomainEvent<UserPostedRelationUsingOpenAI>('UserPostedRelationUsingOpenAI')

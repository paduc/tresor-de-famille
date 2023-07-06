import { DomainEvent, makeDomainEvent } from '../../../dependencies/DomainEvent'
import { UUID } from '../../../domain/UUID'

export type OnboardingUserNamedThemself = DomainEvent<
  'OnboardingUserNamedThemself',
  {
    userId: UUID
    personId: UUID // new person
    name: string
  }
>

export const OnboardingUserNamedThemself = makeDomainEvent<OnboardingUserNamedThemself>('OnboardingUserNamedThemself')

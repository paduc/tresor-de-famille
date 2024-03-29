import { DomainEvent } from '../../dependencies/DomainEvent.js'
import { getSingleEvent } from '../../dependencies/getSingleEvent.js'
import { FamilyId } from '../../domain/FamilyId.js'
import { FamilyShareCode } from '../../domain/FamilyShareCode.js'
import { UserRegisteredWithEmailAndPassword } from '../../events/UserRegisteredWithEmailAndPassword.js'
import { UserRegisteredWithInvitation } from '../../events/UserRegisteredWithInvitation.js'
import { makeAppUserId } from '../../libs/makeUserId.js'

type RegisterWithInviteDeps = {
  addToHistory: (event: DomainEvent) => unknown
  hashPassword: (password: string) => Promise<string>
}
type RegisterWithInviteArgs = {
  email: string
  password: string
  familyId: FamilyId
  shareCode: FamilyShareCode
}

export const makeRegisterWithInvite =
  ({ addToHistory, hashPassword }: RegisterWithInviteDeps) =>
  async ({ email, password, familyId, shareCode }: RegisterWithInviteArgs) => {
    const lowerCaseEmail = email.toLowerCase().trim()

    const accountExists = await getSingleEvent<UserRegisteredWithEmailAndPassword | UserRegisteredWithInvitation>(
      ['UserRegisteredWithEmailAndPassword', 'UserRegisteredWithInvitation'],
      { email: lowerCaseEmail }
    )

    if (accountExists) {
      throw new Error('Cette adresse email est déjà connue. Auriez-vous déjà un compte ?')
    }

    const passwordHash = await hashPassword(password)

    const userId = makeAppUserId()
    await addToHistory(
      UserRegisteredWithInvitation({
        userId,
        email: lowerCaseEmail,
        passwordHash,
        familyId,
        shareCode,
      })
    )

    return userId
  }

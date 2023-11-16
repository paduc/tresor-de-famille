import { DomainEvent } from '../../dependencies/DomainEvent'
import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { UserRegisteredWithEmailAndPassword } from '../../events/UserRegisteredWithEmailAndPassword'
import { UserRegisteredWithInvitation } from '../../events/UserRegisteredWithInvitation'
import { makeAppUserId } from '../../libs/makeUserId'

type RegisterDeps = {
  addToHistory: (event: DomainEvent) => unknown
  hashPassword: (password: string) => Promise<string>
}
export const makeRegister =
  ({ addToHistory, hashPassword }: RegisterDeps) =>
  async (email: string, password: string, code?: string) => {
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
      UserRegisteredWithEmailAndPassword({
        userId,
        email: lowerCaseEmail,
        passwordHash,
        code,
      })
    )

    return userId
  }

import { getSingleEvent } from '../../dependencies/getSingleEvent'
import { AppUserId } from '../../domain/AppUserId'
import { UserRegisteredWithEmailAndPassword } from '../../events/UserRegisteredWithEmailAndPassword'
import { UserRegisteredWithInvitation } from '../../events/UserRegisteredWithInvitation'

export const makeLogin =
  (comparePassword: (password: string, passwordHash: string) => Promise<boolean>) =>
  async (email: string, password: string): Promise<AppUserId> => {
    const lowerCaseEmail = email.toLowerCase().trim()

    const accountEvent = await getSingleEvent<UserRegisteredWithEmailAndPassword | UserRegisteredWithInvitation>(
      ['UserRegisteredWithEmailAndPassword', 'UserRegisteredWithInvitation'],
      { email: lowerCaseEmail }
    )

    if (!accountEvent) {
      throw new Error('Email unknown')
    }

    const { passwordHash, userId } = accountEvent.payload

    const isCorrectPassword = await comparePassword(password, passwordHash)

    if (!isCorrectPassword) {
      throw new Error('Wrong password')
    }

    return userId
  }

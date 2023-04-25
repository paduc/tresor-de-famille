import { UserRegisteredWithEmailAndPassword } from '../../events/UserRegisteredWithEmailAndPassword'
import { getUuid } from '../../libs/getUuid'
import { DomainEvent } from '../addToHistory'
import { postgres } from '../database'

type RegisterDeps = {
  addToHistory: (event: DomainEvent) => unknown
  hashPassword: (password: string) => Promise<string>
}
export const makeRegister =
  ({ addToHistory, hashPassword }: RegisterDeps) =>
  async (email: string, password: string, code?: string) => {
    const { rowCount } = await postgres.query(
      "SELECT * FROM events WHERE type = 'UserRegisteredWithEmailAndPassword' AND payload->>'email'=$1 LIMIT 1",
      [email]
    )

    if (rowCount) {
      throw new Error('Email already taken')
    }

    const passwordHash = await hashPassword(password)

    const userId = getUuid()
    await addToHistory(
      UserRegisteredWithEmailAndPassword({
        userId,
        email,
        passwordHash,
        code,
      })
    )

    return userId
  }

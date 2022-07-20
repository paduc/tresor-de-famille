import { UserRegisteredWithEmailAndPassword } from '../../events/UserRegisteredWithEmailAndPassword'
import { getUuid } from '../../libs/getUuid'
import { DomainEvent } from '../../libs/eventSourcing'
import { postgres } from '../postgres'

type RegisterDeps = {
  publish: (event: DomainEvent) => unknown
  hashPassword: (password: string) => Promise<string>
}
export const makeRegister =
  ({ publish, hashPassword }: RegisterDeps) =>
  async (email: string, password: string) => {
    const { rowCount } = await postgres.query(
      "SELECT * FROM events WHERE type = 'UserRegisteredWithEmailAndPassword' AND payload->>'email'=$1 LIMIT 1",
      [email]
    )

    if (rowCount) {
      throw new Error('Email already taken')
    }

    const passwordHash = await hashPassword(password)

    const userId = getUuid()
    await publish(
      UserRegisteredWithEmailAndPassword({
        userId,
        email,
        passwordHash,
      })
    )

    return userId
  }

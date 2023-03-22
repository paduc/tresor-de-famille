import { UUID } from '../../domain'
import { postgres } from '../database'

export const makeLogin =
  (comparePassword: (password: string, passwordHash: string) => Promise<boolean>) =>
  async (email: string, password: string): Promise<UUID> => {
    const { rows } = await postgres.query(
      "SELECT * FROM events WHERE type = 'UserRegisteredWithEmailAndPassword' AND payload->>'email'=$1 LIMIT 1",
      [email]
    )

    if (!rows.length) {
      throw new Error('Email unknown')
    }

    const isCorrectPassword = await comparePassword(password, rows[0].payload.passwordHash)

    if (!isCorrectPassword) {
      throw new Error('Wrong password')
    }

    return rows[0].payload.userId
  }

import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'

import { postgres } from './database'

const pgSession = connectPgSimple(session)

export const sessionStore = new pgSession({
  pool: postgres,
  createTableIfMissing: true,
  tableName: 'user_sessions',
})

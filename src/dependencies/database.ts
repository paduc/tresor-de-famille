import { Pool } from 'pg'
import { DATABASE_URL } from './env'

const testConfig = {
  user: 'test',
  host: 'localhost',
  database: 'tdf_test',
  port: 5435,
  allowExitOnIdle: true,
  max: 10,
  idleTimeoutMillis: 2,
}

const devConfig = {
  user: 'admin',
  host: 'localhost',
  database: 'tdf',
  port: 5434,
}

const prodConfig = {
  connectionString: DATABASE_URL,
}

export const postgres = new Pool(
  process.env.NODE_ENV === 'production' ? prodConfig : process.env.NODE_ENV === 'test' ? testConfig : devConfig
)

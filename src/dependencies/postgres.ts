import { Pool } from 'pg'

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

export const postgres = new Pool(process.env.NODE_ENV === 'test' ? testConfig : devConfig)

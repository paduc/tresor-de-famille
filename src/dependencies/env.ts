import dotenv from 'dotenv'
dotenv.config()

export const throwIfUndefined = (variableName: string, condition: boolean = true): string => {
  const value = process.env[variableName]
  if (!value && condition) throw new Error(`Expected ${variableName} to be Defined`)
  return value!
}

export const AUTHN = process.env.AUTHN
export const PASSWORD_SALT = throwIfUndefined('PASSWORD_SALT', AUTHN === 'password')!

export const DATABASE_URL = throwIfUndefined('DATABASE_URL', process.env.NODE_ENV === 'production')!

export const REGISTRATION_CODE = process.env.REGISTRATION_CODE || ''

export const ADMIN_USERID = throwIfUndefined('ADMIN_USERID', process.env.NODE_ENV === 'production')!

export const SESSION_SECRET = throwIfUndefined('SESSION_SECRET', true)!

export const ALGOLIA_APPID = throwIfUndefined('ALGOLIA_APPID', true)!
export const ALGOLIA_APPKEY = throwIfUndefined('ALGOLIA_APPKEY', true)!
export const ALGOLIA_SEARCHKEY = throwIfUndefined('ALGOLIA_SEARCHKEY', true)!

export const SEED = process.env.SEED === '1'

export const IS_SHARING_ENABLED = process.env.IS_SHARING_ENABLED === '1'
export const SHARING_CODE_HASH_SEED = throwIfUndefined('SHARING_CODE_HASH_SEED', IS_SHARING_ENABLED)

export const SENTRY_DSN = throwIfUndefined('SENTRY_DSN', process.env.NODE_ENV === 'production')

export const BASE_URL = throwIfUndefined('BASE_URL', true)

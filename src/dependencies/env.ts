import dotenv from 'dotenv'
dotenv.config()

export const throwIfUndefined = (variableName: string, condition: boolean = true): string => {
  const value = process.env[variableName]
  if (!value && condition) throw new Error(`Expected ${variableName} to be Defined`)
  return value!
}

export const AUTHN = process.env.AUTHN
export const PASSWORD_SALT = throwIfUndefined('PASSWORD_SALT', AUTHN === 'password')!

export const POSTGRES_CONNECTION_STRING = throwIfUndefined('DATABASE_URL', process.env.NODE_ENV === 'production')!

export const REGISTRATION_CODE = throwIfUndefined('REGISTRATION_CODE', process.env.NODE_ENV === 'production')!

export const ADMIN_USERID = throwIfUndefined('ADMIN_USERID', process.env.NODE_ENV === 'production')!

export const SESSION_SECRET = throwIfUndefined('SESSION_SECRET', true)!

export const SEED = process.env.SEED === '1'

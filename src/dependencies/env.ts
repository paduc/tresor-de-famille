import dotenv from 'dotenv'
dotenv.config()

const throwIfUndefined = (variableName: string, condition: boolean) => {
  const value = process.env[variableName]
  if (!value && condition) throw new Error(`Expected ${variableName} to be Defined`)
  return value
}

export const AUTHN = process.env.AUTHN
export const PASSWORD_SALT = throwIfUndefined('PASSWORD_SALT', AUTHN === 'password')!

export const SEED = process.env.SEED === '1'

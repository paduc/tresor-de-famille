import { zCustom } from '../libs/typeguards.js'

export type UUID = string & { isUUID: true }

export const isUUID = (str: unknown): str is UUID => {
  return typeof str === 'string' && str.length > 0
}

export const zIsUUID = zCustom(isUUID)

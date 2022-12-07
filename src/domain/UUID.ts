import { zCustom } from '../libs/typeguards'

export type UUID = string & { isUUID: true }

export const isUUID = (str: unknown): str is UUID => {
  return typeof str === 'string'
}

export const zIsUUID = zCustom(isUUID)

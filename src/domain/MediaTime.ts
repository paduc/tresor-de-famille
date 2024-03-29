import { zCustom } from '../libs/typeguards.js'

export type MediaTime = string & { isMediaTime: true }

// Accepts hh:mm:ss or mm:ss
const mediaTimeRegex = /^(?:(?:[0-1]?\d):)?[0-5]?\d:[0-5]\d$/

export const isMediaTime = (str: unknown): str is MediaTime => {
  return typeof str === 'string' && mediaTimeRegex.test(str)
}

export const zIsMediaTime = zCustom(isMediaTime)

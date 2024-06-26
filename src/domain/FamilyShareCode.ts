import { zCustom } from '../libs/typeguards.js'

export type FamilyShareCode = string & { isFamilyShareCode: true }

export const isFamilyShareCode = (familyShareCode: any): familyShareCode is FamilyShareCode => {
  // Length of a sha1 base64 hash
  return typeof familyShareCode === 'string' && familyShareCode.length === 27
}

export const zIsFamilyShareCode = zCustom(isFamilyShareCode)

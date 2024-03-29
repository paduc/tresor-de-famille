import { zCustom } from '../libs/typeguards.js'
import { isUUID } from './UUID.js'

export type FamilyId = string & { isFamilyId: true }

export const isFamilyId = (familyId: any): familyId is FamilyId => isUUID(familyId)

export const zIsFamilyId = zCustom(isFamilyId)

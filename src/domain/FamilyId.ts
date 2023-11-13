import { zCustom } from '../libs/typeguards'
import { isUUID } from './UUID'

export type FamilyId = string & { isFamilyId: true }

export const isFamilyId = (familyId: any): familyId is FamilyId => isUUID(familyId)

export const zIsFamilyId = zCustom(isFamilyId)

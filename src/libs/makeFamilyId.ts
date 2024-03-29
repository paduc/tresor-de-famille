import { ulid } from 'ulid'
import { FamilyId } from '../domain/FamilyId.js'

export const makeFamilyId = (): FamilyId => {
  return ulid() as FamilyId
}

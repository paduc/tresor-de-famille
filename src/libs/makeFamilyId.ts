import { ulid } from 'ulid'
import { FamilyId } from '../domain/FamilyId'

export const makeFamilyId = (): FamilyId => {
  return ulid() as FamilyId
}

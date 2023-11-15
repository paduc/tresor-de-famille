import { createHash } from 'node:crypto'
import { SHARING_CODE_HASH_SEED } from '../dependencies/env'
import { FamilyId } from '../domain/FamilyId'
import { FamilyShareCode } from '../domain/FamilyShareCode'

export const makeFamilyShareCode = (familyId: FamilyId): FamilyShareCode => {
  const hash = createHash('sha1')
  hash.update(SHARING_CODE_HASH_SEED)
  hash.update(familyId)
  hash.update(Math.random().toString())
  return hash.digest('base64url') as FamilyShareCode
}

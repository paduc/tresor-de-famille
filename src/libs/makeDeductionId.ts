import { ulid } from 'ulid'
import { DeductionId } from '../domain/DeductionId.js'

export const makeDeductionId = (): DeductionId => {
  return ulid() as DeductionId
}

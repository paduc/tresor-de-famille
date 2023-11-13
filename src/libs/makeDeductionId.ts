import { ulid } from 'ulid'
import { DeductionId } from '../domain/DeductionId'

export const makeDeductionId = (): DeductionId => {
  return ulid() as DeductionId
}

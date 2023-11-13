import { zCustom } from '../libs/typeguards'
import { isUUID } from './UUID'

export type DeductionId = string & { isDeductionId: true }

export const isDeductionId = (threadId: any): threadId is DeductionId => isUUID(threadId)

export const zIsDeductionId = zCustom(isDeductionId)

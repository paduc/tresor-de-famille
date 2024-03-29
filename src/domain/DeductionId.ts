import { zCustom } from '../libs/typeguards.js'
import { isUUID } from './UUID.js'

export type DeductionId = string & { isDeductionId: true }

export const isDeductionId = (threadId: any): threadId is DeductionId => isUUID(threadId)

export const zIsDeductionId = zCustom(isDeductionId)

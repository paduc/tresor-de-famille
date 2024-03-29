import { zCustom } from '../libs/typeguards.js'
import { isUUID } from './UUID.js'

export type ThreadId = string & { isThreadId: true }

export const isThreadId = (threadId: any): threadId is ThreadId => isUUID(threadId)

export const zIsThreadId = zCustom(isThreadId)

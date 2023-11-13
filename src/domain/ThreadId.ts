import { zCustom } from '../libs/typeguards'
import { isUUID } from './UUID'

export type ThreadId = string & { isThreadId: true }

export const isThreadId = (threadId: any): threadId is ThreadId => isUUID(threadId)

export const zIsThreadId = zCustom(isThreadId)

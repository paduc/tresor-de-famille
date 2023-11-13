import { zCustom } from '../libs/typeguards'
import { isUUID } from './UUID'

export type AppUserId = string & { isAppUserId: true }

export const isAppUserId = (userId: any): userId is AppUserId => isUUID(userId)

export const zIsAppUserId = zCustom(isAppUserId)

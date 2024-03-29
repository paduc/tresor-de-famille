import { zCustom } from '../libs/typeguards.js'
import { isUUID } from './UUID.js'

export type AppUserId = string & { isAppUserId: true }

export const isAppUserId = (userId: any): userId is AppUserId => isUUID(userId)

export const zIsAppUserId = zCustom(isAppUserId)

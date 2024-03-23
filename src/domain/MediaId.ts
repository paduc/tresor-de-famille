import { zCustom } from '../libs/typeguards'
import { isUUID } from './UUID'

export type MediaId = string & { isMediaId: true }

export const isMediaId = (mediaId: any): mediaId is MediaId => isUUID(mediaId)

export const zIsMediaId = zCustom(isMediaId)

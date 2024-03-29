import { zCustom } from '../libs/typeguards.js'
import { isUUID } from './UUID.js'

export type MediaId = string & { isMediaId: true }

export const isMediaId = (mediaId: any): mediaId is MediaId => isUUID(mediaId)

export const zIsMediaId = zCustom(isMediaId)

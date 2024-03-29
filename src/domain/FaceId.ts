import { zCustom } from '../libs/typeguards.js'
import { isUUID } from './UUID.js'

export type FaceId = string & { isFaceId: true }

export const isFaceId = (faceId: any): faceId is FaceId => isUUID(faceId)

export const zIsFaceId = zCustom(isFaceId)

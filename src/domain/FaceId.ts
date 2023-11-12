import { zCustom } from '../libs/typeguards'
import { isUUID } from './UUID'

export type FaceId = string & { isFaceId: true }

export const isFaceId = (faceId: any): faceId is FaceId => isUUID(faceId)

export const zIsFaceId = zCustom(isFaceId)

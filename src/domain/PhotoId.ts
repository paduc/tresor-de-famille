import { zCustom } from '../libs/typeguards'
import { isUUID } from './UUID'

export type PhotoId = string & { isPhotoId: true }

export const isPhotoId = (photoId: any): photoId is PhotoId => isUUID(photoId)

export const zIsPhotoId = zCustom(isPhotoId)

import { zCustom } from '../libs/typeguards.js'
import { isUUID } from './UUID.js'

export type PhotoId = string & { isPhotoId: true }

export const isPhotoId = (photoId: any): photoId is PhotoId => isUUID(photoId)

export const zIsPhotoId = zCustom(isPhotoId)

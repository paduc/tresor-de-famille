import { MediaId } from '../../domain/MediaId.js'

export const GetMediaStatusURL = (mediaId?: MediaId) => `/getMediaStatus${mediaId ? `?mediaId=${mediaId}` : ''}`

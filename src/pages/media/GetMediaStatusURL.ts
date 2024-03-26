import { MediaId } from '../../domain/MediaId'

export const GetMediaStatusURL = (mediaId?: MediaId) => `/getMediaStatus${mediaId ? `?mediaId=${mediaId}` : ''}`

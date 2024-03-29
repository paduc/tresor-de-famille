import { PhotoId } from '../../domain/PhotoId.js'
import { ThreadId } from '../../domain/ThreadId.js'

export function ThreadUrl(threadId?: ThreadId, editable?: boolean, photoId?: PhotoId) {
  if (!threadId) {
    return `/thread/:edit?/:threadId.html`
  }

  return `/thread${editable ? `/edit` : ``}/${threadId}.html${photoId ? `#${photoId}` : ''}`
}

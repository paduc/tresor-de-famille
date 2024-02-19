import { PhotoId } from '../../domain/PhotoId'
import { ThreadId } from '../../domain/ThreadId'

export function ThreadUrl(threadId?: ThreadId, editable?: boolean, photoId?: PhotoId) {
  if (!threadId) {
    return `/thread/:edit?/:threadId.html`
  }

  return `/thread${editable ? `/edit` : ``}/${threadId}.html${photoId ? `#${photoId}` : ''}`
}

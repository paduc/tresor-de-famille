import { ThreadId } from '../../domain/ThreadId'

export function ThreadUrl(threadId?: ThreadId, editable?: boolean) {
  if (!threadId) {
    return `/thread/:edit?/:threadId.html`
  }

  return `/thread${editable ? `/edit` : ``}/${threadId}.html`
}

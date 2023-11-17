import type { Request } from 'express'
import { AppUserId } from '../../domain/AppUserId'

export const buildSession = (args: { userId: AppUserId; request: Request; name?: string }) => {
  const { request, userId, name } = args
  request.session.user = { id: userId, name: name || '' }
}

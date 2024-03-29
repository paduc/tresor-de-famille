import type { Request } from 'express'
import { AppUserId } from '../../domain/AppUserId.js'

export const buildSession = (args: { userId: AppUserId; request: Request; name?: string; isFirstConnection?: boolean }) => {
  const { request, userId, name } = args
  request.session.user = { id: userId, name: name || '' }
  if (args.isFirstConnection) {
    request.session.isOnboarding = true
  }
}

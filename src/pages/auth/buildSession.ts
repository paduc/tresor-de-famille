import type { Request } from 'express'
import { ALGOLIA_SEARCHKEY } from '../../dependencies/env'
import { searchClient } from '../../dependencies/search'
import { AppUserId } from '../../domain/AppUserId'

export const buildSession = (args: { userId: AppUserId; request: Request; name?: string }) => {
  const { request, userId, name } = args
  request.session.user = { id: userId, name: name || '' }

  request.session.searchKey = searchClient.generateSecuredApiKey(ALGOLIA_SEARCHKEY, {
    filters: `visible_by:user/${userId}`,
  })
}

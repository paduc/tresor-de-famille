import { FamilyId } from '../../domain/FamilyId.js'

export const MediaListPageUrl = '/mediaList.html'
export const MediaListPageUrlWithFamily = (familyId?: FamilyId) => {
  if (familyId) {
    return `/${familyId}/mediaList.html`
  }
  return '/:familyId?/mediaList.html'
}

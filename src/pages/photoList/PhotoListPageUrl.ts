import { FamilyId } from '../../domain/FamilyId'

export const PhotoListPageUrl = '/photos.html'
export const PhotoListPageUrlWithFamily = (familyId?: FamilyId) => {
  if (familyId) {
    return `/${familyId}/photos.html`
  }
  return '/:familyId?/photos.html'
}

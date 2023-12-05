import { FamilyId } from '../../domain/FamilyId'

export const FamilyPageURL = () => `/family.html`
export const FamilyPageURLWithFamily = (familyId?: FamilyId) => {
  if (familyId) {
    return `/${familyId}/family.html`
  }
  return '/:familyId?/family.html'
}

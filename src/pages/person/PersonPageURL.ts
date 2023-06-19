import { UUID } from '../../domain'

export const PersonPageURL = (personId?: UUID) => `/person/${personId || ':personId'}/person.html`

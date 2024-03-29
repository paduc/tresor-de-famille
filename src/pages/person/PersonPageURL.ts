import { PersonId } from '../../domain/PersonId.js'

export const PersonPageURL = (personId?: PersonId) => `/person/${personId || ':personId'}/person.html`

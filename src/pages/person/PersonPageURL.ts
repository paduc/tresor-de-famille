import { PersonId } from '../../domain/PersonId'

export const PersonPageURL = (personId?: PersonId) => `/person/${personId || ':personId'}/person.html`

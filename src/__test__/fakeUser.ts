import { User } from '../domain/UUID.js'
import { getUuid } from '../libs/getUuid.js'

export const makeFakeUser = (overrides?: Partial<User>): User => {
  return {
    id: getUuid(),
    name: 'toto',
    ...overrides,
  }
}

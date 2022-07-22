import { User } from '../domain'
import { getUuid } from '../libs/getUuid'

export const makeFakeUser = (overrides?: Partial<User>): User => {
  return {
    id: getUuid(),
    name: "toto",
    ...overrides,
  }
}

import { UserRegisteredWithEmailAndPassword } from '../../events/UserRegisteredWithEmailAndPassword'
import { getUuid } from '../../libs/getUuid'
import { publish } from '../eventStore'
import { resetDatabase } from '../__test__/resetDatabase'

import { makeLogin } from './login'

describe('login', () => {
  describe('when the user exists and the password is correct', () => {
    it('should return the user id', async () => {
      await resetDatabase()

      const fakeCompare = jest.fn(async (passwordHash: string, password: string) => true)

      const login = makeLogin(fakeCompare)

      const userId = getUuid()
      await publish(
        UserRegisteredWithEmailAndPassword({
          userId,
          email: 'test@test.test',
          passwordHash: 'passwordHash',
        })
      )

      const result = await login('test@test.test', 'password')

      expect(fakeCompare).toHaveBeenCalledWith('passwordHash', 'password')
      expect(result).toEqual(userId)
    })
  })

  describe('when the user does not exist', () => {
    it('should throw an error', async () => {
      await resetDatabase()

      const fakeCompare = async (passwordHash: string, password: string) => {
        throw 'should not be called'
      }
      const login = makeLogin(fakeCompare)

      expect.assertions(1)
      await expect(login('test@test.test', 'password')).rejects.toMatchObject({ message: 'Email unknown' })
    })
  })

  describe('when the user exists but the password is not correct', () => {
    it('should throw an error', async () => {
      await resetDatabase()

      const fakeCompare = async (passwordHash: string, password: string) => false
      const login = makeLogin(fakeCompare)

      const userId = getUuid()
      await publish(
        UserRegisteredWithEmailAndPassword({
          userId,
          email: 'test@test.test',
          passwordHash: 'passwordHash',
        })
      )

      expect.assertions(1)
      await expect(login('test@test.test', 'password')).rejects.toMatchObject({ message: 'Wrong password' })
    })
  })
})

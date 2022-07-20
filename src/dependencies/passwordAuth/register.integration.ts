import { UserRegisteredWithEmailAndPassword } from '../../events/UserRegisteredWithEmailAndPassword'
import { DomainEvent } from '../../libs/eventSourcing'
import { publish } from '../eventStore'
import { resetDatabase } from '../__test__/resetDatabase'
import { makeRegister } from './register'

describe('register', () => {
  describe('when the email is free', () => {
    it('should publish UserRegisteredWithEmailAndPassword', async () => {
      await resetDatabase()

      const fakePublish = jest.fn((event: DomainEvent) => Promise.resolve())
      const fakeHashPassword = async (password: string) => 'hash'

      const register = makeRegister({ publish: fakePublish, hashPassword: fakeHashPassword })

      const userId = await register('test@test.test', 'password')

      expect(fakePublish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'UserRegisteredWithEmailAndPassword',
          payload: { userId, email: 'test@test.test', passwordHash: 'hash' },
        })
      )
    })
  })

  describe('when the email is taken', () => {
    it('should throw an error', async () => {
      await resetDatabase()

      const email = 'test@test.test'
      await publish(
        UserRegisteredWithEmailAndPassword({
          userId: '',
          email,
          passwordHash: '',
        })
      )

      const fakePublish = jest.fn()
      const fakeHashPassword = jest.fn()

      const register = makeRegister({ publish: fakePublish, hashPassword: fakeHashPassword })

      expect.assertions(3)
      await expect(register(email, 'password')).rejects.toMatchObject({ message: 'Email already taken' })

      expect(fakePublish).not.toHaveBeenCalled()
      expect(fakeHashPassword).not.toHaveBeenCalled()
    })
  })
})

import { getUuid } from './getUuid'
import { makeIdCodeMap } from './makeIdCodeMap'

describe('makeIdCodeMap', () => {
  describe('when called with a prefix', () => {
    const idCodeMap = makeIdCodeMap('prefix')
    const uuid1 = getUuid()
    const uuid2 = getUuid()
    it('should return a map instance', () => {
      expect(idCodeMap).toBeDefined()
    })

    describe('when calling idCodeMap.idToCode(uuid1)', () => {
      it('should return a short code', () => {
        const code1 = idCodeMap.idToCode(uuid1)
        expect(code1).toEqual('prefix1')
      })
    })

    describe('when calling idCodeMap.idToCode(uuid1) again', () => {
      it('should return the same code as the first time', () => {
        const code1 = idCodeMap.idToCode(uuid1)
        expect(code1).toEqual('prefix1')
      })
    })

    describe('when calling idCodeMap.idToCode(uuid2)', () => {
      it('should return the next short code', () => {
        const code2 = idCodeMap.idToCode(uuid2)
        expect(code2).toEqual('prefix2')
      })
    })

    describe('when calling idCodeMap.codeToId(prefix1)', () => {
      it('should return uuid1', () => {
        const id = idCodeMap.codeToId('prefix1')
        expect(id).toEqual(uuid1)
      })
    })

    describe('when calling idCodeMap.codeToId(prefix2)', () => {
      it('should return uuid2', () => {
        const id = idCodeMap.codeToId('prefix2')
        expect(id).toEqual(uuid2)
      })
    })

    describe('when calling idCodeMap.codeToId(does not exist)', () => {
      it('should return undefined', () => {
        const id = idCodeMap.codeToId('blablabla')
        expect(id).toBeUndefined()
      })
    })
  })
})

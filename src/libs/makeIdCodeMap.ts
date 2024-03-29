import { UUID } from '../domain/UUID.js'

type IdCodeMap<ID = UUID> = { idToCode: (uuid: ID) => string | undefined; codeToId: (code: string) => ID | undefined }

export const makeIdCodeMap = <ID = UUID>(prefix?: string): IdCodeMap<ID> => {
  const idCodeMap = new Map<ID, string>() /* Map<uuid, code> */

  return {
    idToCode: (uuid: ID) => {
      if (!idCodeMap.has(uuid)) {
        idCodeMap.set(uuid, `${prefix}${idCodeMap.size + 1}`)
      }
      return idCodeMap.get(uuid)
    },
    codeToId: (code: string): ID | undefined => {
      const codeIdMap = new Map(Array.from(idCodeMap, (entry) => [entry[1], entry[0]]))

      return codeIdMap.get(code)
    },
  }
}

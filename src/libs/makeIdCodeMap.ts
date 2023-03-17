export const makeIdCodeMap = (prefix?: string) => {
  let index = 0
  const idCodeMap = new Map<string, string>() /* Map<uuid, code> */

  return {
    idToCode: (uuid: string) => {
      if (!idCodeMap.has(uuid)) {
        idCodeMap.set(uuid, `${prefix}${idCodeMap.size + 1}`)
      }
      return idCodeMap.get(uuid)
    },
    codeToId: (code: string) => {
      const codeIdMap = new Map(Array.from(idCodeMap, (entry) => [entry[1], entry[0]]))

      return codeIdMap.get(code)
    },
  }
}

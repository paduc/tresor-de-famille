import path from 'node:path'

export const getDirname = (importMetaUrl: string): string => {
  return path.dirname(importMetaUrl).replace('file://', '')
}

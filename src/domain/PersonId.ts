import { zCustom } from '../libs/typeguards.js'
import { isUUID } from './UUID.js'

export type PersonId = string & { isPersonId: true }

export const isPersonId = (personId: any): personId is PersonId => isUUID(personId)

export const zIsPersonId = zCustom(isPersonId)

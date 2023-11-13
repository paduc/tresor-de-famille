import { zCustom } from '../libs/typeguards'
import { isUUID } from './UUID'

export type PersonId = string & { isPersonId: true }

export const isPersonId = (personId: any): personId is PersonId => isUUID(personId)

export const zIsPersonId = zCustom(isPersonId)

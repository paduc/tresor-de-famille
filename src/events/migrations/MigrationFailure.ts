import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { MigrationName } from './MigrationStart.js'

export type MigrationFailure = DomainEvent<
  'MigrationFailure',
  {
    name: MigrationName
  }
>

export const MigrationFailure = makeDomainEvent<MigrationFailure>('MigrationFailure')

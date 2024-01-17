import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { MigrationName } from './MigrationStart'

export type MigrationFailure = DomainEvent<
  'MigrationFailure',
  {
    name: MigrationName
  }
>

export const MigrationFailure = makeDomainEvent<MigrationFailure>('MigrationFailure')

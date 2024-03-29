import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'
import { MigrationName } from './MigrationStart.js'

export type MigrationSuccess = DomainEvent<
  'MigrationSuccess',
  {
    name: MigrationName
  }
>

export const MigrationSuccess = makeDomainEvent<MigrationSuccess>('MigrationSuccess')

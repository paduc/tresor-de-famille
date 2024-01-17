import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'
import { MigrationName } from './MigrationStart'

export type MigrationSuccess = DomainEvent<
  'MigrationSuccess',
  {
    name: MigrationName
  }
>

export const MigrationSuccess = makeDomainEvent<MigrationSuccess>('MigrationSuccess')

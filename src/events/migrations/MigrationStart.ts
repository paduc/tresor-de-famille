import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'

export type MigrationName = 'threadClone'

export type MigrationStart = DomainEvent<
  'MigrationStart',
  {
    name: MigrationName
  }
>

export const MigrationStart = makeDomainEvent<MigrationStart>('MigrationStart')

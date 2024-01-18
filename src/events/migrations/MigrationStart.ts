import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent'

export type MigrationName = 'threadClone' | 'photoClone'

export type MigrationStart = DomainEvent<
  'MigrationStart',
  {
    name: MigrationName
  }
>

export const MigrationStart = makeDomainEvent<MigrationStart>('MigrationStart')

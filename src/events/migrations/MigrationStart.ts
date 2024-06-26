import { DomainEvent, makeDomainEvent } from '../../dependencies/DomainEvent.js'

export type MigrationName = 'threadClone' | 'photoClone' | 'personClone' | 'deleteThreadClones'

export type MigrationStart = DomainEvent<
  'MigrationStart',
  {
    name: MigrationName
  }
>

export const MigrationStart = makeDomainEvent<MigrationStart>('MigrationStart')

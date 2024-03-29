import { z } from 'zod'
import { zIsPersonId } from '../../domain/PersonId.js'
import { zIsRelationshipId } from '../../domain/RelationshipId.js'

export const zIsRelationship = z
  .object({
    id: zIsRelationshipId,
  })
  .and(
    z.discriminatedUnion('type', [
      z.object({ type: z.literal('parent'), parentId: zIsPersonId, childId: zIsPersonId }),
      z.object({ type: z.literal('spouses'), spouseIds: z.tuple([zIsPersonId, zIsPersonId]) }),
      z.object({ type: z.literal('friends'), friendIds: z.tuple([zIsPersonId, zIsPersonId]) }),
    ])
  )

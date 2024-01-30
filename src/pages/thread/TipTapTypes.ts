import { z } from 'zod'
import type { JSON } from '../../dependencies/DomainEvent'
import { zIsPhotoId } from '../../domain/PhotoId'

// TipTap Types

export type TipTapJSON = z.infer<typeof zIsTipTapJSON> // = ParagraphNode | PhotoNode
export type TipTapContentAsJSON = z.infer<typeof zIsTipTapContentAsJSON> // = { type: doc, content: TipTapJSON[]}

export type ParagraphNode = TipTapJSON & {
  type: 'paragraph'
}
export type PhotoNode = TipTapJSON & {
  type: 'photoNode'
}

export type SeparatorNode = TipTapJSON & {
  type: 'separatorNode'
}

// Zod validators
const zIsMark = z.object({ type: z.union([z.literal('bold'), z.literal('italic'), z.literal('strike')]) })

export type TextMark = z.infer<typeof zIsMark>

const zIsParagraphNode = z.object({
  type: z.literal('paragraph'),
  content: z
    .array(
      z.object({
        type: z.literal('text'),
        text: z.string(),
        marks: z.array(zIsMark).optional(),
      })
    )
    .optional(),
})

const zIsPhotoNode = z.object({
  type: z.literal('photoNode'),
  attrs: z.object({ photoId: zIsPhotoId }).and(z.record(z.any())),
})

const zIsSeparatorNode = z.object({
  type: z.literal('separatorNode'),
})

export const zIsTipTapJSON = z.union([zIsParagraphNode, zIsPhotoNode, zIsSeparatorNode])

export const zIsTipTapContentAsJSON = z.object({
  type: z.literal('doc'),
  content: z.array(zIsTipTapJSON),
})

// Utilities to parse/serialize TipTapJSON

export const decodeTipTapJSON = (contentAsJSONEncoded: string): TipTapContentAsJSON => {
  try {
    return JSON.parse(decodeURIComponent(contentAsJSONEncoded))
  } catch (error) {
    console.error('erreur dans decodeTipTap', JSON.stringify(contentAsJSONEncoded, null, 2))
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Une erreur a eu lieu. Les administrateurs ont été prévenus. Aucune donnée ne peut être perdue.',
            },
          ],
        },
      ],
    }
  }
}

export const encodeStringy = (json: JSON) => encodeURIComponent(JSON.stringify(json))

/**
 * Remove the separator nodes from content
 * @param contentAsJson
 * @returns contentAsJson without separator nodes
 */
export const removeSeparatorNodes = (contentAsJson: TipTapContentAsJSON): TipTapContentAsJSON => {
  const cleanContentAsJson: TipTapContentAsJSON = {
    type: 'doc',
    content: [],
  }

  for (const node of contentAsJson.content) {
    // remove all separatorNodes
    if (node.type === 'separatorNode') continue

    cleanContentAsJson.content.push(node)
  }

  return cleanContentAsJson
}

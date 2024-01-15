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

// Zod validators

const zIsParagraphNode = z.object({
  type: z.literal('paragraph'),
  content: z.array(z.object({ type: z.literal('text'), text: z.string() })).optional(),
})

const zIsPhotoNode = z.object({
  type: z.literal('photoNode'),
  attrs: z.object({ photoId: zIsPhotoId }).and(z.record(z.any())),
})

export const zIsTipTapJSON = z.union([zIsParagraphNode, zIsPhotoNode])

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
 * Remove the empty paragraphs between photoNodes
 * reverses the effects of separatePhotoNodes
 * @param contentAsJson
 * @returns
 */
export const removeEmptySpaceBetweenPhotos = (contentAsJson: TipTapContentAsJSON): TipTapContentAsJSON => {
  const cleanContentAsJson: TipTapContentAsJSON = {
    type: 'doc',
    content: [],
  }

  let nminus1Node: TipTapJSON | null = null
  let nminus2Node: TipTapJSON | null = null
  for (const node of contentAsJson.content) {
    // Look for photoNode-paragraph-photoNode with empty paragraph
    if (
      node.type === 'photoNode' &&
      nminus1Node &&
      nminus2Node &&
      nminus2Node.type === 'photoNode' &&
      nminus1Node.type === 'paragraph' &&
      (!nminus1Node.content || nminus1Node.content.length === 0)
    ) {
      cleanContentAsJson.content.pop()
    }

    cleanContentAsJson.content.push(node)
    nminus2Node = nminus1Node
    nminus1Node = node
  }

  return cleanContentAsJson
}

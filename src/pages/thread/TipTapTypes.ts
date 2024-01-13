import { z } from 'zod'
import type { JSON } from '../../dependencies/DomainEvent'
import { zIsPhotoId, type PhotoId } from '../../domain/PhotoId'
import type { ThreadId } from '../../domain/ThreadId'
import type { UUID } from '../../domain/UUID'
import type { PhotoItemProps } from './ThreadPage/ThreadPage'

export type PhotoNode = {
  type: 'photoNode'
  attrs: Record<string, any> & { photoId: PhotoId }
}

export type TipTapAttrs<ItemProps extends {}> = {
  [Attr in keyof ItemProps]: ItemProps[Attr] extends ThreadId
    ? ThreadId
    : ItemProps[Attr] extends PhotoId
    ? PhotoId
    : ItemProps[Attr] extends UUID
    ? UUID
    : ItemProps[Attr] extends number
    ? number
    : string
}

export type ParagraphNode = {
  type: 'paragraph'
  content?:
    | [
        {
          type: 'text'
          text: string
        }
      ]
    | []
}

type InsertMarkerNode = {
  type: 'insertPhotoMarker'
}

// type TipTapJSON = PhotoNode | ParagraphNode | InsertMarkerNode

export const zIsTipTapJSON = z.union([
  z.object({
    type: z.literal('paragraph'),
    content: z.array(z.object({ type: z.literal('text'), text: z.string() })).optional(),
  }),
  z.object({ type: z.literal('photoNode'), attrs: z.object({ photoId: zIsPhotoId }) }),
  z.object({ type: z.literal('insertPhotoMarker') }),
])

export type TipTapJSON = z.infer<typeof zIsTipTapJSON>

export const zIsTipTapContentAsJSON = z.object({
  type: z.literal('doc'),
  content: z.array(zIsTipTapJSON),
})
export type TipTapContentAsJSON = z.infer<typeof zIsTipTapContentAsJSON>

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

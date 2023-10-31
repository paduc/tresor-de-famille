import { JSON } from '../../dependencies/DomainEvent'
import { UUID } from '../../domain/UUID'
import { PhotoItemProps } from './ChatPage/ChatPage'

export type PhotoNode = {
  type: 'photoNode'
  attrs: {
    // Sort of stringified version of PhotoItemProps
    [Attr in keyof PhotoItemProps]: PhotoItemProps[Attr] extends UUID
      ? UUID
      : PhotoItemProps[Attr] extends number
      ? number
      : string
  }
}

export type ParagraphNode = {
  type: 'paragraph'
  content: [
    {
      type: 'text'
      text: string
    }
  ]
}

type InsertMarkerNode = {
  type: 'insertPhotoMarker'
}

type TipTapJSON = PhotoNode | ParagraphNode | InsertMarkerNode

export type TipTapContentAsJSON = {
  type: 'doc'
  content: TipTapJSON[]
}

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

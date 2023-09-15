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

export const decodeTipTapJSON = (contentAsJSONEncoded: string): TipTapContentAsJSON =>
  JSON.parse(decodeURIComponent(contentAsJSONEncoded))

export const encodeStringy = (json: JSON) => encodeURIComponent(JSON.stringify(json))

import * as React from 'react'
import { ChatEvent, ChatItem } from './ChatPage'
import { PhotoIcon } from './PhotoIcon'

type PhotoItemProps = { event: ChatEvent & { type: 'photo' } }
export const PhotoItem = ({ event }: PhotoItemProps) => {
  return (
    <ChatItem>
      <div className='relative'>
        <img
          className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white'
          src={event.profilePicUrl}
          alt=''
          style={{ maxWidth: 400 }}
        />

        <span className='absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px'>
          <PhotoIcon className='h-5 w-5 text-gray-500' aria-hidden='true' />
        </span>
      </div>
      <div className='min-w-0 flex-1 py-1.5'>
        <div className='relative inline-block'>
          <img src={event.photo.url} className='max-w-md max-h-fit' />
          {event.photo.faces?.map((face, index) => (
            <HoverableFace key={`face${index}`} face={face} index={index} />
          ))}
        </div>
      </div>
    </ChatItem>
  )
}
const HoverableFace = (props: any) => {
  const [isHovered, setHovered] = React.useState<boolean>(false)
  const { face, index } = props
  return (
    <div
      key={`face${index}`}
      onMouseOver={() => {
        setHovered(true)
      }}
      onMouseOut={() => {
        setHovered(false)
      }}
      style={{
        top: `${Math.round(face.position.top * 100)}%`,
        left: `${Math.round(face.position.left * 100)}%`,
        width: `${Math.round(face.position.width * 100)}%`,
        height: `calc(${Math.round(face.position.height * 100)}% + 20px)`,
      }}
      className={`absolute  ${isHovered ? 'border-2' : 'border-0'} border-white`}>
      {isHovered ? (
        <div className='block absolute bottom-0 text-sm text-white' style={{ height: 20 }}>
          {face.personName || ''}
        </div>
      ) : (
        ''
      )}
    </div>
  )
}

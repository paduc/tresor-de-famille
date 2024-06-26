import React from 'react'
import { MediaSelectorComponent } from './MediaSelector.js'
import { makePhotoId } from '../../libs/makePhotoId.js'

export default { title: 'MediaSelector', component: MediaSelectorComponent, parameters: { layout: 'fullscreen' } }

const fakeProfilePicUrl =
  'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80'

export const Basique = () => (
  <MediaSelectorComponent
    isOpen={true}
    onMediaSelectedInComponent={(photoId) => alert(`Click on ${photoId}`)}
    close={() => alert('close')}
    status='idle'
    photos={[
      { photoId: makePhotoId(), url: fakeProfilePicUrl },
      { photoId: makePhotoId(), url: fakeProfilePicUrl },
      { photoId: makePhotoId(), url: fakeProfilePicUrl },
      { photoId: makePhotoId(), url: fakeProfilePicUrl },
      { photoId: makePhotoId(), url: fakeProfilePicUrl },
      { photoId: makePhotoId(), url: fakeProfilePicUrl },
      { photoId: makePhotoId(), url: fakeProfilePicUrl },
      { photoId: makePhotoId(), url: fakeProfilePicUrl },
      { photoId: makePhotoId(), url: fakeProfilePicUrl },
      { photoId: makePhotoId(), url: fakeProfilePicUrl },
      { photoId: makePhotoId(), url: fakeProfilePicUrl },
      { photoId: makePhotoId(), url: fakeProfilePicUrl },
      { photoId: makePhotoId(), url: fakeProfilePicUrl },
      { photoId: makePhotoId(), url: fakeProfilePicUrl },
      { photoId: makePhotoId(), url: fakeProfilePicUrl },
    ]}
  />
)

export const ChargementEnCours = () => (
  <MediaSelectorComponent
    isOpen={true}
    onMediaSelectedInComponent={(photoId) => alert(`Click on ${photoId}`)}
    close={() => alert('close')}
    status='downloading'
    photos={[]}
  />
)

export const Erreur = () => (
  <MediaSelectorComponent
    isOpen={true}
    onMediaSelectedInComponent={(photoId) => alert(`Click on ${photoId}`)}
    close={() => alert('close')}
    status='error'
    photos={[]}
  />
)

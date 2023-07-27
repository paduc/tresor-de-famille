import { SearchIndex } from 'algoliasearch/lite'
import * as React from 'react'
import { getUuid } from '../../../libs/getUuid'
import { SessionContext } from '../../_components'
import { PersonSearchContext } from '../../_components/usePersonSearch'
import { NewPhotoPage } from './NewPhotoPage'

const fakePersonSearch = async (query: string) => {
  return {
    hits: [
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
      { objectID: getUuid(), name: 'John Doe' },
    ],
  }
}

export default {
  title: 'Nouvelle Page Photo',
  component: NewPhotoPage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story: any) => {
      return (
        <SessionContext.Provider
          value={{
            isLoggedIn: true,
            userName: '',
            profilePic: null,
            isAdmin: false,
            arePhotosEnabled: false,
            areThreadsEnabled: false,
            areVideosEnabled: false,
          }}>
          <PersonSearchContext.Provider value={{ search: fakePersonSearch } as unknown as SearchIndex}>
            <Story />
          </PersonSearchContext.Provider>
        </SessionContext.Provider>
      )
    },
  ],
}

export const PhotoSansAnnotation = () => <NewPhotoPage />

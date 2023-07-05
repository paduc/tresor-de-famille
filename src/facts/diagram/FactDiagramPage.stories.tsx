import React from 'react'
import { FactDiagramPage } from './FactDiagramPage'

export default { title: 'FactDiagramPage', component: FactDiagramPage }

export const primary = () => (
  <FactDiagramPage
    events={[
      {
        eventName: 'AWSDetectedFacesInPhoto',
        isPage: true,
        page: 'photo',
        subfolders: 'recognizeFacesInChatPhoto',
        fullPath: 'src/pages/photo/recognizeFacesInChatPhoto/AWSDetectedFacesInPhoto.ts',
        callsites: [
          {
            filePath: 'src/pages/photo/recognizeFacesInChatPhoto/detectFacesInPhotoUsingAWS.ts',
            fileName: 'detectFacesInPhotoUsingAWS.ts',
            line: 58,
          },
        ],
      },
      {
        eventName: 'FauxUtilisateurInscrit',
        fullPath: 'src/events/FauxUtilisateurInscrit.ts',
        isPage: false,
        callsites: [],
      },
      {
        eventName: 'GedcomImported',
        fullPath: 'src/events/GedcomImported.ts',
        isPage: false,
        callsites: [
          {
            filePath: 'src/pages/importGedcom/ImportGedcom.route.ts',
            fileName: 'ImportGedcom.route.ts',
            line: 87,
          },
        ],
      },
      {
        eventName: 'UserAddedBunnyCDNVideo',
        fullPath: 'src/events/UserAddedBunnyCDNVideo.ts',
        isPage: false,
        callsites: [
          {
            filePath: 'src/pages/addVideo/addVideo.route.ts',
            fileName: 'addVideo.route.ts',
            line: 17,
          },
        ],
      },
      {
        eventName: 'UserHasDesignatedThemselfAsPerson',
        fullPath: 'src/events/UserHasDesignatedThemselfAsPerson.ts',
        isPage: false,
        callsites: [
          {
            filePath: 'src/pages/whoAreYou/whoAreYou.route.ts',
            fileName: 'whoAreYou.route.ts',
            line: 24,
          },
        ],
      },
      {
        eventName: 'UserRegisteredWithEmailAndPassword',
        fullPath: 'src/events/UserRegisteredWithEmailAndPassword.ts',
        isPage: false,
        callsites: [
          {
            filePath: 'src/pages/auth/register.ts',
            fileName: 'register.ts',
            line: 26,
          },
        ],
      },
      {
        eventName: 'VideoSequenceAdded',
        fullPath: 'src/events/VideoSequenceAdded.ts',
        isPage: false,
        callsites: [
          {
            filePath: 'src/pages/videoAnnotation/videoAnnotation.route.ts',
            fileName: 'videoAnnotation.route.ts',
            line: 45,
          },
        ],
      },
      {
        eventName: 'UserPresentedThemselfUsingOpenAI',
        isPage: true,
        page: 'bienvenue',
        subfolders: 'step1-userTellsAboutThemselves',
        fullPath: 'src/pages/bienvenue/step1-userTellsAboutThemselves/UserPresentedThemselfUsingOpenAI.ts',
        callsites: [
          {
            filePath: 'src/pages/bienvenue/step1-userTellsAboutThemselves/parseFirstPresentation.ts',
            fileName: 'parseFirstPresentation.ts',
            line: 92,
          },
        ],
      },
      {
        eventName: 'PhotoAnnotatedUsingOpenAI',
        isPage: true,
        page: 'photo',
        subfolders: 'annotatePhotoUsingOpenAI',
        fullPath: 'src/pages/photo/annotatePhotoUsingOpenAI/PhotoAnnotatedUsingOpenAI.ts',
        callsites: [
          {
            filePath: 'src/pages/photo/annotatePhotoUsingOpenAI/annotatePhotoUsingOpenAI.ts',
            fileName: 'annotatePhotoUsingOpenAI.ts',
            line: 123,
          },
        ],
      },
      {
        eventName: 'PhotoAnnotationConfirmed',
        isPage: true,
        page: 'photo',
        subfolders: 'confirmPhotoAnnotation',
        fullPath: 'src/pages/photo/confirmPhotoAnnotation/PhotoAnnotationConfirmed.ts',
        callsites: [
          {
            filePath: 'src/pages/photo/confirmPhotoAnnotation/confirmOpenAIPhotoAnnotation.ts',
            fileName: 'confirmOpenAIPhotoAnnotation.ts',
            line: 30,
          },
          {
            filePath: 'src/pages/photo/confirmPhotoAnnotation/confirmAWSPhotoAnnotation.ts',
            fileName: 'confirmAWSPhotoAnnotation.ts',
            line: 24,
          },
        ],
      },
    ]}
  />
)

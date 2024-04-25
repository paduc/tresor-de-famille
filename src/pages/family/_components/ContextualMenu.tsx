import * as React from 'react'
import { useState } from 'react'
import { PersonId } from '../../../domain/PersonId.js'
import { primaryButtonStyles, secondaryButtonStyles } from '../../_components/Button.js'
import { TDFModal } from '../../_components/TDFModal.js'
import { PersonPageURL } from '../../person/PersonPageURL.js'
import { NewRelationshipAction } from './TreeTypes.js'

const ContextualMenuContext = React.createContext<
  | { isOpen: boolean; close: () => unknown; open: (personId: PersonId) => unknown; selectedPersonId: PersonId | null }
  | undefined
>(undefined)

export const useContextualMenu = function () {
  const context = React.useContext(ContextualMenuContext)

  if (!context) {
    throw new Error('Cannot useContextualMenu outside of Provider')
  }

  return context
}

export function ContextualMenuProvider({ children }: { children: React.ReactNode }) {
  const [selectedPersonId, setSelectedPersonId] = useState<PersonId | null>(null)

  return (
    <ContextualMenuContext.Provider
      value={{
        isOpen: !!selectedPersonId,
        close: () => setSelectedPersonId(null),
        open: (personId: PersonId) => {
          setSelectedPersonId(personId)
        },
        selectedPersonId,
      }}>
      {children}
    </ContextualMenuContext.Provider>
  )
}

type ContextualMenuProps = {
  onRelationshipButtonPressed: (personId: PersonId, newRelationshipAction: NewRelationshipAction) => unknown
}
export function ContextualMenu({ onRelationshipButtonPressed }: ContextualMenuProps) {
  const { isOpen, close, selectedPersonId } = useContextualMenu()

  const handleButtonPress = (newRelationshipAction: NewRelationshipAction) => () => {
    if (selectedPersonId) {
      close()
      onRelationshipButtonPressed(selectedPersonId, newRelationshipAction)
    }
  }

  return (
    <TDFModal isOpen={isOpen} close={close}>
      <div className='mt-8'>
        <button
          onClick={handleButtonPress('addParent')}
          className={`mb-4 ${secondaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
          Gérer les parents
        </button>
        <button
          onClick={handleButtonPress('addChild')}
          className={`mb-4 ${secondaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
          Gérer les enfants
        </button>
        <button
          onClick={handleButtonPress('addSpouse')}
          className={`mb-4 ${secondaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
          Gérer les époux/compagnes
        </button>
        <a
          href={PersonPageURL(selectedPersonId!)}
          className={`mb-4 ${primaryButtonStyles.replace(/inline\-flex/g, '')} block w-full text-center`}>
          Aller à la page profil
        </a>
      </div>
    </TDFModal>
  )
}

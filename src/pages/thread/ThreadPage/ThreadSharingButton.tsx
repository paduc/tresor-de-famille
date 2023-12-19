import React, { useState } from 'react'
import { primaryButtonStyles, secondaryButtonStyles } from '../../_components/Button'
import { useLoggedInSession } from '../../_components/SessionContext'
import { TDFModal } from '../../_components/TDFModal'
import { FamilyId } from '../../../domain/FamilyId'

type ThreadSharingButtonProps = {
  familyId: FamilyId
  isAuthor: boolean
}

export function ThreadSharingButton({ familyId, isAuthor }: ThreadSharingButtonProps) {
  const session = useLoggedInSession()
  const [isFamilyModalOpen, openFamilyModal] = useState<boolean>(false)
  const family = session.userFamilies.find((f) => f.familyId === familyId)
  return (
    <>
      <TDFModal
        title='Choisissez la famille avec laquelle vous voulez partager cette histoire'
        isOpen={isFamilyModalOpen}
        close={() => openFamilyModal(false)}>
        <div className='mt-8'>
          {session.userFamilies
            .filter((f) => f.familyId !== familyId)
            .map((family) => (
              <form key={`select_${family.familyId}`} method='POST'>
                <input type='hidden' name='action' value='shareWithFamily' />
                <input type='hidden' name='familyId' value={family.familyId} />
                <button
                  key={`add_to_${family.familyId}`}
                  type='submit'
                  className={`mb-4 ${secondaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
                  {family.familyName}
                </button>
              </form>
            ))}
          <button
            onClick={() => {
              openFamilyModal(false)
            }}
            className={`mb-4 ${primaryButtonStyles.replace(/inline\-flex/g, '')}  w-full text-center`}>
            Annuler
          </button>
        </div>
      </TDFModal>
      {(familyId as string) === (session.userId as string) ? (
        <>
          <span className='text-gray-500 mr-2'>Uniquement vous pouvez voir cette histoire.</span>
          <button className={`${primaryButtonStyles}`} onClick={() => openFamilyModal(true)}>
            Partager
          </button>
        </>
      ) : (
        <>
          <span className='text-gray-500 mr-2'>Partagé avec les membres de</span>
          {isAuthor ? (
            <button
              onClick={() => openFamilyModal(true)}
              className={`px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm ring-inset ring-2 hover:bg-white hover:ring-4 ${family?.color} ring-2`}>
              {family?.familyName || 'Personnel'}
            </button>
          ) : (
            <span
              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-md font-medium rounded-full shadow-sm ring-inset ${family?.color} ring-2`}>
              {family?.familyName || 'Personnel'}
            </span>
          )}
        </>
      )}
    </>
  )
}

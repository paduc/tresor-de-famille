import React, { useContext } from 'react'

export const SelectDOMNodeForInsertionCtx = React.createContext<
  ((args: { node: HTMLElement; type: 'photos' | 'media' } | undefined) => unknown) | null
>(null)

/* 
  selectDOMNodeForInsertion is used to set the target DOM node for insertion of media or photos
  see SeparatorNode
*/
export function useSelectDOMNodeForInsertion() {
  const selectDOMNodeForInsertion = useContext(SelectDOMNodeForInsertionCtx)

  if (selectDOMNodeForInsertion === null) {
    throw new Error('useSelectedNodeForMediaContext used outside of a provider')
  }

  return { selectDOMNodeForInsertion }
}

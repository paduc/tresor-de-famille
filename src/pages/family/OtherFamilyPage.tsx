import React from 'react'

export function OtherFamilyPage() {
  return (
    <ClientOnly>
      <ContextualMenuProvider>
        <ClientOnlyFamilyPage {...props} />
      </ContextualMenuProvider>
    </ClientOnly>
  )
}

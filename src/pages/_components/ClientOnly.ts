import React from 'react'

// Lifted from https://www.joshwcomeau.com/react/the-perils-of-rehydration/

type ClientOnlyProps = { children: React.ReactNode }

/**
 * Fixes hydration problems where server and client do not produce the same output
 * Ex: Dates
 * @param JSX Element
 * @returns JSX Element
 */
export const ClientOnly = ({ children }: ClientOnlyProps): JSX.Element | null => {
  const [hasMounted, setHasMounted] = React.useState(false)

  React.useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null
  }

  // @ts-ignore
  return children
}

import * as React from 'react'
import { Person } from '../../events'
import { withBrowserBundle } from '../../libs/ssr'
import { AppLayout } from '../_components/layout/AppLayout'

export const HomePage = (props: { person: Person | null }) => {
  const { person } = props
  return <AppLayout>Bienvenu sur Trésor de famille {person ? person.name : ''}</AppLayout>
}

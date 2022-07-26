import * as React from 'react'
import { withBrowserBundle } from '../../libs/ssr'
import { AppLayout } from '../_components/layout/AppLayout'

export const HomePage = withBrowserBundle(() => {
  return <AppLayout>Bienvenu sur Trésor de famille</AppLayout>
})

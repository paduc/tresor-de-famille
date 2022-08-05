import * as React from 'react'
import { SessionContext } from '../_components'

import { ImportGedcomSuccessPage } from './ImportGedcomSuccessPage'
import { GedcomImported } from '../../events/GedcomImported'

export default { title: 'Page avec un gedcom import success', component: ImportGedcomSuccessPage }

let gedcom: GedcomImported

export const Basique = () => <ImportGedcomSuccessPage gedcom={gedcom} />

import * as React from 'react'

import { PersonPage } from './PersonPage'
import { PersonPageProps } from './PersonPage'

export default { title: 'Page de profil', component: PersonPage }

export const Basique = ({ personInfo }: PersonPageProps) => <PersonPage userId='123' personId='123' personInfo={personInfo} />

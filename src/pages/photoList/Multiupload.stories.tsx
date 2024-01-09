import React from 'react'
import { Multiupload } from './Multiupload'

export default { title: 'Multiupload', component: Multiupload, parameters: { layout: 'fullscreen' } }

export const Basique = () => <Multiupload mock>{(open) => <button onClick={open}>Open</button>}</Multiupload>

export const Erreur = () => <Multiupload mock={false}>{(open) => <button onClick={open}>Open</button>}</Multiupload>

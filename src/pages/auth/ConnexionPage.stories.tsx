import * as React from 'react'

import { ConnexionPage } from './ConnexionPage.js'

export default { title: 'Page de connexion', component: ConnexionPage }

export const Basique = () => <ConnexionPage />
export const Register = () => <ConnexionPage loginType='register' />
export const AvecErreurEmail = () => <ConnexionPage email='test@test' errors={{ email: 'Email non reconnu.' }} />
export const AvecErreurDeMotDePasse = () => (
  <ConnexionPage email='test@test.com' errors={{ password: 'Mot de passe trop court' }} />
)

export const AvecErreursMultiples = () => (
  <ConnexionPage email='test@test' errors={{ email: 'Email non reconnu.', password: 'Mot de passe trop court' }} />
)

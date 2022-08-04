import * as React from 'react'
import { Person } from '../../types/Person'
import { ProfilePicturePlaceholder } from './ProfilePicturePlaceholder'

interface ProfilePictureProps {
  person: Person
  className?: string
}

export const ProfilePicture = ({ person, className }: ProfilePictureProps) => {
  if (person.profilePictureId)
    return (
      <img className={className} src={'../images/default-profile-icon-24.jpeg'} alt={`Profile picture of ${person.name}`} />
    )

  return <ProfilePicturePlaceholder className={`text-gray-300 ${className}`} />
}

import React from 'react'

interface LogoProps {
  style?: any
  className?: string
}

export const Logo = ({ style, className }: LogoProps) => {
  return <img src='http://localhost:3000/images/logo-light-transparent-152x152.png' style={style || {}} className={className} />
}

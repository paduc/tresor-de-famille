import React from 'react'

interface LogoProps {
  style?: any
  className?: string
}

export const Logo = ({ style, className }: LogoProps) => {
  return <img src='images/tdf-picto-black-transparent.png' style={style || {}} className={className} />
}

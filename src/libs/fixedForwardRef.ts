import React, { forwardRef } from 'react'

// Declare a type that works with
// generic components
type FixedForwardRef = <T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactNode
) => (props: P & React.RefAttributes<T>) => JSX.Element

// Cast the old forwardRef to the new one
export const fixedForwardRef = forwardRef as FixedForwardRef

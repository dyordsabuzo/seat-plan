import React from 'react'

type Props = {
  children: React.ReactNode
  className?: string
}

const PageContainer: React.FC<Props> = ({ children, className = '' }) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
  )
}

export default PageContainer

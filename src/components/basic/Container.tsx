import React from 'react'

type Props = {
    children: React.ReactNode
    className?: string
}

const Container: React.FC<Props> = ({children, className = ''}) => {
    // Responsive container: full width on mobile, constrained on larger screens
    return (
        <div className={`w-full px-4 sm:px-6 lg:px-8 ${className}`}>
            <div className={`mx-auto w-full max-w-4xl`}>{children}</div>
        </div>
    )
}

export default Container

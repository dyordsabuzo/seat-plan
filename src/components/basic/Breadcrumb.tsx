import React from 'react'
import {Link, useNavigate} from 'react-router-dom'

type Item = { label: string; to?: string }

type Props = {
    items?: Item[]
    title?: string
    backPath?: string
    className?: string
}

export default function Breadcrumb({items = [], title, backPath = '/', className = ''}: Props) {
    const navigate = useNavigate()

    return (
        <div className={className}>
            <nav className="hidden sm:block" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm text-gray-500">
                    {items.map((it, idx) => (
                        <React.Fragment key={idx}>
                            {it.to ? (
                                <li><Link to={it.to} className={`
                                    text-gray-600 hover:text-gray-800 bg-white py-1 rounded
                                    ${idx === 0 ? "pr-2" : "px-2"}
                                `}>{it.label}</Link></li>
                            ) : (
                                <li><span className={`
                                    text-gray-600 bg-white py-1 rounded
                                    ${idx === 0 ? "pr-2" : "px-2"}
                                `}>{it.label}</span></li>
                            )}
                            <li>
                                <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </li>
                        </React.Fragment>
                    ))}
                    <li><span className="text-gray-800 font-medium truncate max-w-[40ch] px-2 py-1">{title}</span></li>
                </ol>
            </nav>

            <div className="sm:hidden">
                <button onClick={() => navigate(backPath)} className="text-sm text-gray-600 hover:text-gray-800 bg-white px-3 py-1 rounded flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back
                </button>
            </div>
        </div>
    )
}


import React from 'react'

type Props = {
    label: React.ReactNode
    /** action callback when the right-side control is clicked */
    onAction?: () => void
    /** optional custom action node (icon/button) to render on the right */
    actionNode?: React.ReactNode
    /** aria label for the action button (required for accessibility when actionNode is provided) */
    actionAriaLabel?: string
    /** show the action only when hovering the container */
    showActionOnHover?: boolean
}

export function LabelWidget({label, onAction, actionNode, actionAriaLabel = 'Action', showActionOnHover = true}: Props) {
    return (
        <div className={`relative group`}>
            <div className={`flex flex-start`}>{label}</div>

            {/* Right-most action control. Positioned vertically centered and anchored to the right edge. */}
            {(onAction || actionNode) && (
                <div className={`absolute -right-2 sm:-right-4 top-1/2 transform -translate-y-1/2`}>
                    <button
                        type="button"
                        aria-label={actionAriaLabel}
                        onClick={onAction}
                        className={`
                            inline-flex items-center justify-center p-1 rounded 
                            `}>
                                {/* ${showActionOnHover ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-150' : ''} */}
                        {/* {actionNode ? (
                            actionNode
                        ) : (
                        )} */}
                        <span className={`text-xs text-gray-500 border border-gray-300 rounded px-1`}>x</span>
                    </button>
                </div>
            )}
        </div>
    )
}
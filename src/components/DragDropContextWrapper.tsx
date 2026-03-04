import React from 'react'
import type { DragDropContextProps } from 'react-beautiful-dnd'
import { DragDropContext } from 'react-beautiful-dnd'

// Provide a small, typed wrapper for DragDropContext to satisfy TypeScript's JSX checks
const DragDropContextWrapper = (DragDropContext as unknown) as React.ComponentType<DragDropContextProps>

export default DragDropContextWrapper

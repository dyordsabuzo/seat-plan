import React from 'react'
import type { DraggableProps, DroppableProps } from 'react-beautiful-dnd'
import { Draggable, Droppable } from 'react-beautiful-dnd'

// Typed wrappers to satisfy JSX type-checking
const DroppableWrapper = (Droppable as unknown) as React.ComponentType<DroppableProps>
const DraggableWrapper = (Draggable as unknown) as React.ComponentType<DraggableProps>

export { DraggableWrapper as Draggable, DroppableWrapper as Droppable }


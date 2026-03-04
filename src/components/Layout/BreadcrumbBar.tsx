import React from 'react'
import { useLocation } from 'react-router-dom'
import Breadcrumb from '../basic/Breadcrumb'

const LABELS: Record<string, string> = {
  '': 'Home',
  'manage': 'Manage',
  'category': 'Category',
  'type': 'Type',
  'distance': 'Distance',
  'boat': 'Boat',
  'paddlers': 'Paddlers',
  'setupboard': 'Setup Board',
  'clubs': 'Clubs',
  'paddler-list': 'Paddler List',
}

function niceLabel(segment: string) {
  if (LABELS[segment]) return LABELS[segment]
  // fallback: capitalize
  return segment.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const BreadcrumbBar: React.FC = () => {
  const loc = useLocation()
  const parts = loc.pathname.split('/').filter(Boolean)

  const items = parts.map((seg, idx) => {
    const to = '/' + parts.slice(0, idx + 1).join('/')
    return { label: niceLabel(seg), to }
  })

  const title = parts.length ? niceLabel(parts[parts.length - 1]) : 'Home'

  // Prepend home if there are items
  const itemsWithHome = parts.length ? [{ label: 'Home', to: '/' }, ...items.slice(0, -1)] : []

  return <div className="px-4 py-3 border-b bg-white">
    <div className="max-w-7xl mx-auto">
      <Breadcrumb items={itemsWithHome} title={title} backPath={'/'} />
    </div>
  </div>
}

export default BreadcrumbBar

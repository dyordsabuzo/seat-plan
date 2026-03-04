import React from 'react'
import { Outlet } from 'react-router-dom'
import UserFloating from '../complex/widgets/UserFloating'
import BreadcrumbBar from './BreadcrumbBar'
import PageContainer from './PageContainer'

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserFloating />
      <BreadcrumbBar />
      <main>
        <PageContainer className="py-6">
          <Outlet />
        </PageContainer>
      </main>
    </div>
  )
}

export default MainLayout

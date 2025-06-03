import React from 'react'
import {Outlet} from 'react-router-dom'
import Header from './Header2.jsx'

const Layout = () => {
  return (
    <div className=' stick min-h-screen  flex-col overflow-hidden'>
    <Header/>
    
    <Outlet/>
    
    </div>
  )
}

export default Layout
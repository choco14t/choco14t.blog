import React from 'react'

import Header from '../header/index'
import Footer from '../footer/index'
import '../../styles/index.scss'
import layoutStyles from './layout.module.scss'

const Layout = props => {
  return (
    <>
      <Header />
      <div className={layoutStyles.container}>
        <main className={layoutStyles.content}>
          {props.children}
        </main>
      </div>
      <Footer />
    </>
  )
}

export default Layout

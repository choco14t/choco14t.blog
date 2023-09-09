import { ReactNode } from 'react'
import Header from '../header'
import Footer from '../footer'
import '../../styles/index.scss'
import * as layoutStyles from './layout.module.scss'

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      <div className={layoutStyles.container}>
        <main className={layoutStyles.content}>
          {children}
        </main>
      </div>
      <Footer />
    </>
  )
}

export default Layout

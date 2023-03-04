import React from 'react'
import { Link, graphql, useStaticQuery } from 'gatsby'

import * as headerStyles from './header.module.scss'

const Header = () => {
  const data = useStaticQuery(graphql`
    query HeaderIndex {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <header className={headerStyles.header}>
      <div className={headerStyles.inner}>
        <Link to="/" className={headerStyles.brand}>
          {data.site.siteMetadata.title}
        </Link>
      </div>
    </header>
  )
}

export default Header

import React from 'react'
import { graphql, Link, useStaticQuery } from 'gatsby'
import { FaGithub, FaRss } from 'react-icons/fa'

import * as footerStyles from './footer.module.scss'

const Footer = () => {
  const data = useStaticQuery(graphql`
    query FooterIndex {
      site {
        siteMetadata {
          author
        }
      }
    }
  `)

  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.inner}>
        <div>
          <address>
            © {data.site.siteMetadata.author} All rights reserved.
          </address>
        </div>
        <div>
          <Link to="/rss.xml"><FaRss /></Link>
          <a href="https://github.com/choco14t" target="_blank" rel="noopener noreferrer"><FaGithub/></a>
        </div>
      </div>
    </footer>
  )
}

export default Footer

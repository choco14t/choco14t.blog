import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import { FaTwitter, FaGithub } from 'react-icons/fa'

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
          <a href="https://twitter.com/choco14t" target="_blank" rel="noopener noreferrer"><FaTwitter/></a>
          <a href="https://github.com/choco14t" target="_blank" rel="noopener noreferrer"><FaGithub/></a>
        </div>
      </div>
    </footer>
  )
}

export default Footer

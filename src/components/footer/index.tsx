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
      <div className={footerStyles.container}>
        <div className={footerStyles.inner}>
          <address>© {data.site.siteMetadata.author} All rights reserved.</address>
          <div>
            <Link to="/rss.xml"><FaRss /></Link>
            <a href="https://github.com/choco14t" target="_blank" rel="noopener noreferrer"><FaGithub/></a>
          </div>
        </div>

        <div className={footerStyles.ga}>
          <p>
            当サイトでは Google Analytics を使用しています。
            詳細は <a href='https://policies.google.com/technologies/partner-sites?hl=ja'>Google のサービスを使用するサイトやアプリから収集した情報の Google による使用 – ポリシーと規約</a> をご覧ください。
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

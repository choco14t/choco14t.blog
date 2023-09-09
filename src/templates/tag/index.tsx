import { graphql, PageProps } from 'gatsby'
import { FaTag } from 'react-icons/fa'

import { TagPageContext } from '../../../gatsby-node'
import Layout from '../../components/layout'
import Seo from '../../components/seo'
import Article from '../../components/article'
import * as tagPageStyles from './tag.module.scss'

const TagPageTemplate = ({
  data,
  pageContext,
}: PageProps<Queries.TagPageTemplateQuery, TagPageContext>) => {
  const { tag } = pageContext

  return (
    <Layout>
      <Seo title={data.site?.siteMetadata?.title ?? 'blog.choco14t.net'} />
      <div className={tagPageStyles.top}>
        <h1>
          <FaTag />
          <span>{tag}</span>
        </h1>
      </div>
      {data.allMarkdownRemark.edges.map(edge => {
        return (
          <Article
            key={edge.node.frontmatter?.slug}
            date={edge.node.frontmatter?.date ?? ''}
            slug={edge.node.frontmatter?.slug ?? ''}
            tags={(edge.node.frontmatter?.tags as string[]) ?? []}
            title={edge.node.frontmatter?.title ?? ''}
          />
        )
      })}
    </Layout>
  )
}

export const pageQuery = graphql`
  query TagPageTemplate($tag: String!) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      filter: { frontmatter: { draft: { eq: false }, tags: { in: [$tag] } } }
      sort: { frontmatter: { date: DESC } }
      limit: 1000
    ) {
      edges {
        node {
          frontmatter {
            slug
            date(formatString: "YYYY-MM-DD")
            title
            tags
          }
          excerpt
        }
      }
    }
  }
`

export default TagPageTemplate

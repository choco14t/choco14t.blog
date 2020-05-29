import React from 'react'
import { graphql } from 'gatsby'
import { FaTag } from 'react-icons/fa'

import Layout from '../../components/layout'
import Seo from '../../components/seo'
import Article from '../../components/article'
import tagPageStyles from './tag.module.scss'

const TagPageTemplate = ({ data, pageContext }) => {
  const { tag } = pageContext

  return (
    <Layout>
      <Seo title={data.site.siteMetadata.title} />
      <div className={tagPageStyles.top}>
        <h1>
          <FaTag />
          <span>{tag}</span>
        </h1>
      </div>
      {data.allMarkdownRemark.edges.map(edge => {
        return (
          <Article
            key={edge.node.frontmatter.slug}
            date={edge.node.frontmatter.date}
            excerpt={edge.node.excerpt}
            slug={edge.node.fields.slug}
            tags={edge.node.frontmatter.tags}
            title={edge.node.frontmatter.title}
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
      filter: { frontmatter: { tags: { in: [$tag] } } }
      sort: { fields: [frontmatter___date], order: DESC }
      limit: 1000
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            date(formatString: "YYYY-MM-DD")
            title
            description
            tags
          }
          excerpt
        }
      }
    }
  }
`

export default TagPageTemplate

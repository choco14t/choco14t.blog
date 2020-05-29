import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'

import Layout from '../components/layout/index'
import Seo from '../components/seo/index'
import Article from '../components/article'

const BlogIndex = () => {
  const data = useStaticQuery(graphql`
    query BlogIndex {
      allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
        edges {
          node {
            frontmatter {
              title
              date(formatString: "YYYY-MM-DD")
              slug
              tags
            }
            excerpt(pruneLength: 100, truncate: true)
          }
        }
      }
    }
  `)

  return (
    <Layout>
      <Seo title="choco14t.blog" />
      {data.allMarkdownRemark.edges.map(edge => {
        return (
          <Article
            key={edge.node.frontmatter.slug}
            date={edge.node.frontmatter.date}
            excerpt={edge.node.excerpt}
            slug={edge.node.frontmatter.slug}
            tags={edge.node.frontmatter.tags}
            title={edge.node.frontmatter.title}
          />
        )
      })}
    </Layout>
  )
}

export default BlogIndex

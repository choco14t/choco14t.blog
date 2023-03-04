import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'

import Layout from '../components/layout'
import Seo from '../components/seo'
import Article from '../components/article'

const BlogIndex = () => {
  const data = useStaticQuery<Queries.BlogIndexQueryQuery>(graphql`
    query BlogIndexQuery {
      allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
        edges {
          node {
            id
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
      <Seo title="blog.choco14t.net" />
      {data.allMarkdownRemark.edges.map((edge) => {
        return (
          <Article
            key={edge.node.id}
            date={edge.node.frontmatter?.date ?? ''}
            excerpt={edge.node.excerpt ?? ''}
            slug={edge.node.frontmatter?.slug ?? ''}
            tags={(edge.node.frontmatter?.tags as string[]) ?? []}
            title={edge.node.frontmatter?.title ?? ''}
          />
        )
      })}
    </Layout>
  )
}

export default BlogIndex


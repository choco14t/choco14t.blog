import React from 'react'
import { graphql, Link } from 'gatsby'
import { FaTags } from 'react-icons/fa'

import Layout from '../../components/layout'
import Seo from '../../components/seo'

import * as postPageStyles from './post.module.scss'

const PostPageTemplate = ({ data }) => {
  return (
    <Layout>
      <Seo title={data.markdownRemark.frontmatter.title} />
      <article>
        <h1 className={postPageStyles.title}>
          {data.markdownRemark.frontmatter.title}
        </h1>
        <div className={postPageStyles.tagContainer}>
          <FaTags />
          {data.markdownRemark.frontmatter.tags.map((tag, index) => (
            <Link
              to={`/tags/${tag}`}
              key={index}
              className={postPageStyles.tag}
            >
              {tag}
            </Link>
          ))}
        </div>
        <section
          dangerouslySetInnerHTML={{ __html: data.markdownRemark.html }}
        />
      </article>
    </Layout>
  )
}

export const pageQuery = graphql`
  query PostTemplate($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      frontmatter {
        title
        date
        tags
      }
      html
    }
  }
`

export default PostPageTemplate

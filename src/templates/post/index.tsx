import React from 'react'
import { graphql, Link, PageProps } from 'gatsby'
import { FaTags } from 'react-icons/fa'

import Layout from '../../components/layout'
import Seo from '../../components/seo'

import * as postPageStyles from './post.module.scss'

const PostPageTemplate = ({ data }: PageProps<Queries.PostTemplateQueryQuery>) => {
  return (
    <Layout>
      <Seo title={data.markdownRemark?.frontmatter?.title ?? 'blog.choco14t.net'} />
      <article>
        <h1 className={postPageStyles.title}>
          {data.markdownRemark?.frontmatter?.title}
        </h1>
        <div className={postPageStyles.tagContainer}>
          <FaTags />
          {data.markdownRemark?.frontmatter?.tags?.map((tag) => (
            <Link
              to={`/tags/${tag}`}
              key={data.markdownRemark?.id}
              className={postPageStyles.tag}
            >
              {tag}
            </Link>
          ))}
        </div>
        <section
          dangerouslySetInnerHTML={{ __html: data.markdownRemark?.html ?? '' }}
        />
      </article>
    </Layout>
  )
}

export const pageQuery = graphql`
  query PostTemplateQuery($id: String!) {
    markdownRemark(id: { eq: $id }) {
      id
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


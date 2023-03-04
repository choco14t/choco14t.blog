import { GatsbyNode } from 'gatsby'
import path from 'path'

export const createPages: GatsbyNode['createPages'] = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  await createPostPages(createPage, graphql, reporter)
  await createTagPages(createPage, graphql, reporter)
}

export interface PostPageContext {
  id: string
}

const createPostPages = async (
  createPage: Parameters<NonNullable<GatsbyNode['createPages']>>['0']['actions']['createPage'],
  graphql: Parameters<NonNullable<GatsbyNode['createPages']>>['0']['graphql'],
  reporter: Parameters<NonNullable<GatsbyNode['createPages']>>['0']['reporter'],
) => {
  const response = await graphql<Queries.PostPagesQueryQuery>(`
    query PostPagesQuery {
      articles: allMarkdownRemark(
        sort: { frontmatter: { date: DESC } },
        filter: { frontmatter: { draft: { eq: false } } },
        limit: 1000
      ) {
        edges {
          node {
            id
            frontmatter {
              slug
              tags
            }
          }
        }
      }
    }
  `)

  if (!response.data || response.errors) {
    reporter.panicOnBuild('Error while running GraphQL query.')
    return
  }

  response.data.articles.edges.forEach(({ node }) => {
    createPage<PostPageContext>({
      component: path.resolve('./src/templates/post/index.tsx'),
      path: `/posts/${node.frontmatter?.slug}`,
      context: {
        id: node.id
      }
    })
  })
}

export interface TagPageContext {
  tag: string
}

const createTagPages = async (
  createPage: Parameters<NonNullable<GatsbyNode['createPages']>>['0']['actions']['createPage'],
  graphql: Parameters<NonNullable<GatsbyNode['createPages']>>['0']['graphql'],
  reporter: Parameters<NonNullable<GatsbyNode['createPages']>>['0']['reporter'],
) => {
  const response = await graphql<Queries.TagPagesQueryQuery>(`
    query TagPagesQuery {
      tags: allMarkdownRemark(limit: 1000) {
        distinct(field: { frontmatter: { tags: SELECT } })
      }
    }
  `)

  if (!response.data || response.errors) {
    reporter.panicOnBuild('Error while running GraphQL query.')
    return
  }

  response.data.tags.distinct.forEach((tag) => {
    createPage<TagPageContext>({
      component: path.resolve('./src/templates/tag/index.tsx'),
      path: `/tags/${tag}`,
      context: {
        tag
      }
    })
  })
}


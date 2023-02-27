import path from 'path'

module.exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === 'MarkdownRemark') {
    createNodeField({
      node,
      name: 'slug',
      value: node.frontmatter.slug
    })
  }
}

module.exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions
  const postPageTemplate = path.resolve('./src/templates/post/index.tsx')
  const tagPageTemplate = path.resolve('./src/templates/tag/index.tsx')
  const response = await graphql(`{
    postsRemark: allMarkdownRemark(
      sort: { frontmatter: { date: DESC } },
      filter: { frontmatter: { draft: { eq: false } } },
      limit: 1000
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            tags
          }
        }
      }
    }
    tagsGroup: allMarkdownRemark(limit: 1000) {
      distinct(field: { frontmatter: { tags: SELECT } })
    }
  }`)

  if (response.errors) {
    reporter.panicOnBuild('Error while running GraphQL query.')
    return
  }

  // Article detail pages
  response.data.postsRemark.edges.forEach(({ node }) => {
    createPage({
      component: postPageTemplate,
      path: `/posts/${node.fields.slug}`,
      context: {
        slug: node.fields.slug
      }
    })
  })

  // Tag pages
  response.data.tagsGroup.distinct.forEach((tag) => {
    createPage({
      component: tagPageTemplate,
      path: `/tags/${tag}`,
      context: {
        tag
      }
    })
  })
}

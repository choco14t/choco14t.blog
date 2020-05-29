const path = require('path')

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
  const postPageTemplate = path.resolve('./src/templates/post/index.js')
  const tagPageTemplate = path.resolve('./src/templates/tag/index.js')
  const response = await graphql(`{
    postsRemark: allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC },
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
      group(field: frontmatter___tags) {
        fieldValue
      }
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
  response.data.tagsGroup.group.forEach(({ fieldValue }) => {
    createPage({
      component: tagPageTemplate,
      path: `/tags/${fieldValue}`,
      context: {
        tag: fieldValue
      }
    })
  })
}

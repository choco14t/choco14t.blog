/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

const title = 'blog.choco14t.net'

module.exports = {
  siteMetadata: {
    title,
    author: 'choco',
    description: 'blog.choco14t.net',
    siteUrl: 'https://blog.choco14t.net',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-sass',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'contents',
        path: `${__dirname}/contents/`
      }
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          'gatsby-remark-relative-images',
          'gatsby-remark-code-titles',
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 500,
              linkImagesToOriginal: false
            }
          },
          {
            resolve: `gatsby-remark-shiki`,
            options: {
              theme: 'nord',
            },
          },
        ]
      }
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: title,
        short_name: title,
        start_url: `/`,
        display: 'standalone',
        icon: 'static/icon.png'
      }
    },
    {
      resolve: 'gatsby-plugin-google-gtag',
      options: {
        trackingIds: [
          'G-CJJ2ER4EPC',
        ]
      }
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map(edge => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  date: edge.node.frontmatter.date,
                  url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  custom_elements: [{ "content:encoded": edge.node.html }],
                })
              })
            },
            query: `
              {
                allMarkdownRemark(
                  sort: { order: DESC, fields: [frontmatter___date] },
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields { slug }
                      frontmatter {
                        title
                        date
                      }
                    }
                  }
                }
              }
            `,
            output: '/rss.xml',
            title: 'choco14t.blog RSS Feed',
          },
        ],
      },
    },
  ]
}

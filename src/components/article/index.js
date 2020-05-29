import React from 'react'
import { Link } from 'gatsby'
import { FaClock, FaTags } from 'react-icons/fa'

import articleStyles from './article.module.scss'

const Article = ({ date, excerpt, slug, tags, title }) => {
  return (
    <article className={articleStyles.article}>
      <h3 className={articleStyles.title}><Link to={`/posts/${slug}`}>{title}</Link></h3>
      <p>{excerpt}</p>

      <div className={articleStyles.metaContainer}>
        <div className={articleStyles.meta}>
          <FaClock/>
          <span>{date}</span>
        </div>

        <div className={articleStyles.meta}>
          <FaTags/>
          {tags.map(tag => (
            <span className={articleStyles.tag}>
              <Link to={`/tags/${tag}`}>{tag}</Link>
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export default Article

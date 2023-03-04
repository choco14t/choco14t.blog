import React from 'react'
import { Link } from 'gatsby'
import { FaClock, FaTags } from 'react-icons/fa'

import * as articleStyles from './article.module.scss'

type Props = {
  date: string
  excerpt: string
  slug: string
  tags: string[]
  title: string
}

const Article = ({ date, excerpt, slug, tags, title }: Props) => {
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
          {tags.map((tag) => (
            <span key={`${slug}_${tag}`} className={articleStyles.tag}>
              <Link to={`/tags/${tag}`}>{tag}</Link>
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export default Article

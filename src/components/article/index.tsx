import { Link } from 'gatsby'
import { FaClock, FaTags } from 'react-icons/fa'

import * as articleStyles from './article.module.scss'

type Props = {
  date: string
  slug: string
  tags: string[]
  title: string
}

const Article = ({ date, slug, tags, title }: Props) => {
  return (
    <article className={articleStyles.article}>
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
      <h3 className={articleStyles.title}><Link to={`/posts/${slug}`}>{title}</Link></h3>
    </article>
  )
}

export default Article

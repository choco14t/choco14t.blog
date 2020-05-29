import React from 'react'
import { Helmet } from 'react-helmet'

const Seo = ({ lang, title, imageUrl }) => {
  return <Helmet htmlAttributes={{ lang }} title={title} />
}

Seo.defaultProps = {
  lang: 'ja',
  description: '',
  imageUrl: '',
}

export default Seo

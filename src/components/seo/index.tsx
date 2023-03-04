import React from 'react'
import { Helmet } from 'react-helmet'

type Props = {
  title: string
  lang?: string
}

const Seo = ({ title, lang = 'ja' }: Props) => {
  return <Helmet htmlAttributes={{ lang }} title={title} />
}

export default Seo

import React from 'react'

import Layout from '../components/layout/index'
import Seo from '../components/seo/index'

const NotFound = () => {
  return (
    <Layout>
      <Seo title="Not Found" />
      <h1>Not Found</h1>
      <p>ページが見つかりませんでした</p>
    </Layout>
  )
}

export default NotFound

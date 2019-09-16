'use strict';

module.exports = {
  url: 'https://choco14t.blog',
  pathPrefix: '/',
  title: 'Untitled',
  subtitle: '技術のことや日常のことを書いてます。',
  copyright: '© choco14t All rights reserved.',
  disqusShortname: 'choco',
  postsPerPage: 4,
  googleAnalyticsId: process.env.GATSBY_GOOGLE_ANALYTICS_ID,
  useKatex: false,
  menu: [
    {
      label: 'All Articles',
      path: '/'
    },
    {
      label: 'Dev',
      path: '/category/dev'
    },
    {
      label: 'Diary',
      path: '/category/diary'
    },
    {
      label: 'Tags',
      path: '/tags'
    }
  ],
  author: {
    name: 'choco',
    photo: '/icon.png',
    bio: 'プログラム書いてなんとか生きてます。',
    contacts: {
      email: '',
      facebook: '',
      telegram: '',
      twitter: 'choco14t',
      github: 'choco14t',
      rss: 'rss.xml',
      vkontakte: '',
      linkedin: '',
      instagram: '',
      line: '',
      gitlab: '',
      weibo: ''
    }
  }
};

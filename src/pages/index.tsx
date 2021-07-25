import { GetStaticProps } from 'next';
import Head from 'next/head'
import Link from 'next/link'

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi'

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean
}

export default function Home({ postsPagination: { next_page, results }, preview }: HomeProps) {
  const [nextPageLink, setNextPageLink] = useState<string | null>(next_page)
  const [posts, setPosts] = useState(results)

  async function loadMore() {
    if(!nextPageLink) {
      return
    }
    const response = await fetch(nextPageLink)
    const rawPosts = await response.json()

    const newPosts = rawPosts.results.map(p => {
      return {
        uid: p.uid,
        data: {
          title: p.data.title,
          subtitle: p.data.subtitle,
          author: p.data.author,
        },
        first_publication_date: format(new Date(p.first_publication_date), 'dd MMM u', {locale: ptBR})
      }
    })
    
    setNextPageLink(rawPosts.next_page)
    setPosts(current => [...current, ...newPosts])
  }
  
  // TODO
  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>
      <main className={commonStyles.content}>
        {posts.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a className={styles.post}>
              <h2>{post.data.title}</h2>
              <p>{post.data.subtitle}</p>
              <div>
                <div><FiCalendar />{post.first_publication_date}</div>
                <div><FiUser />{post.data.author}</div>
              </div>
            </a>
          </Link>
        ))}
        {nextPageLink && <button className={styles.loadMore} onClick={loadMore}>Carregar mais posts</button>}
        {preview && (
            <footer>
              <Link href='/api/exit-preview'>
                <a>Sair do modo de preview</a>
              </Link>
            </footer>
        )}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({preview = false, previewData}) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 1,
    ref: previewData?.ref ?? null
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: format(new Date(post.first_publication_date), 'dd MMM u', {locale: ptBR})
    }
  })

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page
      },
      preview
    }
  }

  // TODO
};

import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head'

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Fragment } from 'react';
import { useRouter } from 'next/router';
import { Comments } from '../../components/Comments';
import Link from 'next/link';
import { useAdjacentPosts } from '../../hooks/useAdjacentPosts';

interface Post {
  first_publication_date: string | null;
  last_publication_date: {
    day: string | null,
    time: string | null,
  };
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface AdjPost {
  uid: string,
  data: {
    title: string
  }
}

interface AdjacentPosts {
  nextPost: AdjPost,
  previousPost: AdjPost
}

interface PostProps {
  post: Post;
  preview: boolean,
  adjacentPosts: AdjacentPosts
}

export default function Post({ post, preview, adjacentPosts }: PostProps) {
  // TODO
  const readingTime = calculateReadingTime()
  const { isFallback } = useRouter()

  function calculateReadingTime () {
    const readingSpeed = 200; // average person's words per minute reading speed

    const words = post.data.content.reduce((acc, cont) => {
      const bodyWords = cont.body.reduce((accB, b) => {
        return accB + b.text.split(' ').length
      }, 0)

      return acc + cont.heading.split(' ').length + bodyWords
    }, 0)

    return Math.ceil(words / readingSpeed)
  }

  if(isFallback) {
    return (
      <h1>Carregando...</h1>
    )
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | Spacetraveling</title>
      </Head>
      <div className={styles.banner}>
        <img src={post.data.banner.url} alt={post.data.title} />
      </div>
      <article className={`${styles.article} ${commonStyles.content}`}>
        <header>
          <h1>{post.data.title}</h1>
          <div>
            <span><FiCalendar /> {post.first_publication_date}</span>
            <span><FiUser /> {post.data.author}</span>
            <span><FiClock /> {readingTime} min</span>
          </div>
          {post.last_publication_date && 
            post.last_publication_date.day !== post.first_publication_date && (
              <span><em>* editado em {post.last_publication_date.day}, às {post.last_publication_date.time}</em></span>
          )}
        </header>
        <main className={styles.main}>
          {post.data.content.map(cont => (
            <Fragment key={cont.heading}>
              <h2>{cont.heading}</h2>
              <div dangerouslySetInnerHTML={{__html: RichText.asHtml(cont.body)}} />
            </Fragment>
          ))}
        </main>
        <footer>
          <section className={styles.adjacentPosts}>
            {adjacentPosts.previousPost && (
              <div className={styles.previous}>
                <p>{adjacentPosts.previousPost.data.title}</p>
                <Link href={`/post/${adjacentPosts.previousPost.uid}`}>
                  <a>
                    Post anterior
                  </a>
                </Link>
              </div>
            )}
            {adjacentPosts.nextPost && (
              <div className={styles.next}>
                <p>{adjacentPosts.nextPost.data.title}</p>
                <Link href={`/post/${adjacentPosts.nextPost.uid}`}>
                  <a>
                    Próximo post
                  </a>
                </Link>
              </div>
            )}
          </section>
          <Comments />
          {preview && (
            <Link href='/api/exit-preview'>
              <a>Sair do modo de preview</a>
            </Link>
          )}
        </footer>
      </article>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], { pageSize: 1 });

  return {
    paths: posts.results.map(post => {
      return {
         params: {
          slug: post.uid
        }
      }
    }),
    fallback: true
  }

  // TODO
};

export const getStaticProps: GetStaticProps = async ({ params, preview = false, previewData }) => {
  const prismic = getPrismicClient();
  const { slug } = params
  const adjacentPosts = await useAdjacentPosts(String(slug))

  const response = await prismic.getByUID('post', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const post = {
    first_publication_date: format(new Date(response.first_publication_date), 'dd MMM u', { locale: ptBR }),
    last_publication_date: {
      day: format(new Date(response.last_publication_date), "dd MMM u", { locale: ptBR }),
      time: format(new Date(response.last_publication_date), "HH:mm", { locale: ptBR }),
    },
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(thisCont => {
        return {
          heading: thisCont.heading,
          body: thisCont.body
        }
      }),
    },
    uid: response.uid
  }

  return {
    props: {
      post: post,
      preview,
      adjacentPosts
    }
  }

  // TODO
};

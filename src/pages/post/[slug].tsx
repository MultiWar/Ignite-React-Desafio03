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

interface Post {
  first_publication_date: string | null;
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

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  // TODO
  const readingTime = calculateReadingTime()

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
        </header>
        <main className={styles.main}>
          {post.data.content.map(cont => (
            <>
              <h2>{cont.heading}</h2>
              <div dangerouslySetInnerHTML={{__html: RichText.asHtml(cont.body)}} />
            </>
          ))}
        </main>
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
    paths: [
      { params: {
        slug: posts.results[0].uid
      } },
    ],
    fallback: true
  }

  // TODO
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params

  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    first_publication_date: format(new Date(response.first_publication_date), 'dd MMM u', { locale: ptBR }),
    data: {
      title: response.data.title,
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
  }

  return {
    props: {
      post: post
    }
  }

  // TODO
};

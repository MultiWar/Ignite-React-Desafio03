import Prismic from '@prismicio/client';
import { DefaultClient } from '@prismicio/client/types/client';

export function getPrismicClient(req?: unknown): DefaultClient {
  const prismic = Prismic.client(process.env.PRISMIC_API_ENDPOINT, {
    req,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN
  });

  return prismic;
}

interface doc {
  type: string,
  uid: string
}

export const linkResolver = (doc: doc) => {
  if(doc.type === 'post') {
    return `/post/${doc.uid}`
  }
  return '/'
}

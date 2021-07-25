import { getPrismicClient } from "../services/prismic"
import Prismic from '@prismicio/client'

export const useAdjacentPosts = async (currentPostId: string) => {
    const prismic = getPrismicClient()

    const previousPost = await prismic.query([
        Prismic.predicates.at('document.type', 'post')
    ], {
        fetch: ['post.title'],
        after: currentPostId,
        orderings: '[document.first_publication_date]',
        pageSize: 1
    })
 
    const nextPost = await prismic.query([
        Prismic.predicates.at('document.type', 'post')
    ], {
        fetch: ['post.title'],
        after: currentPostId,
        orderings: '[document.first_publication_date desc]',
        pageSize: 1
    })

    return {
        previousPost: previousPost.results[0].uid === currentPostId ? null : previousPost.results[0], 
        nextPost: nextPost.results[0].uid === currentPostId ? null : nextPost.results[0]
    }
}
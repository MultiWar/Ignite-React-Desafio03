import { useUtterances } from "../../hooks/useUtterances"

const commentNodeId = 'comments'
const repoName = 'MultiWar/Ignite-React-Desafio03'

export const Comments = () => {
    useUtterances(commentNodeId, repoName)
    return <div id={commentNodeId} />
}
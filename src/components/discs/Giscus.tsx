import {
  Link as ChakraLink,
  Box,
  Text,
  Heading,
  Flex,
  Button,
  VStack,
  Container,
  Spinner,
  HStack,
  Icon,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useFrontBackDiscussion } from '../../services/giscus/discussions'
import Comment from './Comment'
import CommentBox from './CommentBox'
import ReactButtons from './ReactButtons'
import { useCookies } from 'react-cookie'
import { useEffect } from 'react'
import { VscCircleFilled } from 'react-icons/vsc'

interface IGiscusProps {
  onDiscussionCreateRequest?: () => Promise<string>
  onError?: (message: string) => void
  repo: string
  term: string
  number?: number
  category: string
  full?: boolean
}

export default function Giscus({
  repo,
  term,
  number,
  category,
  full,
  onDiscussionCreateRequest,
  onError,
}: IGiscusProps) {
  const { data: session } = useSession()
  const token = session?.accessToken as string
  const query = { repo, term, category, number }

  const { updateReactions, increaseSize, backMutators, frontMutators, ...data } =
    useFrontBackDiscussion(query, token)

  const [cookies, setCookie] = useCookies([])
  // useEffect(() => {
  //   console.log(data)
  //   if (data.error && onError) {
  //     console.log(data)
  //     onError(data?.error?.message as string)
  //   }
  // }, [data.error, onError])

  const handleDiscussionCreateRequest = async () => {
    const id = onDiscussionCreateRequest ? await onDiscussionCreateRequest() : ''
    // Force revalidate
    frontMutators.mutate()
    backMutators.mutate()
    return id
  }

  const shouldCreateDiscussion = data.isNotFound && !number
  const shouldShowBranding = !!data.discussion.url

  const isDataLoaded = !data.error && !data.isNotFound && !data.isLoading

  const shouldShowReplyCount = isDataLoaded && data.totalReplyCount > 0

  const shouldShowCommentBox =
    (data.isRateLimited && !token) ||
    (!data.isLoading && !data.isLocked && (!data.error || (data.isNotFound && !number)))

  useEffect(() => {
    if (isDataLoaded) {
      // @ts-ignore
      setCookie('visit', {
        // @ts-ignore
        ...cookies.visit,
        [term]: {
          lastVisit: new Date().toISOString(),
          totalCount: data.totalCommentCount || 0 + data.totalReplyCount || 0,
          commentCount: data.totalCommentCount || 0,
          replyCount: data.totalReplyCount || 0,
        },
      })
    }
  }, [data])

  return (
    <VStack w="full" alignItems="flex-start" spacing={10}>
      {full && data.discussion.body && (
        <Box>
          <Container p={0}>{data.discussion.body}</Container>
        </Box>
      )}
      <Box className="color-text-primary gsc-main" w="full">
        <Flex flexDir="column" className="gsc-comments">
          <HStack
            alignItems="center"
            spacing={4}
            className="gsc-header"
            justifyContent="flex-start"
            flex="auto"
            pb={2}
            whiteSpace="nowrap"
          >
            {!data.isLoading && (shouldCreateDiscussion || !data.error) ? (
              <Flex fontSize="sm">
                <ReactButtons
                  subjectId={data.discussion.id}
                  reactionGroups={data.discussion.reactions}
                  onReact={updateReactions}
                  onDiscussionCreateRequest={handleDiscussionCreateRequest}
                />
              </Flex>
            ) : null}
            <Heading mr={2} fontWeight="semibold" size="md" as="h4" className="gsc-comments-count">
              {shouldCreateDiscussion && !data.totalCommentCount ? (
                '0 Comments'
              ) : data.error && !data.backData ? (
                'Something went wrong'
              ) : data.isLoading ? (
                <HStack spacing={4} as="span" alignItems="center">
                  <Spinner /> <Text>Loading Comments</Text>
                </HStack>
              ) : (
                <ChakraLink href={data.discussion.url} isExternal className="color-text-primary">
                  {`${data.totalCommentCount} comments`}
                </ChakraLink>
              )}
            </Heading>
            {shouldShowReplyCount ? (
              <HStack alignItems="center">
                <Heading fontSize="sm" fontWeight="semibold" as="h4">
                  <Icon as={VscCircleFilled} />
                </Heading>
                <Heading
                  mr={2}
                  size="md"
                  as="h4"
                  fontWeight="semibold"
                  className="gsc-replies-count"
                >
                  {`${data.totalReplyCount} replies`}
                </Heading>
              </HStack>
            ) : null}
          </HStack>

          <Flex flexDir="column" className="gsc-timeline">
            {!data.isLoading
              ? data.frontComments.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    replyBox={
                      token && !data.isLocked ? (
                        <CommentBox
                          discussionId={data.discussion.id}
                          context={repo}
                          //@ts-expect-error
                          onSubmit={frontMutators.addNewReply}
                          replyToId={comment.id}
                          viewer={data.viewer}
                        />
                      ) : undefined
                    }
                    onCommentUpdate={frontMutators.updateComment}
                    onReplyUpdate={frontMutators.updateReply}
                  />
                ))
              : null}

            {data.numHidden > 0 ? (
              <Flex
                justifyContent="center"
                py={2}
                my={4}
                bg="center"
                bgRepeat="x"
                className="pagination-loader-container gsc-pagination"
              >
                <Button
                  display="flex"
                  flexDir="column"
                  items="center"
                  px={6}
                  py={2}
                  fontSize="sm"
                  className="flex flex-col items-center px-6 py-2 text-sm border rounded color-bg-primary color-border-primary"
                  onClick={increaseSize}
                  disabled={data.isLoadingMore}
                >
                  <span className="color-text-secondary">{`${data.numHidden} hidden comments`}</span>
                  <span className="font-semibold color-text-link">
                    {data.isLoadingMore ? 'Loading' : 'Load more'}…
                  </span>
                </Button>
              </Flex>
            ) : null}

            {!data.isLoading
              ? data.backComments?.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    replyBox={
                      token && !data.isLocked ? (
                        <CommentBox
                          discussionId={data.discussion.id}
                          context={repo}
                          //@ts-expect-error
                          onSubmit={backMutators.addNewReply}
                          replyToId={comment.id}
                          viewer={data.viewer}
                        />
                      ) : undefined
                    }
                    onCommentUpdate={backMutators.updateComment}
                    onReplyUpdate={backMutators.updateReply}
                  />
                ))
              : null}
          </Flex>

          {shouldShowCommentBox ? (
            <>
              <Box
                as="hr"
                my={4}
                fontSize="sm"
                borderTop={2}
                className="gsc-comment-box-separator color-border-primary"
              />
              <CommentBox
                viewer={data.viewer}
                discussionId={data.discussion.id}
                context={repo}
                //@ts-expect-error
                onSubmit={backMutators.addNewComment}
                onDiscussionCreateRequest={handleDiscussionCreateRequest}
              />
            </>
          ) : null}
        </Flex>
      </Box>
    </VStack>
  )
}
import unified from 'unified'
//import createStream from 'unified-stream'
import uniorgParse from 'uniorg-parse'
import uniorg2rehype from 'uniorg-rehype'
import uniorgSlug from 'uniorg-slug'
import extractKeywords from 'uniorg-extract-keywords'
import attachments from 'uniorg-attach'
// rehypeHighlight does not have any types
// add error thing here
// import highlight from 'rehype-highlight'
//import mathjax from 'rehype-mathjax'
//import 'katex/dist/katex.css'
import katex from 'rehype-katex'
import 'katex/dist/katex.css'
import rehype2react from 'rehype-react'
import visit from 'unist-util-visit'

import React, { ReactNode, useMemo } from 'react'
import { Box, Heading, ListItem, OrderedList, Text, UnorderedList } from '@chakra-ui/react'
//import { noteStyle } from '../components/NoteStyle'
import { Keyword, OrgData, OrgNode, Paragraph, SpecialBlock } from 'uniorg'
import Link from 'next/link'
import { FilesData } from '../utils/IDIndex/getFilesData'
import { slugify } from '../utils/slug'
import { PreviewLink } from '../components/FileViewer/Link'

export interface Data {
  data: FilesData
  orgTexts: { [id: string]: string }
}
interface Props {
  text: string
  // if we have a diff we don't want to process links etc, because that will fuck up
  data?: Data
}

export function ParsedOrg(props: Props): React.ReactElement | null {
  const { text, data } = props
  const processor = unified()
    .use(uniorgParse)
    .use(() => (node) => {
      // visit from unist-util-visit
      visit(node, 'keyword', (keyw) => {
        const keyword = keyw as Keyword
        if (keyword.key.toLowerCase() === 'title') {
          //  console.log(keyword)
          //  console.log(typeof keyword.value)
          // h from hastscript. or manually as { type: 'element', tagName: 'transclusion', properties: { value: keyword.value } }
          Object.assign(keyword, {
            type: 'element',
            tagName: 'h1',
            properties: { className: 'title', value: keyword.value },
          })
        }
      })
      visit(node, 'special-block', (block) => {
        const { affiliated, children, blockType, contentsBegin, contentsEnd } =
          block as SpecialBlock
        if (blockType.toLowerCase() === 'addition' || blockType.toLowerCase() === 'deletion') {
          if (children[0].type === 'paragraph' && children.length === 1) {
            // console.log('ppppp')
            Object.assign(block, {
              ...children[0],
              type: 'element',
              tagName: 'span',
              properties: {
                className: `span-${blockType.toLowerCase()}`,
              },
            })
          }
        }
        // if (blockType.toLowerCase() === 'deletion') {
        //   // h from hastscript. or manually as { type: 'element', tagName: 'transclusion', properties: { value: keyword.value } }
        //   Object.assign(block, {
        //     type: 'element',
        //     tagName: 'div',
        //     properties: { className: 'deletion' },
        //   })
        // }
      })
    })
    .use(extractKeywords)
    .use(attachments)
    .use(uniorgSlug)
    .use(uniorg2rehype, { useSections: true })
    .use(katex, {
      trust: (context) => ['\\htmlId', '\\href'].includes(context.command),
      macros: {
        '\\eqref': '\\href{###1}{(\\text{#1})}',
        '\\ref': '\\href{###1}{\\text{#1}}',
        '\\label': '\\htmlId{#1}{}',
        '\\ocircle': '\\circ',
      },
    })
    .use(rehype2react, {
      createElement: React.createElement,
      components: {
        h1: (head) => {
          const { id, className, value, children } = head
          if (className === 'title') {
            return null
          }
          return (
            <Heading {...{ className: className as string, id: id as string }}>
              {children as ReactNode}
            </Heading>
          )
          //return <Heading className="title">{value as string}</Heading>
        },
        p: ({ children, ...rest }) => (
          <Text lang="en" {...{ ...rest }}>
            {children as ReactNode}
          </Text>
        ),
        div: Box,
        a: ({ href, children }) => {
          if (!data) {
            return (
              <Link href={href as string}>
                <a>{children as ReactNode}</a>
              </Link>
            )
          }
          const id = (href as string).replace(/id:/g, '')
          const correctLink = data.data[id]?.title || ''

          const text = data.orgTexts[id] ?? ''
          return (
            <>
              {correctLink ? (
                <PreviewLink
                  title={correctLink}
                  orgText={text}
                  data={data.data}
                  href={`/${slugify(correctLink)}`}
                >
                  {children}
                </PreviewLink>
              ) : (
                <span> {children as ReactNode}</span>
              )}
            </>
          )
        },
        ul: UnorderedList,
        ol: OrderedList,
        li: ListItem,
        span: ({ className, children, ...rest }) => {
          if (['span-addition', 'span-deletion'].includes(className as string)) {
            return (
              <Text as="span" className={className as string}>
                {children as ReactNode}
              </Text>
            )
          }
          return (
            <span {...{ className: className as string, ...rest }}>{children as ReactNode}</span>
          )
        },
        section: ({ className, children }) => (
          <Box className={className as string} as="section">
            {children as ReactNode}
          </Box>
        ),
        img: ({ src }) => {
          return <img src={(src as string).replace(/\.\/media\//g, '/media/')} />
        },
      },
      // eslint-disable-next-line react/display-name
      /*       components: {
        a: ({ children, href }) => {
          return (
            <PreviewLink
              nodeByCite={nodeByCite}
              setSidebarHighlightedNode={setSidebarHighlightedNode}
              href={`${href as string}`}
              nodeById={nodeById}
              setPreviewNode={setPreviewNode}
              openContextMenu={openContextMenu}
              outline={outline}
            >
              {children}
            </PreviewLink>
          )
        },
        section: ({ children, className }) => (
          <Section {...{ outline, collapse }} className={className as string}>
            {children}
          </Section>
        ),
        p: ({ children }) => {
          return <p lang="en">{children as ReactNode}</p>
        }, */
    })

  try {
    return <Box>{processor.processSync(text).result as React.ReactElement}</Box>
  } catch (e) {
    console.log(e)
    return null
  }
}

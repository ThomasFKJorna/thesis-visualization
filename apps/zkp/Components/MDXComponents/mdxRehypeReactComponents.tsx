/* eslint-disable react/jsx-props-no-spreading */
import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
// import Image from 'next/image'
import { MDXComponents } from 'mdx/types'
import { useRouter } from 'next/router'
// eslint-disable-next-line import/no-cycle
// import { PreviewLink } from '../FileViewer/Link'
// import { MDXLinkBase } from './MDXLink'
// import { WithId } from './WithId'

export const createMdxRehypeReactCompents = (currentId: string): MDXComponents => {
  // const LinkWithId = WithId<'a'>(MDXLinkBase, currentId)
  const components: MDXComponents = {
    h1: (head) => {
      const { className, children } = head
      if (className === 'title') {
        return null
      }
      if ((children as string)?.[0] === 'Footnotes:') return null
      return (
        <h1 className="text-3xl font-bold" id={head.id}>
          {children as ReactNode}
        </h1>
      )
      // return <Heading className="title">{value as string}</Heading>
    },
    h2: (props) => (
      <h2 {...props} className="text-md">
        {props.children}
      </h2>
    ),
    h3: (props) => (
      <h3 {...props} className="text-sm">
        {props.children}
      </h3>
    ),
    h4: (props) => (
      <h4 {...props} className="text-xs">
        {props.children}
      </h4>
    ),
    p: ({ children, ...rest }) => (
      <p lang="en" {...{ ...rest }}>
        {children as ReactNode}
      </p>
    ),
    div: (div) => {
      const { className, id, children } = div
      if (id === 'refs') {
        return (
          <div {...{ className, id }}>
            <h2>References</h2>
            {children}
          </div>
        )
      }
      /**
       * These are the bibliography divs generated by rehype-citation
       */
      if (className?.includes('csl-entry')) {
        return <p>{children}</p>
      }

      return <div {...{ className, id }}>{children}</div>
    },
    a: (node) => {
      // @ts-expect-error TODO: types aaaaa
      const { href, className, alias, children } = node
      const router = useRouter()
      if (href?.includes('http')) {
        return (
          <Link href={href as string} shallow>
            {children as ReactNode}
          </Link>
        )
      }

      if (['footnum', 'footref'].includes(className as string)) {
        return (
          <span className="font-bold text-red-500">
            <Link href={href as string} shallow>
              {children as ReactNode}
            </Link>
          </span>
        )
      }

      return (
        <Link
          href={{
            query: {
              s: [
                ...(router.query.s
                  ? Array.isArray(router.query.s)
                    ? router.query.s
                    : [router.query.s]
                  : []),
                href.replace('/', '') as string,
              ],
              file: router.query.file,
            },
          }}
        >
          {children}
        </Link>
      )
      return (
        <PreviewLink
          currentId={currentId}
          title={alias}
          href={`${(href as string).replace(/#\/page\/?/, '')}`}
        >
          {children}
        </PreviewLink>
      )
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    blockquote: ({ children, ...quote }) => {
      // @ts-expect-error idk what to tell you an it's an array
      const [, possibleCallout, ...restOfQuote] = children || []

      const [callout, ...restOfCallout] = possibleCallout?.props?.children || []
      if (callout && typeof callout === 'string' && callout.match(/\[!.*?\]/)) {
        const calloutType = callout.replace(/\[!(.*?)\]/, '$1')
        return (
          <blockquote
            className="my-8 mr-8 overflow-clip border-red-100 bg-red-50 p-4"
            // bgColor="brand.50"
            // p={4}
            // overflow="clip"
            // borderColor="brand.100"
            // mr={8}
            // my={8}
          >
            <div className="px-4 py-2">
              <span className="rounded-md bg-red-500 text-red-50">{calloutType}</span>
              {restOfCallout && <p className="my-2 text-lg text-red-600">{restOfCallout}</p>}
            </div>
            <div className="bg-red-50 px-4 py-4">
              {restOfQuote.map((thing) => {
                if (thing === '\n') return null
                if (thing?.type?.name === 'p') {
                  return (
                    <p className="text-sm text-red-800" color="brand.900" key={thing.toString()}>
                      {thing.props.children}
                    </p>
                  )
                }
                return thing
              })}
            </div>
          </blockquote>
        )
      }
      return <div className="container border-l-4 border-l-red-500">{children}</div>
    },

    span: ({ className, children, ...rest }) => {
      if (className?.includes('citation')) {
        //
      }
      if (['span-addition', 'span-deletion'].includes(className as string)) {
        return (
          <span {...rest} className={className as string}>
            {children as ReactNode}
          </span>
        )
      }
      return <span {...{ className: className as string, ...rest }}>{children as ReactNode}</span>
    },
    section: ({ className, children }) => {
      const kids = children as React.ReactElement[]
      if (kids?.[0]?.type === 'h15') {
        if (kids?.[0]?.props?.id?.startsWith('end')) {
          return kids?.slice(1) as ReactNode
        }
        return (
          <details>
            <summary>
              <span className="rounded-md bg-red-500 font-bold text-white hover:cursor-pointer">
                TODO
              </span>
            </summary>
            {kids}
          </details>
        )
      }
      return <section className={className as string}>{kids}</section>
    },
    img: (img) => (
      <span className="w-full p-8">
        <Image
          layout="responsive"
          width={500}
          height={500}
          alt={img.alt || 'An image without alt-text: sorry!'}
          src={`/media/${(img.src as string).replace(/\.+\/media\//, '')}`}
        />
      </span>
    ),
  } as MDXComponents
  return components
}

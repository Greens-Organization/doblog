'use client'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownProps {
  content: string
}

export function Markdown({ content }: MarkdownProps) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="mb-4 mt-6 text-3xl font-bold" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="mb-3 mt-5 text-2xl font-bold" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="mb-3 mt-4 text-xl font-bold" {...props} />
        ),
        p: ({ node, ...props }) => <p className="mb-4 leading-7" {...props} />,
        ul: ({ node, ...props }) => (
          <ul className="mb-4 list-disc pl-6" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="mb-4 list-decimal pl-6" {...props} />
        ),
        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
        a: ({ node, ...props }) => (
          <a className="text-primary hover:underline" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="mb-4 border-l-4 border-primary/20 pl-4 italic"
            {...props}
          />
        ),
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '')
          return match ? (
            <SyntaxHighlighter
              // @ts-ignore
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              className="mb-4 rounded-md"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code
              className="rounded-md bg-muted px-1 py-0.5 font-mono text-sm"
              {...props}
            >
              {children}
            </code>
          )
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

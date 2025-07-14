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
          <h1 className="editor-heading-h1" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="editor-heading-h2" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="editor-heading-h3" {...props} />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="editor-heading-h4" {...props} />
        ),
        p: ({ node, ...props }) => <p className="mb-4 leading-7" {...props} />,
        ul: ({ node, ...props }) => (
          <ul className="editor-list-ul" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="editor-list-ol" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="editor-listitem" {...props} />
        ),
        a: ({ node, ...props }) => <a className="editor-link" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote className="editor-quote" {...props} />
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

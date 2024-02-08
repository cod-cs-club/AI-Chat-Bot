'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Markdown conversion component
export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => <a className="text-blue-500 cursor-pointer hover:underline" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-6 marker:text-gray-400" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 marker:text-gray-400" {...props} />,
        li: ({ node, ...props }) => <li className="pt-1 pb-1" {...props} />,
      }}
    >{children}</ReactMarkdown>
  )
}
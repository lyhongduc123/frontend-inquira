"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";
import type { Element } from "hast";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

type ComponentProps = React.HTMLAttributes<HTMLElement> & {
  node?: Element;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const components: Components = {
    code({ inline, className, children, ...props }: ComponentProps) {
      return inline ? (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre({ children, ...props }: ComponentProps) {
      return (
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4" {...props}>
          {children}
        </pre>
      );
    },
    a({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
      return (
        <a
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
    ul({ children, ...props }: ComponentProps) {
      return <ul className="list-disc list-inside my-2 space-y-1" {...props}>{children}</ul>;
    },
    ol({ children, ...props }: ComponentProps) {
      return <ol className="list-decimal list-inside my-2 space-y-1" {...props}>{children}</ol>;
    },
    li({ children, ...props }: ComponentProps) {
      return <li className="ml-4" {...props}>{children}</li>;
    },
    h1({ children, ...props }: ComponentProps) {
      return <h1 className="text-2xl font-bold mt-6 mb-4" {...props}>{children}</h1>;
    },
    h2({ children, ...props }: ComponentProps) {
      return <h2 className="text-xl font-bold mt-5 mb-3" {...props}>{children}</h2>;
    },
    h3({ children, ...props }: ComponentProps) {
      return <h3 className="text-lg font-bold mt-4 mb-2" {...props}>{children}</h3>;
    },
    h4({ children, ...props }: ComponentProps) {
      return <h4 className="text-base font-bold mt-3 mb-2" {...props}>{children}</h4>;
    },
    p({ children, ...props }: ComponentProps) {
      return <p className="my-2 leading-relaxed" {...props}>{children}</p>;
    },
    blockquote({ children, ...props }: ComponentProps) {
      return (
        <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-4" {...props}>
          {children}
        </blockquote>
      );
    },
    table({ children, ...props }: ComponentProps) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full border-collapse border border-border" {...props}>
            {children}
          </table>
        </div>
      );
    },
    thead({ children, ...props }: ComponentProps) {
      return <thead className="bg-muted" {...props}>{children}</thead>;
    },
    th({ children, ...props }: ComponentProps) {
      return <th className="border border-border px-4 py-2 text-left font-semibold" {...props}>{children}</th>;
    },
    td({ children, ...props }: ComponentProps) {
      return <td className="border border-border px-4 py-2" {...props}>{children}</td>;
    },
    hr({ ...props }: ComponentProps) {
      return <hr className="my-6 border-border" {...props} />;
    },
  };

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DigestSummary({ summary }: { summary: string }) {
  return (
    <div className="text-[15px] leading-7 text-slate-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="mb-3 text-[17px] font-medium leading-7 text-slate-800">{children}</h2>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 text-[17px] font-medium leading-7 text-slate-800">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-3 text-[16px] font-medium leading-7 text-slate-800">{children}</h3>
          ),
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-2 list-disc space-y-1.5 pl-6 marker:text-slate-500">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 list-decimal space-y-1.5 pl-6 marker:text-slate-500">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-800">{children}</strong>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600"
            >
              {children}
            </a>
          ),
        }}
      >
        {summary}
      </ReactMarkdown>
    </div>
  );
}

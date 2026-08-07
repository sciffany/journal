import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type Props = {
  content: string;
  className?: string;
};

export function Markdown({ content, className }: Props) {
  if (!content.trim()) {
    return (
      <p className="text-sm text-neutral-400 dark:text-neutral-600">(empty)</p>
    );
  }

  return (
    <div
      className={cn(
        "text-sm leading-relaxed text-neutral-800 dark:text-neutral-200",
        "[&>:first-child]:mt-0 [&>:last-child]:mb-0",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-6 mb-2 text-xl font-semibold tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-5 mb-2 text-lg font-semibold tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-1.5 text-base font-semibold">{children}</h3>
          ),
          p: ({ children }) => <p className="my-2.5">{children}</p>,
          ul: ({ children, className: ulClassName }) => (
            <ul
              className={cn(
                "my-2.5 pl-5",
                ulClassName?.includes("contains-task-list")
                  ? "list-none pl-0"
                  : "list-disc marker:text-neutral-400 dark:marker:text-neutral-500",
              )}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 list-decimal pl-5 marker:text-neutral-400 dark:marker:text-neutral-500">
              {children}
            </ol>
          ),
          li: ({ children, className: liClassName }) => (
            <li
              className={cn(
                "my-0.5",
                liClassName?.includes("task-list-item") &&
                  "flex list-none items-start gap-2",
              )}
            >
              {children}
            </li>
          ),
          input: ({ type, checked, disabled, ...props }) =>
            type === "checkbox" ? (
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                readOnly
                className="mt-1 shrink-0"
                {...props}
              />
            ) : (
              <input type={type} {...props} />
            ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="underline decoration-neutral-400 underline-offset-2 hover:decoration-neutral-700 dark:decoration-neutral-600 dark:hover:decoration-neutral-300"
              target="_blank"
              rel="noreferrer"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-neutral-300 pl-3 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
              {children}
            </blockquote>
          ),
          code: ({ className: codeClassName, children }) => {
            const isBlock = Boolean(codeClassName?.includes("language-"));
            if (isBlock) {
              return <code className="font-mono text-[0.85em]">{children}</code>;
            }
            return (
              <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono text-[0.85em] dark:bg-neutral-900">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-md bg-neutral-100 p-3 dark:bg-neutral-900">
              {children}
            </pre>
          ),
          hr: () => (
            <hr className="my-5 border-neutral-200 dark:border-neutral-800" />
          ),
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-left">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-neutral-200 px-2 py-1.5 font-medium dark:border-neutral-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-neutral-100 px-2 py-1.5 dark:border-neutral-900">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

import { Check, Copy, FileText } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '@/api/api';
import { IconButton } from '@/components/IconButton';

export function MessageItem({
  message,
  pending,
}: {
  message: Message;
  pending: boolean;
}) {
  const [copied, setCopied] = useState(false);

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] rounded-3xl bg-secondary px-5 py-2.5 whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    );
  }

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group">
      {pending && !message.content ? (
        <span
          className="inline-block size-3 animate-pulse rounded-full bg-foreground"
          role="status"
          aria-label="Thinking"
        />
      ) : (
        <div className="prose max-w-none dark:prose-invert prose-pre:rounded-xl prose-pre:border prose-pre:bg-muted prose-pre:text-foreground prose-code:before:content-none prose-code:after:content-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      )}
      {!!message.sources?.length && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {message.sources.map((source) => (
            <span
              key={source}
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              <FileText className="size-3" />
              {source}
            </span>
          ))}
        </div>
      )}
      {message.stopped && (
        <p className="mt-2 text-sm text-muted-foreground italic">
          Response stopped
        </p>
      )}
      {!pending && message.content && (
        <div className="mt-1 flex opacity-0 transition-opacity group-hover:opacity-100">
          <IconButton
            label={copied ? 'Copied' : 'Copy'}
            size="icon-sm"
            className="[&_svg]:size-4"
            onClick={copy}
          >
            {copied ? <Check /> : <Copy />}
          </IconButton>
        </div>
      )}
    </div>
  );
}

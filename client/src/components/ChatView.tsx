import { useEffect, useRef } from 'react';
import type { Message } from '@/api/api';
import { useMessages } from '@/api/hook';
import { Composer } from '@/components/Composer';
import { MessageItem } from '@/components/MessageItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/lib/chat-store';

export function ChatView({ threadId }: { threadId?: string }) {
  const draft = useChatStore((s) => s.draft);
  const { data: saved = [], isFetching } = useMessages(threadId);
  const bottomRef = useRef<HTMLDivElement>(null);

  const showDraft = !!draft && draft.threadId === threadId;
  const messages: Message[] = showDraft
    ? [
        ...saved,
        { id: 'draft-message', role: 'user', content: draft.message },
        { id: 'draft-reply', role: 'assistant', content: draft.reply },
      ]
    : saved;

  useEffect(() => {
    if (messages.length) bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  if (!messages.length && !isFetching) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 pb-24">
        <div className="text-center">
          <h1 className="text-3xl font-medium">Ask your documents</h1>
          <p className="pt-2 text-muted-foreground">
            Upload a PDF, TXT or Markdown file with the + button, then ask about
            it.
          </p>
        </div>
        <div className="w-full max-w-3xl">
          <Composer threadId={threadId} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8">
          {messages.map((m, i) => (
            <MessageItem
              key={m.id}
              message={m}
              pending={showDraft && i === messages.length - 1}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="mx-auto w-full max-w-3xl px-4 pb-3">
        <Composer threadId={threadId} />
        <p className="pt-2 text-center text-xs text-muted-foreground">
          AI runs locally and can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}

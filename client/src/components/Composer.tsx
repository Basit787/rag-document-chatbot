import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUp, LoaderCircle, Plus, Square } from 'lucide-react';
import { type ChangeEvent, type KeyboardEvent, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useShallow } from 'zustand/react/shallow';
import { useSendMessage, useUploadDocument } from '@/api/hook';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useChatStore } from '@/lib/chat-store';

const composerSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Type a message')
    .max(4000, 'Message is too long (max 4000 characters)'),
});

type ComposerValues = z.infer<typeof composerSchema>;

export function Composer({ threadId }: { threadId?: string }) {
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: upload, isPending: uploading } = useUploadDocument();
  const fileRef = useRef<HTMLInputElement>(null);
  const { model, draft, setDraft } = useChatStore(
    useShallow((s) => ({
      model: s.model,
      draft: s.draft,
      setDraft: s.setDraft,
    })),
  );

  const form = useForm<ComposerValues>({
    resolver: zodResolver(composerSchema),
    mode: 'onChange',
    defaultValues: { message: '' },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: refocus whenever the conversation changes
  useEffect(() => {
    form.setFocus('message');
  }, [threadId]);

  const onSubmit = ({ message }: ComposerValues) => {
    if (draft) return;
    const controller = new AbortController();
    setDraft({ threadId, message, reply: '', controller });
    form.reset();

    sendMessage({
      body: { threadId, message, model },
      signal: controller.signal,
      onEvent: (event) => {
        if (event.type === 'error') throw new Error(event.error);
        if (event.type === 'token') {
          const current = useChatStore.getState().draft;
          if (current) {
            setDraft({ ...current, reply: current.reply + event.content });
          }
        }
      },
    });
  };

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) upload(file);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <div className="flex items-end gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.txt,.md"
                  className="hidden"
                  onChange={onPickFile}
                />
                <Button
                  type="button"
                  size="icon"
                  aria-label={
                    uploading ? 'Reading document…' : 'Upload PDF, TXT or MD'
                  }
                  className="mb-2.75 shrink-0 rounded-full"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <Plus />
                  )}
                </Button>
                <div className="flex min-w-0 flex-1 items-end gap-2 rounded-[28px] border bg-card p-2.5 pl-4 shadow-sm dark:bg-secondary">
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={1}
                      onKeyDown={onKeyDown}
                      placeholder="Ask anything"
                      className="max-h-50 min-h-9 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-base shadow-none focus-visible:ring-0 aria-invalid:ring-0 md:text-base dark:bg-transparent"
                    />
                  </FormControl>
                  {draft ? (
                    <Button
                      type="button"
                      size="icon"
                      aria-label="Stop"
                      className="shrink-0 rounded-full"
                      onClick={() => draft.controller.abort()}
                    >
                      <Square className="fill-current" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="icon"
                      aria-label="Send"
                      className="shrink-0 rounded-full"
                      disabled={!form.formState.isValid}
                    >
                      <ArrowUp />
                    </Button>
                  )}
                </div>
              </div>
              <FormMessage className="px-4" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

import { randomUUID } from 'node:crypto';
import {
  AIMessage,
  AIMessageChunk,
  HumanMessage,
} from '@langchain/core/messages';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DocumentsService } from '../documents/documents.service.js';
import { config } from '../util/config.js';
import { buildChatGraph, type ChatGraph } from './chat.graph.js';
import { ThreadsService } from './threads.service.js';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  stopped?: boolean;
  sources?: string[];
}

interface ChatInput {
  threadId?: string;
  message: string;
  model?: string;
}

export interface ChatEvent {
  type: 'thread' | 'token' | 'done' | 'error';
  threadId?: string;
  content?: string;
  error?: string;
}

@Injectable()
export class ChatService implements OnModuleInit, OnModuleDestroy {
  private readonly ollamaBaseUrl = config.ollamaBaseUrl;
  readonly defaultModel = config.ollamaModel;
  private checkpointer: PostgresSaver;
  private graph: ChatGraph;

  constructor(
    private readonly threads: ThreadsService,
    private readonly documents: DocumentsService,
  ) {}

  async onModuleInit() {
    // Own schema so `prisma db push` (which manages `public`) never sees or drops these tables.
    this.checkpointer = PostgresSaver.fromConnString(config.databaseUrl, {
      schema: 'langgraph',
    });
    await this.checkpointer.setup();
    this.graph = buildChatGraph({
      checkpointer: this.checkpointer,
      ollamaBaseUrl: this.ollamaBaseUrl,
      defaultModel: this.defaultModel,
      retrieve: (userId, query) => this.documents.search(userId, query),
    });
  }

  async onModuleDestroy() {
    await this.checkpointer?.end();
  }

  async listModels(): Promise<string[]> {
    const res = await fetch(`${this.ollamaBaseUrl}/api/tags`);
    if (!res.ok) return [];
    const data = (await res.json()) as { models?: { name: string }[] };
    // The embedding model can't chat, so it stays out of the model picker.
    return (data.models ?? [])
      .map((m) => m.name)
      .filter((name) => !name.startsWith(config.ollamaEmbedModel));
  }

  listThreads(userId: string) {
    return this.threads.list(userId);
  }

  assertOwner(userId: string, threadId: string) {
    return this.threads.findOwned(userId, threadId);
  }

  async getMessages(userId: string, threadId: string): Promise<ChatMessage[]> {
    await this.threads.findOwned(userId, threadId);
    const state = await this.graph.getState({
      configurable: { thread_id: threadId },
    });
    const messages = (state.values.messages ?? []) as HumanMessage[];
    return messages
      .filter((m) => m.type === 'human' || m.type === 'ai')
      .map((m, i) => {
        const sources = m.response_metadata?.sources as string[] | undefined;
        return {
          id: m.id ?? `${threadId}-${i}`,
          role: m.type === 'human' ? 'user' : 'assistant',
          content: m.text,
          stopped: m.response_metadata?.stopped === true || undefined,
          sources: sources?.length ? sources : undefined,
        };
      });
  }

  async deleteThread(userId: string, threadId: string) {
    await this.threads.findOwned(userId, threadId);
    await this.checkpointer.deleteThread(threadId);
    await this.threads.remove(threadId);
  }

  // Caller must have checked ownership of input.threadId (assertOwner) first.
  async *chat(
    userId: string,
    input: ChatInput,
    signal: AbortSignal,
  ): AsyncGenerator<ChatEvent> {
    const model = input.model || this.defaultModel;
    const thread = input.threadId
      ? await this.threads.updateModel(input.threadId, model)
      : await this.threads.create(
          randomUUID(),
          userId,
          input.message.trim().slice(0, 60),
          model,
        );
    const threadId = thread.id;
    yield { type: 'thread', threadId };

    let reply = '';
    try {
      const stream = await this.graph.stream(
        { messages: [new HumanMessage(input.message)] },
        {
          configurable: { thread_id: threadId, model, userId },
          streamMode: 'messages',
          signal,
        },
      );
      for await (const [chunk] of stream) {
        if (AIMessageChunk.isInstance(chunk) && chunk.text) {
          reply += chunk.text;
          yield { type: 'token', content: chunk.text };
        }
      }
    } catch (err) {
      if (!signal.aborted) throw err;
    }

    if (signal.aborted) {
      await this.saveStoppedReply(threadId, reply);
      return;
    }
    yield { type: 'done' };
  }

  // Stop aborts the model mid-reply, leaving only the user's message saved; keep what was generated, marked stopped.
  private async saveStoppedReply(threadId: string, reply: string) {
    const threadConfig = { configurable: { thread_id: threadId } };
    const state = await this.graph.getState(threadConfig);
    if (!state.next.includes('model')) return;
    await this.graph.updateState(
      threadConfig,
      {
        messages: [
          new AIMessage({
            content: reply,
            response_metadata: { stopped: true },
          }),
        ],
      },
      'model',
    );
  }
}

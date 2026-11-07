import { SystemMessage } from '@langchain/core/messages';
import {
  END,
  type LangGraphRunnableConfig,
  MessagesAnnotation,
  START,
  StateGraph,
} from '@langchain/langgraph';
import type { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { ChatOllama } from '@langchain/ollama';
import type { RetrievedChunk } from '../documents/documents.service.js';

const SYSTEM_PROMPT =
  "You are a helpful assistant that answers questions about the user's uploaded documents. Use Markdown when it helps.";

const NO_DOCUMENTS_PROMPT =
  'The user has not uploaded any documents yet. Answer normally, and mention that they can upload PDF, TXT or Markdown files with the + button next to the message box to ask questions about them.';

const contextPrompt = (chunks: RetrievedChunk[]) =>
  [
    'Answer using the document excerpts below. Cite the file name in brackets, like [handbook.md], after facts you take from it.',
    'If the excerpts do not contain the answer, say you could not find it in the documents, then answer from general knowledge only if you are sure.',
    '',
    ...chunks.map((c) => `[${c.filename}]\n${c.content}`),
  ].join('\n\n');

interface GraphOptions {
  checkpointer: PostgresSaver;
  ollamaBaseUrl: string;
  defaultModel: string;
  retrieve: (userId: string, query: string) => Promise<RetrievedChunk[]>;
}

export function buildChatGraph({
  checkpointer,
  ollamaBaseUrl,
  defaultModel,
  retrieve,
}: GraphOptions) {
  const callModel = async (
    state: typeof MessagesAnnotation.State,
    config: LangGraphRunnableConfig,
  ) => {
    const question = state.messages.at(-1)?.text ?? '';
    const chunks = await retrieve(config.configurable?.userId, question);

    const llm = new ChatOllama({
      baseUrl: ollamaBaseUrl,
      model: config.configurable?.model ?? defaultModel,
      // Tiny models can loop forever on long document context; cap the reply length.
      numPredict: 2048,
    });
    const response = await llm.invoke(
      [
        new SystemMessage(
          `${SYSTEM_PROMPT}\n\n${chunks.length ? contextPrompt(chunks) : NO_DOCUMENTS_PROMPT}`,
        ),
        ...state.messages,
      ],
      config,
    );
    // Saved with the reply so the chat history can show which files were used.
    response.response_metadata.sources = [
      ...new Set(chunks.map((c) => c.filename)),
    ];
    return { messages: [response] };
  };

  return new StateGraph(MessagesAnnotation)
    .addNode('model', callModel)
    .addEdge(START, 'model')
    .addEdge('model', END)
    .compile({ checkpointer });
}

export type ChatGraph = ReturnType<typeof buildChatGraph>;

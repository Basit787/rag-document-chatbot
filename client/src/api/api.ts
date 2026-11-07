import axios from 'axios';
import { apiClient } from '@/lib/api-client';
import { readServerSentEvents } from '@/lib/sse';

interface User {
  id: string;
  email: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Thread {
  id: string;
  title: string;
  model: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  stopped?: boolean;
  sources?: string[];
}

export interface ChatDocument {
  id: string;
  filename: string;
  size: number;
  chunkCount: number;
  createdAt: string;
}

interface ModelsResponse {
  models: string[];
  default: string;
}

export interface ChatEvent {
  type: 'thread' | 'token' | 'done' | 'error';
  threadId?: string;
  content?: string;
  error?: string;
}

export interface SendMessageBody {
  threadId?: string;
  message: string;
  model?: string;
}

export interface ChatResult {
  threadId?: string;
  stopped: boolean;
}

const isAbortError = (error: unknown) =>
  axios.isCancel(error) ||
  (error instanceof DOMException && error.name === 'AbortError');

const toError = (error: unknown, fallback: string) =>
  new Error(
    error instanceof Error ? `${fallback}: ${error.message}` : fallback,
  );

export const login = async (body: Credentials): Promise<AuthResponse> => {
  try {
    return await apiClient.post<AuthResponse>('/auth/login', body);
  } catch (error) {
    throw toError(error, 'Could not sign in');
  }
};

export const register = async (body: Credentials): Promise<AuthResponse> => {
  try {
    return await apiClient.post<AuthResponse>('/auth/register', body);
  } catch (error) {
    throw toError(error, 'Could not sign up');
  }
};

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    throw toError(error, 'Could not sign out');
  }
};

export const getMe = async (): Promise<User> => {
  try {
    return await apiClient.get<User>('/auth/me');
  } catch (error) {
    throw toError(error, 'Could not load your account');
  }
};

export const getModels = async (): Promise<ModelsResponse> => {
  try {
    return await apiClient.get<ModelsResponse>('/models');
  } catch (error) {
    throw toError(error, 'Could not load models');
  }
};

export const getThreads = async (): Promise<Thread[]> => {
  try {
    return await apiClient.get<Thread[]>('/threads');
  } catch (error) {
    throw toError(error, 'Could not load chats');
  }
};

export const getMessages = async (threadId: string): Promise<Message[]> => {
  try {
    return await apiClient.get<Message[]>(`/threads/${threadId}/messages`);
  } catch (error) {
    throw toError(error, 'Could not load messages');
  }
};

export const deleteThread = async (threadId: string): Promise<void> => {
  try {
    await apiClient.delete(`/threads/${threadId}`);
  } catch (error) {
    throw toError(error, 'Could not delete chat');
  }
};

export const getDocuments = async (): Promise<ChatDocument[]> => {
  try {
    return await apiClient.get<ChatDocument[]>('/documents');
  } catch (error) {
    throw toError(error, 'Could not load documents');
  }
};

export const uploadDocument = async (file: File): Promise<ChatDocument> => {
  const body = new FormData();
  body.append('file', file);
  try {
    // Embedding a large file on CPU can take minutes.
    return await apiClient.post<ChatDocument>('/documents', body, {
      timeout: 0,
    });
  } catch (error) {
    throw toError(error, `Could not upload ${file.name}`);
  }
};

export const deleteDocument = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/documents/${id}`);
  } catch (error) {
    throw toError(error, 'Could not delete document');
  }
};

export const streamChat = async (
  body: SendMessageBody,
  onEvent: (event: ChatEvent) => void,
  signal: AbortSignal,
): Promise<ChatResult> => {
  let threadId = body.threadId;
  try {
    const stream = await apiClient.stream('/chat', body, signal);
    for await (const event of readServerSentEvents<ChatEvent>(stream)) {
      if (event.type === 'thread') threadId = event.threadId;
      onEvent(event);
    }
    return { threadId, stopped: false };
  } catch (error) {
    // Stop is not a failure: the partial reply is kept.
    if (isAbortError(error)) return { threadId, stopped: true };
    throw toError(error, 'Could not get a reply');
  }
};

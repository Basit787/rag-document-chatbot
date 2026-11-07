import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useToast } from '#/hooks/useToast';
import { useChatStore } from '@/lib/chat-store';
import { clearToken, setToken } from '@/lib/token';
import {
  type ChatEvent,
  deleteDocument,
  deleteThread,
  getDocuments,
  getMe,
  getMessages,
  getModels,
  getThreads,
  login,
  logout,
  type Message,
  register,
  type SendMessageBody,
  streamChat,
  uploadDocument,
} from './api';

interface SendMessageVariables {
  body: SendMessageBody;
  onEvent: (event: ChatEvent) => void;
  signal: AbortSignal;
}

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: login,
    onSuccess: ({ token }) => {
      setToken(token);
      showSuccessToast('Signed in');
      navigate({ to: '/' });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: register,
    onSuccess: ({ token }) => {
      setToken(token);
      showSuccessToast('Account created');
      navigate({ to: '/' });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showSuccessToast } = useToast();

  return useMutation({
    mutationFn: logout,
    onMutate: () => useChatStore.getState().draft?.controller.abort(),
    // Sign out locally even if the server call fails; leave the chat pages before clearing their cache.
    onSettled: async () => {
      clearToken();
      await navigate({ to: '/auth/login' });
      queryClient.clear();
      showSuccessToast('Signed out');
    },
  });
};

export const useModels = () => {
  return useQuery({
    queryKey: ['models'],
    queryFn: getModels,
  });
};

export const useThreads = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: getThreads,
  });
};

export const useMessages = (threadId?: string) => {
  return useQuery({
    queryKey: ['chats', threadId],
    queryFn: () => getMessages(threadId as string),
    enabled: !!threadId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setDraft = useChatStore((s) => s.setDraft);
  const { showErrorToast } = useToast();

  return useMutation({
    mutationFn: ({ body, onEvent, signal }: SendMessageVariables) =>
      streamChat(body, onEvent, signal),
    onSuccess: async ({ threadId, stopped }, { body }) => {
      const draft = useChatStore.getState().draft;
      // After Stop a refetch can beat the server saving the partial reply, so show the draft directly.
      if (stopped && threadId && draft) {
        queryClient.setQueryData<Message[]>(['chats', threadId], (old = []) => [
          ...old,
          { id: `${Date.now()}-user`, role: 'user', content: draft.message },
          {
            id: `${Date.now()}-reply`,
            role: 'assistant',
            content: draft.reply,
            stopped: true,
          },
        ]);
      }
      // Stopped: refresh only the chat list (exact); otherwise the list and the messages.
      await queryClient.invalidateQueries({
        queryKey: ['chats'],
        exact: stopped,
      });
      if (!body.threadId && threadId) {
        navigate({ to: '/c/$threadId', params: { threadId } });
      }
    },
    onError: (error) => showErrorToast(error.message),
    onSettled: () => setDraft(null),
  });
};

export const useDeleteThread = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: deleteThread,
    onSuccess: () => {
      showSuccessToast('Chat deleted');
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useDocuments = () => {
  return useQuery({
    queryKey: ['documents'],
    queryFn: getDocuments,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: ({ filename, chunkCount }) => {
      showSuccessToast(`${filename} added (${chunkCount} chunks)`);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      showSuccessToast('Document deleted');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (error) => showErrorToast(error.message),
  });
};

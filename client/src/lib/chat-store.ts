import { create } from 'zustand';

interface Draft {
  threadId?: string;
  message: string;
  reply: string;
  controller: AbortController;
}

interface ChatState {
  model: string;
  draft: Draft | null;
  setModel: (model: string) => void;
  setDraft: (draft: Draft | null) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  model: '',
  draft: null,
  setModel: (model) => set({ model }),
  setDraft: (draft) => set({ draft }),
}));

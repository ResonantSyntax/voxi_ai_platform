import { create } from 'zustand';

import { mockConversations, mockKnowledgeDocuments, mockQueue } from '../data/mock';
import type { Conversation, KnowledgeDocument, QueueItem, Tier } from '../data/types';

interface AppState {
  tier: Tier;
  hasCompletedFirstRun: boolean;
  queue: QueueItem[];
  conversations: Conversation[];
  knowledgeDocuments: KnowledgeDocument[];
  notificationsEnabled: boolean;
  voice: string;

  completeFirstRun: () => void;
  resolveQueueItem: (id: string) => void;
  setTier: (tier: Tier) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setVoice: (voice: string) => void;
  addKnowledgeDocument: (doc: KnowledgeDocument) => void;
  removeKnowledgeDocument: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  tier: 'business',
  hasCompletedFirstRun: false,
  queue: mockQueue,
  conversations: mockConversations,
  knowledgeDocuments: mockKnowledgeDocuments,
  notificationsEnabled: false,
  voice: 'Amara',

  completeFirstRun: () => set({ hasCompletedFirstRun: true }),

  resolveQueueItem: (id) =>
    set((state) => ({ queue: state.queue.filter((item) => item.id !== id) })),

  setTier: (tier) => set({ tier }),

  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

  setVoice: (voice) => set({ voice }),

  addKnowledgeDocument: (doc) =>
    set((state) => ({ knowledgeDocuments: [doc, ...state.knowledgeDocuments] })),

  removeKnowledgeDocument: (id) =>
    set((state) => ({
      knowledgeDocuments: state.knowledgeDocuments.filter((doc) => doc.id !== id),
    })),
}));

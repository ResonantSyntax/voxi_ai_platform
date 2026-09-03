// Domain vocabulary follows PRODUCT.md / CONTEXT.md exactly — Conversation is
// the parent concept, Call is the telephony subtype, Task ≠ Input Request.

export type Channel = 'phone_call' | 'in_app_voice' | 'text_chat';

export type CallOutcome = 'handled' | 'voicemail' | 'unresolved' | 'abandoned';

export type EnrichmentState = 'pending' | 'processing' | 'completed' | 'failed';

export interface Conversation {
  id: string;
  channel: Channel;
  participantLabel: string; // saved name or number — never a generic "Caller"
  startedAt: string;
  summary: string;
  transcript: Turn[];
  callOutcome?: CallOutcome; // only when channel === 'phone_call'
  enrichment: EnrichmentState;
  degraded?: string; // present + a reason when the Conversation is degraded but otherwise fine
}

export interface Turn {
  id: string;
  speaker: 'voxi' | 'inbound' | 'subscriber';
  text: string;
  settled?: boolean;
}

export interface Task {
  id: string;
  kind: 'task';
  conversationId: string;
  title: string;
  detail: string;
}

export interface InputRequest {
  id: string;
  kind: 'input_request';
  conversationId: string;
  question: string;
  detail: string;
}

export type QueueItem = Task | InputRequest;

export interface KnowledgeDocument {
  id: string;
  name: string;
  addedAt: string;
  sizeLabel: string;
}

// Matches apps/web's Tier naming (src/lib/tier.ts) — starter is the floor.
export type Tier = 'starter' | 'pro' | 'business';

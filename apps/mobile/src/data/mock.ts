import type { Conversation, KnowledgeDocument, QueueItem } from './types';

// Placeholder data standing in for Supabase — swap for real reads once the
// mobile data layer is wired. Nothing here is a product claim: every string
// is illustrative content, not a stat.

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    channel: 'phone_call',
    participantLabel: 'Mrs Adeyemi',
    startedAt: '2026-09-03T08:12:00Z',
    summary:
      'Mrs Adeyemi called about the Oakfield Primary invoice. She wants to confirm the amount before paying and asked for a callback this afternoon.',
    callOutcome: 'handled',
    enrichment: 'completed',
    transcript: [
      { id: 't1', speaker: 'inbound', text: "Hi, it's about last month's invoice — the number seems off." },
      { id: 't2', speaker: 'voxi', text: 'I can look into that. What amount were you expecting?' },
      { id: 't3', speaker: 'inbound', text: 'Around R1,200, not R1,850.' },
      { id: 't4', speaker: 'voxi', text: "I've flagged this for a callback this afternoon.", settled: true },
    ],
  },
  {
    id: 'c2',
    channel: 'text_chat',
    participantLabel: '+27 71 555 0132',
    startedAt: '2026-09-02T17:40:00Z',
    summary: 'Asked whether Saturday appointments are available. Voxi needs the Subscriber to confirm before replying.',
    enrichment: 'completed',
    transcript: [
      { id: 't5', speaker: 'inbound', text: 'Do you do Saturdays?' },
    ],
  },
  {
    id: 'c3',
    channel: 'phone_call',
    participantLabel: 'Unknown caller',
    startedAt: '2026-09-02T11:05:00Z',
    summary: 'Call dropped before Voxi could confirm the reason for calling.',
    callOutcome: 'abandoned',
    enrichment: 'completed',
    transcript: [{ id: 't6', speaker: 'inbound', text: '(call ended before transcription completed)' }],
  },
  {
    id: 'c4',
    channel: 'in_app_voice',
    participantLabel: 'Thabo N.',
    startedAt: '2026-09-01T09:30:00Z',
    summary: 'Rescheduled a site visit to next Tuesday.',
    enrichment: 'processing',
    degraded: 'Summary is still being generated for part of this call.',
    transcript: [{ id: 't7', speaker: 'voxi', text: "I've noted Tuesday works — I'll confirm the time shortly." }],
  },
];

export const mockQueue: QueueItem[] = [
  {
    id: 'q1',
    kind: 'input_request',
    conversationId: 'c2',
    question: 'Are Saturday appointments available?',
    detail: 'Voxi needs an answer before it can reply to +27 71 555 0132.',
  },
  {
    id: 'q2',
    kind: 'task',
    conversationId: 'c1',
    title: 'Call Mrs Adeyemi back',
    detail: 'She wants to confirm the invoice amount before paying — this afternoon works for her.',
  },
];

export const mockKnowledgeDocuments: KnowledgeDocument[] = [
  { id: 'k1', name: 'Service price list.pdf', addedAt: '2026-08-20', sizeLabel: '212 KB' },
  { id: 'k2', name: 'Callout terms.pdf', addedAt: '2026-08-11', sizeLabel: '96 KB' },
];

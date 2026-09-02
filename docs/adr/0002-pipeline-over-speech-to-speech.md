# STT/LLM/TTS pipeline over a speech-to-speech model

The voice loop is a pipeline of three swappable services — Deepgram Nova-3,
Claude Haiku 4.5, Cartesia — rather than a realtime speech-to-speech model such
as OpenAI Realtime or Gemini Live.

## Why

Speech-to-speech is more natural and handles interruption better, but Voxi's
value depends on reliable tool-calling: deriving Tasks, matching Rules, and
answering from Q&A. Realtime audio models are measurably weaker at that, and
their per-minute cost is both higher and harder to control on a product billed
per call minute.

## Consequences

- Each stage is a config value, not a code path. Swapping a model is an env var.
- We accept higher turn latency than speech-to-speech in exchange for cost
  control and tool-calling reliability. Cartesia is chosen for time-to-first-
  audio specifically because that latency is audible on a phone call.
- STT quality on South African English is the biggest unvalidated risk. Test it
  before building around it; ElevenLabs is the fallback if accent handling
  disappoints.

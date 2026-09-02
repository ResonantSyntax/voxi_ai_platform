# Voxi is a phone line, not a voicemail box

Voxi began as an AI voicemail assistant reached by conditional call forwarding.
We decided instead that every Subscriber owns a Voxi Number that Callers dial
directly, and that forwarding is one of two ways calls arrive rather than the
only way.

## Why

The features we actually want — a shareable number, a QR Voxi Card, and
Business-tier receptionist skills — all describe a line that answers for you.
Under a forwarding-only model none of them are coherent: you cannot hand out a
number that is not yours.

## Consequences

- A DID is provisioned per Subscriber from day one. A single shared number was
  considered and rejected: it cannot be handed out, and disambiguating
  Subscribers on it depends on carriers preserving the SIP `Diversion` header,
  which is untested on SA networks and has no acceptable fallback.
- `sip.trunkPhoneNumber` identifies the Subscriber. No header parsing, no
  caller-entered extension. An extension prompt was rejected outright: under
  forwarding the Caller never chose to dial Voxi and cannot know an extension.
- A Caller Rule cannot make the Subscriber's phone ring. By the time Voxi has
  the call, the ringing is over. Rules change notification urgency only, and
  the mockup's "rings through no matter what" copy is wrong.

# Where logic lives: no API tier, but yes to Python workers

There is no service between the browser and Postgres. The browser reads through
RLS, and server-side work lands in one of three places depending on its shape,
not its language.

## The rule

| Shape | Home |
| --- | --- |
| Data the Subscriber is allowed to see | Nothing — an RLS query from the client |
| Needs a secret, completes in seconds, triggered by a click | Next route handler (TypeScript) |
| Happens during a live Call | The LiveKit agent (Python) |
| Slow, retryable, scheduled, or heavy | A Python worker (Python) |

## Why no FastAPI

A reasonable reader will assume a Next.js app has a backend, and that since the
agent is already Python the backend should be too. It does not have one. An API
tier here would forward queries that RLS already authorises — a second
authorisation model, a second deploy target, and a second place for bugs.

Background work does not need FastAPI either, because nothing needs to ask it a
question synchronously. A 30-second document parse cannot answer inside a
request; it would return a job id and be polled, which is the queue you would
otherwise have skipped building.

## How work is triggered instead

The database is the interface between web and workers. The client writes a row
with a pending status; a worker claims it, does the work, and updates the
status; the client watches over Realtime. No service-to-service auth, no HTTP
surface, no API contract to version.

## Consequences

- Two languages, each with an obvious edge: TypeScript touches the browser and
  anything a click triggers, Python owns voice and background work.
- The voice worker and the jobs worker are separate processes in one package,
  sharing the connection layer. A long parse must never compete with a live
  Call for the event loop.
- Adding FastAPI later is an afternoon — same package, same DB layer — so this
  is a default, not a wall. Revisit if the web app ever needs Python compute
  inside a request.

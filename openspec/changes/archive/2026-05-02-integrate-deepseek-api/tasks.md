## 1. Context and configuration

- [x] 1.1 Re-read `proposal.md`, `design.md`, `specs/llm-adapter/spec.md`, `openspec/specs/llm-adapter/spec.md`, `src/lib/llm/CLAUDE.md`, and `supabase/functions/llm-proxy/CLAUDE.md` before implementation.
- [x] 1.2 Confirm current DeepSeek official API model names, base URL, JSON Output behavior, and deprecation notes before writing runtime constants.
- [x] 1.3 Decide the initial production default provider value: keep `gemini` until live DeepSeek verification passes, or switch `DEFAULT_LLM_PROVIDER` to `deepseek` after verification.
- [x] 1.4 Add local/example secret placeholders for `DEEPSEEK_API_KEY`, `DEFAULT_LLM_PROVIDER`, `DEFAULT_DEEPSEEK_MODEL`, and optional `DEEPSEEK_BASE_URL` without exposing real secrets.

## 2. Test first

- [x] 2.1 Add frontend LLM adapter tests proving `ChatOptions.provider`, `ChatOptions.model`, and `ChatOptions.responseFormat` are serialized into the Edge Function request body.
- [x] 2.2 Add provider selection tests for `llm-proxy`: default provider, explicit DeepSeek provider, explicit Gemini provider, and unknown provider rejection.
- [x] 2.3 Add DeepSeek success-response tests for `choices[0].message.content` extraction and `{ model, text }` response shape.
- [x] 2.4 Add DeepSeek JSON Output test proving `responseFormat: 'json_object'` becomes `response_format: { type: 'json_object' }`.
- [x] 2.5 Add DeepSeek failure tests for missing API key, 400/422 invalid request, 429 rate limit, 2xx empty content, timeout, and 5xx/503 upstream failure.

## 3. Edge Function provider adapters

- [x] 3.1 Refactor `supabase/functions/llm-proxy/index.ts` into a main request handler plus provider adapter registry without changing the public response protocol.
- [x] 3.2 Move existing Gemini request construction, text extraction, default model handling, and error mapping into the `gemini` adapter.
- [x] 3.3 Implement the `deepseek` adapter using `POST {DEEPSEEK_BASE_URL}/chat/completions`, bearer auth, non-streaming responses, and `DEFAULT_DEEPSEEK_MODEL || deepseek-v4-flash`.
- [x] 3.4 Validate provider names against the adapter registry before any upstream request is made.
- [x] 3.5 Preserve Supabase JWT verification, CORS behavior, 30 second timeout, and existing error response envelope.

## 4. Frontend LLM protocol

- [x] 4.1 Extend `src/lib/llm/types.ts` with `ChatProvider`, `responseFormat`, and the updated `ChatOptions` contract.
- [x] 4.2 Update `src/lib/llm/index.ts` to send optional `provider`, `model`, and `responseFormat` fields while keeping `chat()` return type as `Promise<string>`.
- [x] 4.3 Update `src/lib/extraction.ts` to request `responseFormat: 'json_object'` for structured patient-record extraction.
- [x] 4.4 Keep callers outside the extraction path provider-agnostic unless they have a clear reason to specify DeepSeek.

## 5. Documentation sync

- [x] 5.1 Update `src/lib/llm/CLAUDE.md` after the frontend LLM option contract changes.
- [x] 5.2 Update `supabase/functions/llm-proxy/CLAUDE.md` after the proxy becomes a provider adapter registry instead of Gemini-only.
- [x] 5.3 Update parent L2 maps if implementation adds, removes, or splits files under `src/lib/llm/` or `supabase/functions/llm-proxy/`.
- [x] 5.4 Update README or operations/deployment docs with DeepSeek secret setup, default provider behavior, and rollback to Gemini.
- [x] 5.5 Keep baseline `openspec/specs/llm-adapter/spec.md` unchanged until this change is implemented and archived.

## 6. Verification

- [x] 6.1 Run focused LLM adapter and extraction tests.
- [x] 6.2 Run Edge Function provider tests or the closest local harness available for Deno/Supabase code.
- [x] 6.3 Run `npm test`.
- [x] 6.4 Run `npm run lint`.
- [x] 6.5 Run `npm run type-check`.
- [x] 6.6 Run `npm run build`.
- [x] 6.7 Deploy or locally invoke `llm-proxy` with a real DeepSeek key and verify one successful structured extraction before claiming live DeepSeek support.
- [x] 6.8 Verify rollback by switching the default provider back to Gemini and confirming existing extraction path still works.

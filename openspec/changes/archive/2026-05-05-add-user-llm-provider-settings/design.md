## Context

The current LLM path is intentionally narrow: browser code calls `chat(messages, options)`, `llm-proxy` verifies the Supabase JWT, and the Edge Function forwards to Gemini or DeepSeek using server secrets. This keeps provider API keys out of public Vite variables, but there is no user-controlled provider setting and the current no-provider fallback is Gemini while this P0 requires system DeepSeek.

The change spans UI, the frontend LLM client, Supabase schema, and the Edge Function. The invariant is simple: the browser may send a user key to the Edge Function for saving, but it must never receive plaintext back or call a provider directly.

## Goals / Non-Goals

**Goals:**
- Let a user choose system default DeepSeek or a user-owned provider from Gemini, Claude, OpenAI, GLM, DeepSeek, Kimi, or a custom OpenAI-style endpoint.
- Persist one provider setting per user with encrypted API key material and owner-scoped RLS.
- Route chat calls through saved user settings when present and fall back to project DeepSeek otherwise.
- Keep `chat(messages, options)` as the only frontend model-call interface.
- Show a clear medical-data disclosure when the user enables a third-party provider.

**Non-Goals:**
- No live Supabase deployment or cloud secret provisioning in this round.
- No streaming response support.
- No provider model picker for presets; preset models are system-maintained defaults for this first version.
- No full compatibility guarantee for custom endpoints beyond OpenAI-style `/chat/completions` minimal behavior.

## Decisions

1. **Use `llm-proxy` as both settings API and chat router.**
   - Rationale: the existing function already owns JWT verification, rate limiting, provider secrets, and provider error mapping. Adding `GET/PUT/DELETE` settings actions here avoids a second Edge Function with duplicated auth and CORS logic.
   - Alternative considered: direct frontend Supabase table writes. Rejected because API-key encryption must happen server-side and plaintext readback must be impossible by design.

2. **Store encrypted key fields in `llm_provider_settings`, not plaintext or public env.**
   - Rationale: RLS limits row ownership, while encryption prevents plaintext exposure if a browser selects the row through Supabase. The Edge Function decrypts only while routing a chat request.
   - The encryption key comes from `LLM_PROVIDER_SETTINGS_ENCRYPTION_KEY`. Missing encryption config is a `ConfigurationError` for saving or using user-owned providers.

3. **Represent settings as one row per user.**
   - Rationale: the product only needs the active provider. A unique `user_id` row eliminates precedence rules and special cases.
   - Selecting system default deletes the user row, so chat fallback remains the normal path.

4. **Use a registry with two adapter shapes.**
   - Gemini keeps the existing `generateContent` request shape.
   - Claude uses its Messages API request shape.
   - OpenAI, GLM, DeepSeek, Kimi, and custom use OpenAI-style chat completions with provider-maintained base URLs for presets.
   - Custom settings require a valid HTTPS base URL, API key, and model, and the proxy appends `/chat/completions`.

5. **Do not put user keys into `chat()` requests.**
   - `chat()` may continue sending `provider/model/responseFormat` for existing internal calls, but user-owned provider selection is read by the Edge Function from storage. The browser settings client only talks to the settings action.

## Risks / Trade-offs

- **User provider outage or bad key** -> map provider authentication failures to `ConfigurationError` and leave existing retry UI intact.
- **Custom endpoint SSRF risk** -> require HTTPS URLs without embedded credentials and do not allow arbitrary protocols.
- **Provider payload drift** -> keep adapters small and covered by request-shape tests; preset base URLs/models stay in server registry.
- **Migration applies before secret exists** -> system DeepSeek fallback remains available; only saving/using encrypted user settings requires the encryption secret.
- **RLS false confidence** -> tests assert the migration has owner-scoped SELECT/INSERT/UPDATE/DELETE policies and that plaintext key columns do not exist.

## Migration Plan

1. Add `003_llm_provider_settings.sql` with table, unique user row, provider constraints, encrypted fields, indexes, updated_at trigger, and RLS policies.
2. Extend `llm-proxy` with settings `GET`, `PUT`, and `DELETE`, then route POST chat calls through the saved setting if one exists.
3. Add frontend provider-settings client and a compact `/app` settings panel entry.
4. Archive the change so `llm-provider-settings`, `llm-adapter`, and `supabase-schema` specs become baseline.
5. Rollback is safe by deleting the settings row/table and returning to server-only DeepSeek routing; no PatientRecord schema depends on this table.

## Open Questions

- None for this P0. Preset model customization can be revisited after the first secure settings path is in place.

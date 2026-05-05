## Why

Firefly-Isle currently hides provider selection behind server configuration, which protects keys but prevents users from bringing their own approved model account. P0 now needs a safe provider-settings path so clinical text can still flow through the Edge Function boundary while users choose system DeepSeek or their own vendor.

## What Changes

- Add a user-facing LLM provider setting that can choose the system default DeepSeek path or a user-owned provider.
- Add preset provider support for Gemini, Claude, OpenAI, GLM, DeepSeek, and Kimi; preset base URLs and protocol details remain server-maintained.
- Add a custom OpenAI-style provider mode requiring base URL, API key, and model.
- Persist user API keys through an Edge Function with server-side encryption and RLS-protected storage; never return plaintext keys to the browser.
- Route `llm-proxy` chat requests through the saved user setting when present, with fallback to system DeepSeek when no user setting exists.
- Surface a privacy disclosure that medical record content is sent to the selected third-party provider when a user-owned provider is enabled.

## Capabilities

### New Capabilities
- `llm-provider-settings`: User-owned LLM provider settings, preset/custom provider contracts, encrypted key persistence, non-plaintext readback, and UI disclosure behavior.

### Modified Capabilities
- `llm-adapter`: Extend provider selection beyond server-only Gemini/DeepSeek and require system DeepSeek fallback plus user-setting-aware routing.
- `supabase-schema`: Add the encrypted `llm_provider_settings` storage model and owner-scoped RLS rules.

## Impact

- Affected frontend: `/app` workspace settings entry, `src/lib/llm/**`, new provider-settings client helpers, locale/copy surfaces.
- Affected backend: `supabase/functions/llm-proxy/**` provider registry, settings read/write endpoints, encryption boundary, error mapping.
- Affected database: new Supabase migration for `llm_provider_settings`, RLS policies, updated baseline spec after archive.
- No real cloud deployment is included in this change; local tests and build gates define completion.

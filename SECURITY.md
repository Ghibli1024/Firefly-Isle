# Security Policy

Firefly-Isle handles authentication, patient-record workflows, and user-owned
LLM provider settings. Please report security issues privately so they can be
fixed before details become public.

## Supported Versions

Security review and fixes target the `main` branch. Archived OpenSpec changes
are historical records and are not independently supported.

## Reporting a Vulnerability

Do not open a public issue for suspected vulnerabilities.

Report privately through GitHub's private vulnerability reporting flow when it
is available for this repository. If that path is unavailable, contact the
maintainer through the GitHub profile for `Ghibli1024`.

Please include:

- A clear summary of the issue.
- A minimal reproduction path.
- Affected files, routes, functions, or deployment settings.
- Whether any credential, token, patient data, or provider key may be exposed.

## Scope

In scope:

- Supabase Auth, RLS, migrations, and Edge Functions.
- Cloudflare Pages Functions and deployment configuration.
- LLM provider settings, encrypted key storage, and proxy boundaries.
- Privacy gate, record rendering, export, and session recovery flows.

Out of scope:

- Denial-of-service reports without a practical exploit path.
- Social engineering against maintainers or users.
- Vulnerabilities in third-party services unless Firefly-Isle configuration
  creates or worsens the exposure.

## Disclosure

Please allow maintainers time to investigate, patch, and deploy a fix before
publishing details. Coordinated disclosure keeps users safer than public-first
bug reports.

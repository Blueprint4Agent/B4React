# Public search discovery

[한국어](ko/discovery.md)

The existing `/home` app stays intact. An opt-in build publishes `/about/` (English)
and `/about/ko/` (Korean) as static HTML with readable features, local installation,
configuration boundaries and source/documentation links. Blueprint4Agent (B4A) is
the umbrella; Blueprint4FastAPI combines the backend with pinned B4React.

```dotenv
VITE_PUBLIC_DISCOVERY=true
VITE_PUBLIC_SITE_URL=https://blueprint4agent.org
# Optional public ownership proof; not a credential.
VITE_INDEXNOW_KEY=
```

Rebuild with `make build`. This mode requires the default template identity and a
valid public origin. It fails rather than advertising B4A for a custom
`project.local.json`. Disabled builds retain existing sharing and app behavior.
The build emits public HTML, robots.txt, sitemap.xml and discovery-manifest.json;
an optional IndexNow key is served at /<key>.txt. The manifest hashes content, not
CSS bundle names, and contains no timestamps or private application data.

Each language has a self-canonical URL, reciprocal en/ko hreflang and English
x-default. Only public introduction URLs enter the sitemap. Application HTML is
`noindex, follow` in this mode; robots.txt still permits fetching it so crawlers can
observe noindex. OAI-SearchBot, Claude-SearchBot, Claude-User, PerplexityBot and other
search crawlers are allowed. GPTBot and ClaudeBot are blocked. This is crawler
policy, not access control or a guarantee against every training collection path.
There is no special AI inclusion guarantee or dependency on llms.txt.

The public document reuses the home hero/capability/preview styles and screenshots.
Its only script follows system light/dark preference; content, links and language
switching work with JavaScript disabled (light theme fallback). It does not mount
React, call /config or request account APIs. Default-identity Vite development also serves both /about/ URLs directly with
noindex headers and no canonical links, even without publication build settings.
Build output is available through `make build` + `npm run preview`.
Missing public URLs must be served as 404 by the consuming host, never SPA fallback.

`make test-discovery` builds a separate .discovery-dist fixture and checks static
HTML, language links, no-script reading, metadata, key files, mobile overflow and
shared home styles at 390/1440px in both themes. It runs through `make test-routes`.
Custom-brand builds verify rejection instead of publishing template pages. Node
fixtures run through `make project-config-check`.

Search-console ownership, WAF decisions, submissions and production deployment are
operator tasks. IndexNow tooling and deployment arguments belong to the consuming
backend; this repository never reads parent configuration or publishes URLs.

Home introduces the prompt builder through its hero action, a compact section and footer link. Both static About languages share that introduction and a base-path-aware `/prompt-builder` link. The introduction is readable without JavaScript; the linked interactive wizard requires JavaScript. The builder produces a local template from four questions, not an automatic repository scan or service deployment.

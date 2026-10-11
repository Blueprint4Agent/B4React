# Public sharing metadata

[한국어](ko/sharing.md)

The Vite HTML transform emits description, Open Graph and Twitter metadata into the built HTML, before JavaScript. Titles follow project.local.json. Default descriptions describe the blueprint; custom projects use a generic description with their own name.

Set public build values in `.env.production` (or the build environment), then rebuild:

```dotenv
VITE_PUBLIC_SITE_URL=https://your-domain.example
VITE_SITE_DESCRIPTION=Your product description.
```

The URL must be an HTTP(S) origin without credentials, a subpath, query or fragment. Empty URL omits social URL/image tags. A configured origin makes the default banner URL absolute. Custom projects use their own PNG/JPEG/WebP logo when configured; SVG or missing logos omit image tags instead of showing the template banner. Serve the referenced public asset at that origin.

These are public build inputs, never secrets. Container users must provide them to the frontend build; changing backend/container runtime environment after an image is built does not update HTML. This is site-level metadata, not route-specific rendering, a canonical URL policy, a hosted demo or a guarantee of indexing/card rendering. Share-preview caches may need refreshing after deployment.

Run `make verify-plan` and `make verify`. Builder tests cover escaping, origin rejection and identity isolation; production tests inspect the raw HTML response without executing application JavaScript.

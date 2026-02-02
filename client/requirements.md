## Packages
framer-motion | For smooth page transitions and micro-interactions
date-fns | For formatting dates in reviews and chat
clsx | For conditional class names
tailwind-merge | For merging tailwind classes utility

## Notes
- SSE Chat implementation requires reading the response body stream manually since EventSource only supports GET.
- Auth is handled via Replit Auth (server-side cookies), using /api/login and /api/logout endpoints.
- Images use Unsplash placeholders for now.

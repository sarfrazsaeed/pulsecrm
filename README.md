This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Testing

This project has two test layers: Vitest + React Testing Library for
component-level tests, and Playwright for end-to-end tests.

### Unit / component tests (Vitest)

Run the unit test suite:

```bash
npm run test
```

This covers:
- `LeadScorePanel` — the AI chat message renderer, across pending, streaming,
  tool-result, and error states (mocks the `@ai-sdk/react` `useChat` hook,
  never calls the real AI route)
- `LeadScoreCard` / `LeadScoreError` — the tool-result and error display
  components
- The "Add contact" form — required-field validation and successful submission

### End-to-end tests (Playwright)

Local instructions:

- Build the app:

```bash
npm run build
```

- Start the app on port 3000 (recommended):

```bash
npm run dev
```

- Install Playwright browsers (WebKit may be unsupported on macOS 12):

```bash
npx playwright install --with-deps
# if webkit fails, install only chromium:
npx playwright install chromium
```

- Run tests:

```bash
# If you run the server on a different port, set this first:
export PLAYWRIGHT_BASE_URL=http://localhost:3001

npm run test:e2e
```

### CI

A GitHub Actions workflow at `.github/workflows/playwright.yml` runs both
suites on every push and pull request: a `unit` job runs `npm run test`, and
an `e2e` job builds the app and runs the Playwright suite. Both must pass
before merging.

Troubleshooting:

- If `npx playwright install webkit` errors with "Playwright does not support
  webkit on mac12", use CI or install only chromium locally.
- Ensure the server is reachable at the `baseURL` defined in
  `playwright.config.ts` (defaults to `http://localhost:3000`).
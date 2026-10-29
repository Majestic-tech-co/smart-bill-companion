> [!IMPORTANT]
> This project is deployed on [Vercel](https://vercel.com) from the `main`
> branch. It was originally built with Lovable but is no longer synced to the
> Lovable editor.
>
> Commits pushed to `main` deploy to production, so keep the branch in a
> working state. Avoid rewriting published git history — force pushing, or
> rebasing/amending/squashing commits that are already pushed.
>
> `vite.config.ts` uses `@lovable.dev/vite-tanstack-config`, which already
> includes the TanStack Start, React, Tailwind and Nitro plugins. Don't add
> those plugins manually.
>
> Sign-in and data storage use Supabase (`src/lib/supabase.ts`). Schema changes
> go in a new file under `supabase/migrations/`, and every table holding user
> data needs row-level security policies scoped to `auth.uid()`.

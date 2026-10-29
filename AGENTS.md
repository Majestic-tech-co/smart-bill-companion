> [!IMPORTANT]
> This project is deployed on [Vercel](https://vercel.com) from the `main`
> branch.
>
> Commits pushed to `main` deploy to production, so keep the branch in a
> working state. Avoid rewriting published git history — force pushing, or
> rebasing/amending/squashing commits that are already pushed.
>
> `vite.config.ts` registers the TanStack Start, React, Tailwind and Nitro
> plugins directly. Nitro only runs for builds and picks the Vercel preset
> automatically on Vercel; don't hard-code a different preset.
>
> Sign-in and data storage use Supabase (`src/lib/supabase.ts`). Schema changes
> go in a new file under `supabase/migrations/`, and every table holding user
> data needs row-level security policies scoped to `auth.uid()`.

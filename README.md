# Smart Bill Companion

"Create a 'Smart Bill & Savings' web application. The core feature is a dashboard that manages recurring monthly bills and identifies 'hidden' savings opportunities.

Key Features to include:

Bill Manager: A dashboard where I can input bill names, monthly due dates, and amounts. Include a status tracker (Paid/Pending/Overdue) and a visual progress bar showing total monthly fixed expenses.

Smart Payment Scheduler: A calendar view that highlights upcoming payment deadlines. Add a 'Payment Assistant' feature that suggests the optimal order to pay bills based on due dates to avoid late fees.

Savings Optimizer: A 'Savings Goal' calculator. Users should be able to input an income amount and a list of variable expenses. The app should automatically calculate a 'suggested savings rate' based on the remaining budget.

Actionable Insights: A section that identifies 'Subscriptions/Variable Expenses' where the user can log recurring charges and toggle them to 'Analyze' to see how much they would save if they cancelled or negotiated them.

Technical Requirements:

Use a clean, modern, high-contrast interface (dark mode encouraged).

Implement local storage/IndexedDB for data persistence to ensure privacy and offline access.

Make the UI responsive for mobile use.

Include a summary card at the top displaying 'Total Monthly Bills', 'Savings Target', and 'Remaining Disposable Income'."

This project was originally generated with [Lovable](https://lovable.dev) and is now deployed on [Vercel](https://vercel.com). It is no longer developed in the Lovable editor.

## Deployment

The app is hosted on Vercel, connected to this GitHub repository. Pushes to `main` deploy to production, so keep `main` in a working state.

## Accounts and data

Users sign in with email and password through [Supabase Auth](https://supabase.com/docs/guides/auth). Each user's bills, income, expenses and subscriptions are stored in one row of the `user_finances` table, and row-level security limits every user to their own row. The first account to sign in on a browser that used the older local-only version picks up that browser's saved data.

To set up a Supabase project:

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/20261028000000_user_finances.sql` in the SQL editor (or with `supabase db push`).
3. Under **Authentication → URL Configuration**, set the Site URL to the production domain and add `http://localhost:3000` (or your dev URL) to the redirect URLs, so confirmation emails link back to the app.
4. Copy the project URL and publishable (anon) key into `.env` (see `.env.example`) for local development, and into the Vercel project's environment variables for deploys.

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

The build still uses `@lovable.dev/vite-tanstack-config` (see `vite.config.ts`), which bundles the TanStack Start, React, Tailwind and Nitro setup. It is a build dependency only and does not connect the project to Lovable.

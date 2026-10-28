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

## Development

You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

The build still uses `@lovable.dev/vite-tanstack-config` (see `vite.config.ts`), which bundles the TanStack Start, React, Tailwind and Nitro setup. It is a build dependency only and does not connect the project to Lovable.

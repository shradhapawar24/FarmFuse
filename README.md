# FarmFuse

FarmFuse is an AI-assisted aggregation and coordination workspace for small farmers and bulk buyers. It demonstrates how multiple independent farms can collectively fulfill one larger order without FarmFuse buying or reselling produce.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The demo workspace works without a database so it can be presented immediately. Use the Buyer/Farmer switch in the sidebar. Pools created in the matching workspace persist in browser storage for the local demo.

## Demo accounts

- Buyer: `buyer@farmfuse.demo` / `FarmFuse123`
- Farmer: `farmer@farmfuse.demo` / `FarmFuse123`

## Database setup

The project includes a PostgreSQL-compatible Prisma schema and seed data for users, profiles, produce, bulk orders, Farm Pools, pool members, orders, order items, and notifications.

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Run `npm run db:generate`.
3. Run `npm run db:migrate`.
4. Run `npm run db:seed`.

The seed includes 150 kg, 200 kg, 300 kg, and 350 kg tomato listings at illustrative farmer prices of Rs 22, Rs 23, Rs 21, and Rs 24 per kilogram.

## Deploy to Vercel

Push the repository to GitHub, import it into Vercel, and add `DATABASE_URL` using a hosted PostgreSQL provider such as Neon, Supabase, or Railway. Keep the build command as `npm run build`. Run the Prisma migration and seed against the hosted database before presenting the database-backed deployment.

## SIH demo flow

1. Open the dashboard as Buyer and select **AI matching**.
2. Keep the 1,000 kg Tomato requirement, or try 500, 750, or 1,200 kg.
3. Show the transparent contribution breakdown: 150 + 200 + 300 + 350 = 1,000 kg.
4. Explain that this is a rule-based AI-assisted optimization prototype, not a trained ML model.
5. Click **Create Farm Pool** and show the persistent pool and coordination diagram.
6. Walk through Price intelligence, Smart logistics, Order tracking, and Market insights.
7. Switch to Farmer to demonstrate produce listings and the farmer view.

## Limitations

The presentation shell uses seeded demo data and browser persistence for the interactive local walkthrough. The Prisma schema and seed establish the production persistence contract, but full server-side authentication/API wiring and live market or GPS integrations still need to be connected before production use. Prices, market insights, and logistics are clearly marked illustrative or simulated.

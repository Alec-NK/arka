<div align="center">
  <img src="web/public/favicon.svg" alt="Arka logo" width="64" />
  <h1>Arka</h1>
  <p><strong>A clearer view of your business finances.</strong></p>
</div>

Arka is a place to keep everyday business money records together. Add the sales, purchases, and expenses your business makes, then see how they add up over a chosen period. Keeping suppliers connected to transactions also makes it easier to understand who a purchase was made from and find the record later.

The goal is to make routine financial tracking easier to follow, whether you are checking a recent expense or getting a broader picture of how your business is doing.

## Features

- **Keep track of transactions:** Record a sale, a purchase, or an operating expense with its amount, date, and description. Add a reference or notes when useful.
- **Understand your totals:** See sales, purchases, expenses, and the difference between money earned and spent for the selected filters.
- **Find records quickly:** Search descriptions and references, or narrow the list by date, transaction type, or supplier. Sort and move through pages of results.
- **Keep supplier details nearby:** Add and update suppliers, connect them to transactions, and open a supplier's related records. Archiving a supplier preserves its past transactions.
- **Review and update entries:** Open transaction details, edit a record, or remove one from the active list. Totals follow the selected filters.
- **See familiar amounts and dates:** Values use Brazilian reais (R$), with dates and numbers displayed in Brazilian format.

## Run it locally

You will need [Docker](https://docs.docker.com/get-docker/), [Node.js 22](https://nodejs.org/), and [pnpm 11](https://pnpm.io/installation).

### 1. Start the API and database

From the project root, open a terminal and run:

```bash
cd api
cp .env.example .env
docker compose up --build
```

Docker starts the database and API, then applies the database setup. Leave this terminal running.

### 2. Add example data

Once the API is running, open another terminal from the project root:

```bash
cd api
docker compose exec api pnpm seed:demo
```

This creates a demo user and example transactions. The local demo sign-in uses `alex@example.test`; it does not use a password. This email-based sign-in is for development and is not production authentication.

### 3. Start the web app

Open a third terminal from the project root:

```bash
cd web
pnpm install
pnpm dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) and sign in with the demo email above. The web app sends API requests through its local development server, so keep the API terminal running too.

## Technologies

- **Web app:** React 19, TypeScript, Vite, and Tailwind CSS
- **API:** NestJS and Prisma
- **Database:** PostgreSQL
- **Local development:** Docker Compose and pnpm

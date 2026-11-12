# ShareWallet

ShareWallet is a group-based savings and emergency fund platform.

## Environment variables

Configure these variables in your local `.env` file and in your deployment environment:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret used by NextAuth |
| `NEXTAUTH_URL` | Canonical NextAuth application URL |
| `NEXT_PUBLIC_APP_URL` | Public application origin used to generate password-reset links (for example, `https://your-domain.com`) |
| `RESEND_API_KEY` | Resend API key used to send verification and password-reset emails |
| `RESEND_FROM_EMAIL` | Verified sender identity, for example `ShareWallet <no-reply@your-domain.com>` |

For production email delivery, verify your sending domain in Resend and set `RESEND_FROM_EMAIL` to an address on that verified domain. The default `onboarding@resend.dev` sender is intended for Resend testing and is not a substitute for a verified production sender.

Set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS origin in production. Password-reset links are built from this value; production requests do not fall back to an incoming request host.

## Development

```bash
npm install
npx prisma generate
npm run dev
```

Before deploying schema changes, apply committed migrations:

```bash
npx prisma migrate deploy
```

## Build

```bash
npm run build
```

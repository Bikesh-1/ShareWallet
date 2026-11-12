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
| `SMTP_HOST` | SMTP server hostname (Gmail: `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (Gmail: `587`) |
| `SMTP_SECURE` | Use TLS immediately; set `false` for port 587 and `true` for port 465 |
| `SMTP_USER` | Email account used to send messages |
| `SMTP_PASS` | SMTP password or provider app password (never your normal Gmail password) |
| `SMTP_FROM` | Optional sender name/address; defaults to `SMTP_USER` |

For a free Gmail setup, enable 2-Step Verification on your Google account and create a Google App Password. Put that 16-character App Password in `SMTP_PASS`. Gmail's free SMTP sending has daily limits and is suitable for development/small-volume testing, not guaranteed high-volume production delivery.

Set `NEXT_PUBLIC_APP_URL` to your local app origin (for example, `http://localhost:3000`) while testing locally, and to your canonical HTTPS domain in production. Verification and password-reset links use this value.

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

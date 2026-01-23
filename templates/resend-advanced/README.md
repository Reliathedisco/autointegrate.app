# Resend Advanced Pack

Email templates and layout system for Resend.

## Environment Variables

```env
RESEND_API_KEY=
EMAIL_FROM=noreply@yourdomain.com
```

## Structure

```
resend-advanced/
├── config.ts
├── client.ts
├── send.ts           # Send function wrappers
├── route.ts          # API route
└── emails/
    ├── layout.tsx    # Shared layout component
    ├── WelcomeEmail.tsx
    └── PasswordResetEmail.tsx
```

## Usage

```typescript
import { sendWelcome, sendPasswordReset } from "./send";

// Send welcome email
await sendWelcome("user@example.com", "John");

// Send password reset
await sendPasswordReset("user@example.com", "https://app.com/reset?token=xxx");
```

## Adding New Templates

1. Create a new component in `/emails/`:

```tsx
import { Layout } from "./layout";

export const InvoiceEmail = ({ amount }: { amount: string }) => (
  <Layout>
    <p>Your invoice for {amount} is ready.</p>
  </Layout>
);
```

2. Add a send function in `send.ts`:

```typescript
export const sendInvoice = async (to: string, amount: string) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Your Invoice",
    html: render(<InvoiceEmail amount={amount} />),
  });
};
```

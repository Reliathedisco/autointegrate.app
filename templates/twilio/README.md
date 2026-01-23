# Twilio SMS Integration

Send SMS messages using Twilio.

## Environment Variables

```env
TWILIO_SID=
TWILIO_AUTH=
TWILIO_NUMBER=+1234567890
```

## Usage

```typescript
import { sendSMS } from "./send";

await sendSMS("+1234567890", "Hello from AutoIntegrate!");
```

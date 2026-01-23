import { sms } from "./client";

export const sendSMS = async (to: string, body: string) => {
  return sms.messages.create({
    from: process.env.TWILIO_NUMBER!,
    to,
    body,
  });
};

import twilio from "twilio";

export const sms = twilio(
  process.env.TWILIO_SID!,
  process.env.TWILIO_AUTH!
);

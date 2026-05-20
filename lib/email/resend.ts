import { Resend } from "resend";

export function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export const FROM_EMAIL = "TravelBackend <hello@travelbackend.com>";
export const FROM_ADDRESS = "hello@travelbackend.com";
export const REPLY_TO = "support@travelbackend.com";

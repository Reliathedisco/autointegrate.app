import { posthog } from "./client";

export const trackEvent = (event: string, properties?: Record<string, any>) => {
  return posthog.capture({
    distinctId: "server",
    event,
    properties,
  });
};

export const identifyUser = (id: string, traits: Record<string, any>) => {
  return posthog.identify({
    distinctId: id,
    properties: traits,
  });
};

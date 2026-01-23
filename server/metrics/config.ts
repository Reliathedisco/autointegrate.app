export const TIME_SAVED_MINUTES: Record<string, number> = {
  stripe: 45,
  clerk: 60,
  supabase: 40,
  openai: 30,
  anthropic: 35,
  mongodb: 25,
  redis: 20,
  resend: 20,
  github: 25,
  uploadthing: 30,
  pinecone: 35,
  liveblocks: 40,
  default: 30
};

export function getTimeSavedMinutes(integrationId: string): number {
  const normalized = integrationId.toLowerCase();
  return TIME_SAVED_MINUTES[normalized] ?? TIME_SAVED_MINUTES.default;
}

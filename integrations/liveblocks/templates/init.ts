// Liveblocks Initialization Template

import { createClient } from "@liveblocks/client";

export const liveblocks = createClient({
  publicApiKey: process.env.LIVEBLOCKS_PUBLIC_KEY!,
});

// Ably Initialization Template

import Ably from "ably";

export const ably = new Ably.Realtime(process.env.ABLY_API_KEY!);

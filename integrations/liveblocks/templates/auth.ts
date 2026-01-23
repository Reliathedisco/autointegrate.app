// Liveblocks Auth Endpoint

import { Liveblocks } from "@liveblocks/node";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function authorize(userId: string, roomId: string) {
  const session = liveblocks.prepareSession(userId, {
    userInfo: { name: userId },
  });

  session.allow(roomId, session.FULL_ACCESS);

  const { body, status } = await session.authorize();
  return { body, status };
}

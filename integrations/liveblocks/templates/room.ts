// Liveblocks Room Example

import { liveblocks } from "./init";

export function enterRoom(roomId: string) {
  const { room, leave } = liveblocks.enterRoom(roomId, {
    initialPresence: {},
  });

  return { room, leave };
}

export function usePresence(room: any) {
  return room.getPresence();
}

export function broadcastEvent(room: any, event: any) {
  room.broadcastEvent(event);
}

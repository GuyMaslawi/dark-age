import "server-only";
import { signSocketToken } from "@kingdom/protocol/token";
import type { NotificationPayload } from "@kingdom/protocol";

const TOKEN_TTL_MS = 60 * 60 * 1000;

export function mintSocketToken(character: {
  id: string;
  name: string;
  clanId?: string | null;
}): string {
  const secret = process.env.SOCKET_SECRET ?? "dev-socket-secret";
  return signSocketToken(
    {
      characterId: character.id,
      name: character.name,
      clanId: character.clanId ?? null,
      exp: Date.now() + TOKEN_TTL_MS,
    },
    secret,
  );
}

export function publicSocketUrl(): string {
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001";
}

export async function emitToRoom(
  room: string,
  event: string,
  data: unknown,
): Promise<void> {
  const url = process.env.SOCKET_INTERNAL_URL;
  if (!url) {
    return;
  }
  try {
    await fetch(`${url}/internal/emit`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-secret": process.env.SOCKET_INTERNAL_SECRET ?? "",
      },
      body: JSON.stringify({ room, event, data }),
    });
  } catch {
    // socket server is optional; never let a notification break gameplay
  }
}

export function notifyPlayer(
  characterId: string,
  payload: NotificationPayload,
): Promise<void> {
  return emitToRoom(`user:${characterId}`, "notification", payload);
}

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Server, type Socket } from "socket.io";
import { prisma, MessageChannel } from "@kingdom/db";
import { verifySocketToken } from "@kingdom/protocol/token";
import {
  SOCKET_EVENTS,
  MAX_CHAT_BODY,
  type ChatSendInput,
  type ChatMessagePayload,
  type SocketAuthPayload,
} from "@kingdom/protocol";
import { config } from "dotenv";

config({ path: new URL("../.env", import.meta.url).pathname });

const SECRET = process.env.SOCKET_SECRET ?? "dev-socket-secret";
const INTERNAL_SECRET = process.env.SOCKET_INTERNAL_SECRET ?? SECRET;
const PORT = Number(process.env.SOCKET_PORT ?? 3001);

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200).end("ok");
    return;
  }
  if (req.method === "POST" && req.url === "/internal/emit") {
    if (req.headers["x-internal-secret"] !== INTERNAL_SECRET) {
      res.writeHead(401).end("unauthorized");
      return;
    }
    try {
      const payload = (await readJson(req)) as {
        room?: string;
        event?: string;
        data?: unknown;
      };
      if (payload.room && payload.event) {
        io.to(payload.room).emit(payload.event, payload.data);
      }
      res.writeHead(200).end("ok");
    } catch {
      res.writeHead(400).end("bad request");
    }
    return;
  }
  res.writeHead(404).end("not found");
});

const io = new Server(httpServer, {
  cors: { origin: process.env.SOCKET_CORS_ORIGIN ?? "*" },
});

io.use((socket, next) => {
  const token = String(socket.handshake.auth?.token ?? "");
  const auth = verifySocketToken(token, SECRET);
  if (!auth) {
    next(new Error("unauthorized"));
    return;
  }
  socket.data.auth = auth;
  next();
});

function roomsFor(auth: SocketAuthPayload): string[] {
  const rooms = ["global", `user:${auth.characterId}`];
  if (auth.clanId) {
    rooms.push(`clan:${auth.clanId}`);
  }
  return rooms;
}

async function handleChatSend(socket: Socket, raw: ChatSendInput): Promise<void> {
  const auth = socket.data.auth as SocketAuthPayload;
  const body = String(raw?.body ?? "").trim().slice(0, MAX_CHAT_BODY);
  if (!body) {
    return;
  }

  let recipientId: string | null = null;
  let clanId: string | null = null;
  let channel: MessageChannel;
  const targetRooms: string[] = [];

  if (raw.channel === "GLOBAL") {
    channel = MessageChannel.GLOBAL;
    targetRooms.push("global");
  } else if (raw.channel === "CLAN") {
    if (!auth.clanId) {
      return;
    }
    channel = MessageChannel.CLAN;
    clanId = auth.clanId;
    targetRooms.push(`clan:${auth.clanId}`);
  } else if (raw.channel === "PRIVATE") {
    if (!raw.recipientId || raw.recipientId === auth.characterId) {
      return;
    }
    channel = MessageChannel.PRIVATE;
    recipientId = raw.recipientId;
    targetRooms.push(`user:${recipientId}`, `user:${auth.characterId}`);
  } else {
    return;
  }

  const message = await prisma.message.create({
    data: {
      channel,
      senderId: auth.characterId,
      recipientId,
      clanId,
      body,
    },
  });

  const payload: ChatMessagePayload = {
    id: message.id,
    channel: raw.channel,
    senderId: auth.characterId,
    senderName: auth.name,
    recipientId,
    clanId,
    body,
    createdAt: message.createdAt.toISOString(),
  };

  for (const room of targetRooms) {
    io.to(room).emit(SOCKET_EVENTS.chatMessage, payload);
  }
}

io.on("connection", (socket) => {
  const auth = socket.data.auth as SocketAuthPayload;
  for (const room of roomsFor(auth)) {
    void socket.join(room);
  }

  socket.on(SOCKET_EVENTS.chatSend, (raw: ChatSendInput) => {
    handleChatSend(socket, raw).catch((error) => {
      console.error("chat:send error", error);
      socket.emit(SOCKET_EVENTS.error, "שליחת ההודעה נכשלה");
    });
  });
});

httpServer.listen(PORT, () => {
  console.log(`kingdom-rpg socket server listening on ${PORT}`);
});

export type ChatChannel = "GLOBAL" | "CLAN" | "PRIVATE";

export type SocketAuthPayload = {
  characterId: string;
  name: string;
  clanId: string | null;
  exp: number;
};

export type ChatMessagePayload = {
  id: string;
  channel: ChatChannel;
  senderId: string;
  senderName: string;
  recipientId: string | null;
  clanId: string | null;
  body: string;
  createdAt: string;
};

export type NotificationKind = "ATTACKED" | "MESSAGE" | "SYSTEM";

export type NotificationPayload = {
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
};

export const SOCKET_EVENTS = {
  chatSend: "chat:send",
  chatMessage: "chat:message",
  notification: "notification",
  error: "app:error",
} as const;

export type ChatSendInput = {
  channel: ChatChannel;
  body: string;
  recipientId?: string;
};

export const MAX_CHAT_BODY = 300;

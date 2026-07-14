"use client";

import { useEffect, useRef, useState } from "react";
import {
  SOCKET_EVENTS,
  MAX_CHAT_BODY,
  type ChatMessagePayload,
} from "@kingdom/protocol";
import { useSocket } from "@/components/SocketProvider";
import { SceneBackdrop } from "@/components/scene/SceneBackdrop";

export type ChatMessageView = {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string | null;
  body: string;
  createdAt: string;
};

function MessageList({
  messages,
  currentId,
}: {
  messages: ChatMessageView[];
  currentId: string;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="panel h-[52vh] space-y-2 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <p className="text-sm text-neutral-500">אין הודעות עדיין.</p>
      ) : (
        messages.map((message) => {
          const mine = message.senderId === currentId;
          return (
            <div key={message.id} className={mine ? "text-left" : "text-right"}>
              <span
                className={`inline-block max-w-[80%] rounded-lg px-3 py-1.5 text-sm ${
                  mine
                    ? "bg-gold/15 text-gold-bright"
                    : "bg-void-soft text-neutral-200"
                }`}
              >
                {!mine && (
                  <span className="me-2 text-xs text-gold">{message.senderName}</span>
                )}
                {message.body}
              </span>
            </div>
          );
        })
      )}
      <div ref={endRef} />
    </div>
  );
}

type Tab = "global" | "clan" | "private";

export function ChatView({
  currentId,
  globalMessages,
  clan,
  clanMessages,
  partner,
  privateMessages,
}: {
  currentId: string;
  globalMessages: ChatMessageView[];
  clan: { name: string } | null;
  clanMessages: ChatMessageView[];
  partner: { id: string; name: string } | null;
  privateMessages: ChatMessageView[];
}) {
  const socket = useSocket();
  const [tab, setTab] = useState<Tab>(partner ? "private" : "global");
  const [global, setGlobal] = useState(globalMessages);
  const [clanMsgs, setClanMsgs] = useState(clanMessages);
  const [priv, setPriv] = useState(privateMessages);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!socket) {
      return;
    }
    const onMessage = (payload: ChatMessagePayload) => {
      const view: ChatMessageView = {
        id: payload.id,
        senderId: payload.senderId,
        senderName: payload.senderName,
        recipientId: payload.recipientId,
        body: payload.body,
        createdAt: payload.createdAt,
      };
      if (payload.channel === "GLOBAL") {
        setGlobal((current) => [...current, view]);
      } else if (payload.channel === "CLAN") {
        setClanMsgs((current) => [...current, view]);
      } else if (payload.channel === "PRIVATE" && partner) {
        const involvesPartner =
          payload.senderId === partner.id || payload.recipientId === partner.id;
        if (involvesPartner) {
          setPriv((current) => [...current, view]);
        }
      }
    };
    socket.on(SOCKET_EVENTS.chatMessage, onMessage);
    return () => {
      socket.off(SOCKET_EVENTS.chatMessage, onMessage);
    };
  }, [socket, partner]);

  const send = () => {
    const body = draft.trim();
    if (!body || !socket) {
      return;
    }
    if (tab === "global") {
      socket.emit(SOCKET_EVENTS.chatSend, { channel: "GLOBAL", body });
    } else if (tab === "clan" && clan) {
      socket.emit(SOCKET_EVENTS.chatSend, { channel: "CLAN", body });
    } else if (tab === "private" && partner) {
      socket.emit(SOCKET_EVENTS.chatSend, {
        channel: "PRIVATE",
        body,
        recipientId: partner.id,
      });
    }
    setDraft("");
  };

  const messages = tab === "global" ? global : tab === "clan" ? clanMsgs : priv;
  const canSend =
    tab === "global" || (tab === "clan" && clan !== null) || (tab === "private" && partner !== null);

  return (
    <SceneBackdrop slug="tavern" icon="🍺" title="הטברנה" maxWidth="max-w-2xl">
      <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("global")}
          className={`rounded-md border px-4 py-2 text-sm transition-colors ${
            tab === "global"
              ? "border-gold/60 bg-gold/15 text-gold-bright"
              : "border-void-edge text-neutral-300 hover:border-gold/40"
          }`}
        >
          כללי
        </button>
        {clan && (
          <button
            type="button"
            onClick={() => setTab("clan")}
            className={`rounded-md border px-4 py-2 text-sm transition-colors ${
              tab === "clan"
                ? "border-gold/60 bg-gold/15 text-gold-bright"
                : "border-void-edge text-neutral-300 hover:border-gold/40"
            }`}
          >
            שבט · {clan.name}
          </button>
        )}
        <button
          type="button"
          onClick={() => setTab("private")}
          disabled={!partner}
          className={`rounded-md border px-4 py-2 text-sm transition-colors disabled:opacity-40 ${
            tab === "private"
              ? "border-gold/60 bg-gold/15 text-gold-bright"
              : "border-void-edge text-neutral-300 hover:border-gold/40"
          }`}
        >
          {partner ? `פרטי · ${partner.name}` : "פרטי"}
        </button>
      </div>

      <MessageList messages={messages} currentId={currentId} />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={MAX_CHAT_BODY}
          placeholder={canSend ? "כתוב הודעה…" : "בחר נמען לצ׳אט פרטי"}
          disabled={!canSend || !socket}
          className="field flex-1"
        />
        <button type="submit" className="btn-gold" disabled={!canSend || !socket}>
          שלח
        </button>
      </form>
      {!socket && (
        <p className="text-xs text-neutral-500">מתחבר לשרת הצ׳אט…</p>
      )}
      </div>
    </SceneBackdrop>
  );
}

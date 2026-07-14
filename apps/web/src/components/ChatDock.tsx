"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  SOCKET_EVENTS,
  MAX_CHAT_BODY,
  type ChatMessagePayload,
} from "@kingdom/protocol";
import { useSocket } from "@/components/SocketProvider";

export type DockMessage = {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
};

export function ChatDock({
  currentId,
  initialMessages,
}: {
  currentId: string;
  initialMessages: DockMessage[];
}) {
  const socket = useSocket();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DockMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [unread, setUnread] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;
    const onMessage = (payload: ChatMessagePayload) => {
      if (payload.channel !== "GLOBAL") return;
      setMessages((current) => [
        ...current.slice(-80),
        {
          id: payload.id,
          senderId: payload.senderId,
          senderName: payload.senderName,
          body: payload.body,
        },
      ]);
      setOpen((isOpen) => {
        if (!isOpen) setUnread((n) => n + 1);
        return isOpen;
      });
    };
    socket.on(SOCKET_EVENTS.chatMessage, onMessage);
    return () => {
      socket.off(SOCKET_EVENTS.chatMessage, onMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnread(0);
    }
  }, [messages, open]);

  const send = () => {
    const body = draft.trim();
    if (!body || !socket) return;
    socket.emit(SOCKET_EVENTS.chatSend, { channel: "GLOBAL", body });
    setDraft("");
  };

  const status = useMemo(() => {
    if (!socket) return "מתחבר…";
    return "מחובר";
  }, [socket]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-4xl px-2 pb-2">
        <div className="overflow-hidden rounded-t-xl border border-void-edge bg-void-panel/95 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] backdrop-blur">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2 px-4 py-2 text-right"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden>💬</span>
              <span className="text-sm font-semibold text-gold">צ׳אט כללי</span>
              <span
                className={`h-2 w-2 rounded-full ${socket ? "bg-emerald-500" : "bg-neutral-500"}`}
                title={status}
              />
              {!open && unread > 0 && (
                <span className="rounded-full bg-blood px-1.5 text-[11px] font-bold text-white">
                  {unread}
                </span>
              )}
            </span>
            <span className="text-xs text-neutral-400">{open ? "▼ סגור" : "▲ פתח"}</span>
          </button>

          {open && (
            <div className="border-t border-void-edge">
              <div className="h-56 space-y-1.5 overflow-y-auto px-4 py-3">
                {messages.length === 0 ? (
                  <p className="text-sm text-neutral-500">אין הודעות עדיין. תהיה הראשון.</p>
                ) : (
                  messages.map((message) => {
                    const mine = message.senderId === currentId;
                    return (
                      <div key={message.id} className={mine ? "text-left" : "text-right"}>
                        <span
                          className={`inline-block max-w-[80%] rounded-lg px-3 py-1.5 text-sm ${
                            mine ? "bg-gold/15 text-gold-bright" : "bg-void-soft text-neutral-200"
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
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  send();
                }}
                className="flex gap-2 border-t border-void-edge p-2"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  maxLength={MAX_CHAT_BODY}
                  placeholder={socket ? "כתוב הודעה…" : "מתחבר לשרת הצ׳אט…"}
                  disabled={!socket}
                  className="field flex-1"
                />
                <button type="submit" className="btn-gold px-4" disabled={!socket}>
                  שלח
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

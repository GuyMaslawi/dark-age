"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";
import { SOCKET_EVENTS, type NotificationPayload } from "@kingdom/protocol";

const SocketContext = createContext<Socket | null>(null);

export function useSocket(): Socket | null {
  return useContext(SocketContext);
}

type Toast = { id: number; payload: NotificationPayload };

function Toaster({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto w-full max-w-sm rounded-lg border border-blood/50 bg-void-panel/95 px-4 py-3 shadow-gold backdrop-blur"
        >
          <div className="font-semibold text-red-300">{toast.payload.title}</div>
          <div className="text-sm text-neutral-300">{toast.payload.body}</div>
        </div>
      ))}
    </div>
  );
}

export function SocketProvider({
  token,
  url,
  children,
}: {
  token: string;
  url: string;
  children: React.ReactNode;
}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    const instance = io(url, {
      auth: { token },
      transports: ["websocket"],
    });
    setSocket(instance);

    instance.on(SOCKET_EVENTS.notification, (payload: NotificationPayload) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current, { id, payload }]);
      setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 6000);
    });

    return () => {
      instance.close();
    };
  }, [token, url]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
      <Toaster toasts={toasts} />
    </SocketContext.Provider>
  );
}

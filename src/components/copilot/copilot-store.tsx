"use client";

/**
 * Global copilot state — persists chat history and open/close state
 * across page navigations without a library dependency.
 */
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Message } from "@/components/assistant/chat-message";

interface CopilotState {
  open: boolean;
  messages: Message[];
  input: string;
  loading: boolean;
  error: string | null;
}

interface CopilotActions {
  setOpen: (open: boolean) => void;
  toggle: () => void;
  setInput: (v: string) => void;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

type CopilotCtx = CopilotState & CopilotActions;

const CopilotContext = createContext<CopilotCtx | null>(null);

export function CopilotProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a stable ref to messages for the sendMessage closure
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const setOpen = useCallback((v: boolean) => setOpenState(v), []);
  const toggle = useCallback(() => setOpenState((p) => !p), []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    const history = messagesRef.current.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });
      if (!res.ok) {
        let errMsg = "Request failed";
        try {
          const b = await res.json() as { error?: string };
          if (typeof b.error === "string") errMsg = b.error;
        } catch { /* ignore */ }
        throw new Error(errMsg);
      }
      const body = await res.json() as { data?: { reply: string } };
      const reply = body.data?.reply;
      if (!reply) throw new Error("No response received");
      setMessages((p) => [...p, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return (
    <CopilotContext.Provider
      value={{ open, messages, input, loading, error, setOpen, toggle, setInput, sendMessage, clearChat }}
    >
      {children}
    </CopilotContext.Provider>
  );
}

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error("useCopilot must be used within CopilotProvider");
  return ctx;
}

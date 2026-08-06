"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSupportStore } from "@/store/supportStore";
import { formatChatTime } from "./support-format";
import { cn } from "@/lib/utils";

export function FloatingChatWidget() {
  const open = useSupportStore((s) => s.floatingChatOpen);
  const setFloatingChatOpen = useSupportStore((s) => s.setFloatingChatOpen);
  const chatMessages = useSupportStore((s) => s.chatMessages);
  const chatTyping = useSupportStore((s) => s.chatTyping);
  const sendChatMessage = useSupportStore((s) => s.sendChatMessage);

  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, chatMessages, chatTyping]);

  function handleSend() {
    if (!draft.trim()) return;
    sendChatMessage(draft);
    setDraft("");
  }

  return (
    <>
      {open ? (
        <div className="fixed bottom-24 right-4 z-50 flex w-[min(100vw-2rem,360px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl md:bottom-6 md:right-6">
          <div className="flex items-center justify-between bg-brand px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">PetroTrade Support</p>
              <p className="text-xs opacity-80">Typically replies in minutes</p>
            </div>
            <button
              type="button"
              onClick={() => setFloatingChatOpen(false)}
              className="rounded-lg p-1 hover:bg-white/10"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <ScrollArea className="h-72 px-4 py-3">
            <div className="space-y-2.5">
              <div className="rounded-2xl bg-slate-100 px-3.5 py-2.5 text-sm text-slate-700">
                <p className="font-medium">Hello!</p>
                <p className="mt-0.5">How can we help you?</p>
              </div>
              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
                    m.sender === "customer"
                      ? "ml-auto bg-brand text-white"
                      : "bg-slate-100 text-slate-700",
                  )}
                >
                  <p className="leading-relaxed">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-right text-[10px]",
                      m.sender === "customer" ? "opacity-70" : "text-slate-400",
                    )}
                  >
                    {formatChatTime(m.at)}
                  </p>
                </div>
              ))}
              {chatTyping ? (
                <div className="inline-flex rounded-2xl bg-slate-100 px-3.5 py-2.5 text-xs text-slate-500">
                  Support is typing…
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="flex gap-2 border-t border-slate-100 p-3">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your message…"
              className="rounded-xl"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              size="icon"
              className="shrink-0 rounded-xl bg-brand hover:bg-brand/90"
              onClick={handleSend}
              disabled={!draft.trim()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setFloatingChatOpen(!open)}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl shadow-lg transition-transform hover:scale-105 hover:bg-brand/90 md:right-6"
        aria-label="Open support chat"
      >
        {open ? <X className="h-6 w-6 text-white" /> : "💬"}
      </button>
    </>
  );
}

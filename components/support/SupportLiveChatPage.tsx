"use client";

import { useEffect, useRef } from "react";
import { Check, CheckCheck, Paperclip, Send, Smile } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ALLOWED_ATTACHMENT_ACCEPT } from "@/constants/support";
import { useSupportStore } from "@/store/supportStore";
import { SupportPageHeader } from "./SupportPageHeader";
import { SupportLoadingSkeleton } from "./SupportModuleShell";
import { formatChatTime } from "./support-format";
import { cn } from "@/lib/utils";

const EMOJIS = ["👍", "✅", "🙏", "😊", "📎"];

export function SupportLiveChatPage() {
  const isHydrated = useSupportStore((s) => s.isHydrated);
  const messages = useSupportStore((s) => s.chatMessages);
  const draft = useSupportStore((s) => s.chatDraft);
  const typing = useSupportStore((s) => s.chatTyping);
  const online = useSupportStore((s) => s.chatExecutiveOnline);
  const setChatDraft = useSupportStore((s) => s.setChatDraft);
  const sendChatMessage = useSupportStore((s) => s.sendChatMessage);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  if (!isHydrated) return <SupportLoadingSkeleton />;

  function handleSend() {
    sendChatMessage(draft);
  }

  return (
    <div className="space-y-6">
      <SupportPageHeader
        title="Live Chat"
        subtitle="Chat with PetroTrade Enterprise Support in real time."
        hideSearch
      />

      <Card className="flex h-[min(70vh,720px)] flex-col overflow-hidden rounded-2xl border-slate-200/80 shadow-card">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-slate-100 bg-white px-5 py-4">
          <Avatar className="h-11 w-11">
            <AvatarFallback className="bg-sky-50 font-semibold text-brand">
              AK
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-brand">Asha Krishnan</p>
              {online ? (
                <Badge className="gap-1 rounded-full border-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Online
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-slate-500">
              Enterprise Support Executive · Avg reply &lt; 2 min
            </p>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col bg-slate-50/60 p-0">
          <ScrollArea className="flex-1 px-4 py-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-3">
              {messages.map((m) => {
                const mine = m.sender === "customer";
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex",
                      mine ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm md:max-w-[70%]",
                        mine
                          ? "rounded-br-md bg-brand text-white"
                          : "rounded-bl-md border border-slate-100 bg-white text-slate-700",
                      )}
                    >
                      {!mine ? (
                        <p className="mb-1 text-[11px] font-semibold text-slate-400">
                          {m.senderName}
                        </p>
                      ) : null}
                      <p className="leading-relaxed">{m.body}</p>
                      {m.attachmentName ? (
                        <p
                          className={cn(
                            "mt-1.5 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px]",
                            mine ? "bg-white/10" : "bg-slate-50",
                          )}
                        >
                          <Paperclip className="h-3 w-3" />
                          {m.attachmentName}
                        </p>
                      ) : null}
                      <p
                        className={cn(
                          "mt-1 flex items-center justify-end gap-1 text-[10px]",
                          mine ? "text-white/70" : "text-slate-400",
                        )}
                      >
                        {formatChatTime(m.at)}
                        {mine ? (
                          m.read ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )
                        ) : null}
                      </p>
                    </div>
                  </div>
                );
              })}

              {typing ? (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 text-sm text-slate-400 shadow-sm">
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300" />
                    </span>
                    <span className="ml-2 text-xs">Asha is typing…</span>
                  </div>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-slate-100 bg-white px-4 py-3 md:px-5">
            <div className="mx-auto flex max-w-3xl items-end gap-2">
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="shrink-0 text-slate-500"
                  onClick={() => fileRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="group relative">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="shrink-0 text-slate-500"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-full left-0 z-10 mb-1 hidden gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-elevated group-focus-within:flex group-hover:flex">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        className="rounded-lg px-1.5 py-0.5 text-base hover:bg-slate-50"
                        onClick={() => setChatDraft(`${draft}${e}`)}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Input
                value={draft}
                onChange={(e) => setChatDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message…"
                className="h-11 rounded-xl"
              />
              <Button
                className="h-11 shrink-0 rounded-xl bg-brand hover:bg-brand/90"
                onClick={handleSend}
                disabled={!draft.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept={ALLOWED_ATTACHMENT_ACCEPT}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    sendChatMessage(draft || `Sharing ${file.name}`, file.name);
                    toast.success("Attachment sent", {
                      description: file.name,
                    });
                  }
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ALLOWED_ATTACHMENT_ACCEPT } from "@/constants/support";
import { useSupportStore } from "@/store/supportStore";

export function ChatSupportModal() {
  const open = useSupportStore((s) => s.chatModalOpen);
  const setChatModalOpen = useSupportStore((s) => s.setChatModalOpen);
  const sendChatMessage = useSupportStore((s) => s.sendChatMessage);

  const [message, setMessage] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setMessage("");
    setAttachmentName(undefined);
    setSending(false);
  }

  async function handleSend() {
    if (!message.trim() && !attachmentName) {
      toast.error("Please enter a message");
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 400));
    sendChatMessage(message, attachmentName);
    toast.success("Message sent", {
      description: "Our support team will respond shortly.",
    });
    reset();
    setChatModalOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setChatModalOpen(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-brand">Hello 👋</DialogTitle>
          <p className="text-sm text-slate-600">How can we help you today?</p>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-2">
            <Label htmlFor="chat-message">Your message</Label>
            <Textarea
              id="chat-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue…"
              rows={5}
              className="resize-none rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Attach File</Label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:border-brand/40 hover:bg-sky-50/50"
            >
              <Paperclip className="h-4 w-4" />
              {attachmentName ?? "Choose file (optional)"}
            </button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept={ALLOWED_ATTACHMENT_ACCEPT}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setAttachmentName(file.name);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              setChatModalOpen(false);
              reset();
            }}
          >
            Cancel
          </Button>
          <Button
            className="bg-brand hover:bg-brand/90"
            disabled={sending}
            onClick={handleSend}
          >
            {sending ? "Sending…" : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

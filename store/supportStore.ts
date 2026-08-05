"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ACCOUNT_MANAGER,
  DEFAULT_SUPPORT_FILTERS,
  EXECUTIVE_CHAT_REPLIES,
  MOCK_CHAT_THREAD,
  MOCK_FAQS,
  MOCK_KNOWLEDGE_ARTICLES,
  MOCK_SUPPORT_ACTIVITIES,
  MOCK_SUPPORT_DOCS,
  MOCK_SUPPORT_SUMMARY,
  MOCK_SUPPORT_TICKETS,
} from "@/mock/support";
import { TICKET_CATEGORY_LABELS } from "@/constants/support";
import type {
  AccountManager,
  ChatMessage,
  FaqItem,
  KnowledgeArticle,
  RaiseTicketInput,
  SupportActivity,
  SupportDoc,
  SupportDocPreviewState,
  SupportFiltersState,
  SupportPreferences,
  SupportStatusSummary,
  SupportTicket,
  TicketAttachment,
  TicketMessage,
  TicketPriority,
  TicketStatus,
} from "@/types/support";

const STORAGE_KEY = "petrotrade.support-center.v1";

export interface SupportStoreState {
  tickets: SupportTicket[];
  faqs: FaqItem[];
  docs: SupportDoc[];
  articles: KnowledgeArticle[];
  chatMessages: ChatMessage[];
  activities: SupportActivity[];
  accountManager: AccountManager;
  summary: SupportStatusSummary;
  filters: SupportFiltersState;
  globalSearch: string;
  preferences: SupportPreferences;
  selectedTicketId: string | null;
  raiseTicketOpen: boolean;
  raiseTicketSuccessOpen: boolean;
  lastCreatedTicketId: string | null;
  replyDraft: string;
  chatDraft: string;
  chatTyping: boolean;
  chatExecutiveOnline: boolean;
  docPreview: SupportDocPreviewState | null;
  knowledgePreviewId: string | null;
  isHydrated: boolean;
  isLoading: boolean;

  setHydrated: (v: boolean) => void;
  setGlobalSearch: (q: string) => void;
  setFilters: (patch: Partial<SupportFiltersState>) => void;
  resetFilters: () => void;
  setSelectedTicketId: (id: string | null) => void;
  setRaiseTicketOpen: (open: boolean) => void;
  setRaiseTicketSuccessOpen: (open: boolean) => void;
  createTicket: (input: RaiseTicketInput) => string;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  replyToTicket: (id: string, body: string, attachmentName?: string) => void;
  addTicketAttachment: (id: string, fileName: string) => void;
  closeTicket: (id: string) => void;
  sendChatMessage: (body: string, attachmentName?: string) => void;
  markActivityRead: (id: string) => void;
  markAllActivitiesRead: () => void;
  openDocPreview: (docId: string) => void;
  closeDocPreview: () => void;
  setKnowledgePreviewId: (id: string | null) => void;
  setPreferences: (patch: Partial<SupportPreferences>) => void;
  setReplyDraft: (v: string) => void;
  setChatDraft: (v: string) => void;
  scheduleMeeting: () => void;
}

function nowIso() {
  return new Date().toISOString();
}

function nextTicketNumber(tickets: SupportTicket[]) {
  const nums = tickets
    .map((t) => Number(t.ticketId.replace(/\D/g, "")))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 10391) + 1;
  return `SUP-${next}`;
}

export function computeOpenTicketCount(tickets: SupportTicket[]) {
  return tickets.filter(
    (t) =>
      t.status === "open" ||
      t.status === "in_progress" ||
      t.status === "waiting_customer",
  ).length;
}

export function filterTickets(
  tickets: SupportTicket[],
  filters: SupportFiltersState,
  globalSearch?: string,
) {
  let list = [...tickets];
  const q = (filters.search || globalSearch || "").trim().toLowerCase();
  if (q) {
    list = list.filter((t) =>
      [
        t.ticketId,
        t.subject,
        t.description,
        t.categoryLabel,
        t.assignedTo,
        t.status,
        t.priority,
        t.relatedOrderId,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }
  if (filters.status !== "all") {
    list = list.filter((t) => t.status === filters.status);
  }
  if (filters.priority !== "all") {
    list = list.filter((t) => t.priority === filters.priority);
  }
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    list = list.filter((t) => new Date(t.createdAt).getTime() >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime() + 86_400_000;
    list = list.filter((t) => new Date(t.createdAt).getTime() <= to);
  }
  return list.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function filterFaqs(faqs: FaqItem[], search: string) {
  const q = search.trim().toLowerCase();
  if (!q) return faqs;
  return faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q) ||
      f.tags.some((t) => t.includes(q)),
  );
}

export function filterArticles(
  articles: KnowledgeArticle[],
  search: string,
  category?: string,
) {
  let list = [...articles];
  if (category && category !== "all") {
    list = list.filter((a) => a.category === category);
  }
  const q = search.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.shortDescription.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q),
    );
  }
  return list;
}

export const useSupportStore = create<SupportStoreState>()(
  persist(
    (set, get) => ({
      tickets: MOCK_SUPPORT_TICKETS,
      faqs: MOCK_FAQS,
      docs: MOCK_SUPPORT_DOCS,
      articles: MOCK_KNOWLEDGE_ARTICLES,
      chatMessages: MOCK_CHAT_THREAD,
      activities: MOCK_SUPPORT_ACTIVITIES,
      accountManager: ACCOUNT_MANAGER,
      summary: MOCK_SUPPORT_SUMMARY,
      filters: { ...DEFAULT_SUPPORT_FILTERS },
      globalSearch: "",
      preferences: {
        emailAlerts: true,
        smsAlerts: false,
        ticketUpdates: true,
        chatSound: true,
      },
      selectedTicketId: null,
      raiseTicketOpen: false,
      raiseTicketSuccessOpen: false,
      lastCreatedTicketId: null,
      replyDraft: "",
      chatDraft: "",
      chatTyping: false,
      chatExecutiveOnline: true,
      docPreview: null,
      knowledgePreviewId: null,
      isHydrated: false,
      isLoading: false,

      setHydrated: (v) => set({ isHydrated: v }),
      setGlobalSearch: (q) => set({ globalSearch: q }),
      setFilters: (patch) =>
        set((s) => ({ filters: { ...s.filters, ...patch } })),
      resetFilters: () => set({ filters: { ...DEFAULT_SUPPORT_FILTERS } }),
      setSelectedTicketId: (id) =>
        set({ selectedTicketId: id, replyDraft: "" }),
      setRaiseTicketOpen: (open) => set({ raiseTicketOpen: open }),
      setRaiseTicketSuccessOpen: (open) =>
        set({ raiseTicketSuccessOpen: open }),

      createTicket: (input) => {
        const ticketId = nextTicketNumber(get().tickets);
        const id = `tkt-${ticketId.toLowerCase()}`;
        const now = nowIso();
        const ticket: SupportTicket = {
          id,
          ticketId,
          category: input.category,
          categoryLabel: TICKET_CATEGORY_LABELS[input.category],
          priority: input.priority,
          status: "open",
          subject: input.subject.trim(),
          description: input.description.trim(),
          createdAt: now,
          updatedAt: now,
          assignedTo: "Queue — Enterprise Desk",
          attachments: input.attachmentName
            ? [
                {
                  id: `att-${Date.now()}`,
                  name: input.attachmentName,
                  sizeLabel: "—",
                  mimeType: "application/octet-stream",
                  uploadedAt: now,
                },
              ]
            : [],
          timeline: [
            {
              id: `tl-${Date.now()}`,
              label: "Ticket Created",
              description: "Submitted via Raise New Ticket",
              at: now,
              actor: "You",
            },
          ],
          conversation: [
            {
              id: `msg-${Date.now()}`,
              sender: "customer",
              senderName: "You",
              body: input.description.trim(),
              at: now,
              read: true,
              attachmentName: input.attachmentName,
            },
          ],
          internalNotes: ["Auto-routed to Enterprise queue (frontend mock)."],
        };

        set((s) => ({
          tickets: [ticket, ...s.tickets],
          raiseTicketOpen: false,
          raiseTicketSuccessOpen: true,
          lastCreatedTicketId: ticketId,
          summary: {
            ...s.summary,
            openTickets: s.summary.openTickets + 1,
          },
          activities: [
            {
              id: `act-${Date.now()}`,
              type: "ticket_assigned",
              title: "Ticket Created",
              description: `${ticketId} — ${input.subject.trim()}`,
              at: now,
              read: false,
            },
            ...s.activities,
          ],
        }));
        return ticketId;
      },

      updateTicketStatus: (id, status) => {
        const now = nowIso();
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  updatedAt: now,
                  timeline: [
                    ...t.timeline,
                    {
                      id: `tl-${Date.now()}`,
                      label: `Status → ${status.replace(/_/g, " ")}`,
                      description: "Updated from Support Center",
                      at: now,
                      actor: "You",
                    },
                  ],
                }
              : t,
          ),
        }));
      },

      replyToTicket: (id, body, attachmentName) => {
        const trimmed = body.trim();
        if (!trimmed && !attachmentName) return;
        const now = nowIso();
        const message: TicketMessage = {
          id: `msg-${Date.now()}`,
          sender: "customer",
          senderName: "You",
          body: trimmed || "(Attachment)",
          at: now,
          read: true,
          attachmentName,
        };
        set((s) => ({
          tickets: s.tickets.map((t) => {
            if (t.id !== id) return t;
            return {
              ...t,
              status:
                t.status === "waiting_customer" ? "in_progress" : t.status,
              updatedAt: now,
              conversation: [...t.conversation, message],
              timeline: [
                ...t.timeline,
                {
                  id: `tl-${Date.now()}`,
                  label: "Customer Reply",
                  description: trimmed.slice(0, 80) || "Attachment uploaded",
                  at: now,
                  actor: "You",
                },
              ],
            };
          }),
          replyDraft: "",
        }));

        window.setTimeout(() => {
          const replyAt = nowIso();
          set((s) => ({
            tickets: s.tickets.map((t) => {
              if (t.id !== id) return t;
              return {
                ...t,
                updatedAt: replyAt,
                conversation: [
                  ...t.conversation,
                  {
                    id: `msg-${Date.now()}`,
                    sender: "executive",
                    senderName: t.assignedTo.startsWith("Unassigned")
                      ? "Enterprise Desk"
                      : t.assignedTo,
                    body: "Thanks for the update. We're reviewing and will revert shortly.",
                    at: replyAt,
                    read: true,
                  },
                ],
              };
            }),
          }));
        }, 1600);
      },

      addTicketAttachment: (id, fileName) => {
        const now = nowIso();
        const attachment: TicketAttachment = {
          id: `att-${Date.now()}`,
          name: fileName,
          sizeLabel: "—",
          mimeType: "application/octet-stream",
          uploadedAt: now,
        };
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  updatedAt: now,
                  attachments: [...t.attachments, attachment],
                  timeline: [
                    ...t.timeline,
                    {
                      id: `tl-${Date.now()}`,
                      label: "Attachment Added",
                      description: fileName,
                      at: now,
                      actor: "You",
                    },
                  ],
                }
              : t,
          ),
        }));
      },

      closeTicket: (id) => {
        get().updateTicketStatus(id, "closed");
        set((s) => ({
          summary: {
            ...s.summary,
            openTickets: Math.max(0, s.summary.openTickets - 1),
            resolvedThisMonth: s.summary.resolvedThisMonth + 1,
          },
        }));
      },

      sendChatMessage: (body, attachmentName) => {
        const trimmed = body.trim();
        if (!trimmed && !attachmentName) return;
        const now = nowIso();
        const customerMsg: ChatMessage = {
          id: `chat-${Date.now()}`,
          sender: "customer",
          senderName: "You",
          body: trimmed || "(Attachment)",
          at: now,
          read: true,
          attachmentName,
        };
        set((s) => ({
          chatMessages: [...s.chatMessages, customerMsg],
          chatDraft: "",
          chatTyping: true,
        }));

        const delay = 1200 + Math.floor(Math.random() * 900);
        window.setTimeout(() => {
          const reply =
            EXECUTIVE_CHAT_REPLIES[
              Math.floor(Math.random() * EXECUTIVE_CHAT_REPLIES.length)
            ];
          set((s) => ({
            chatTyping: false,
            chatMessages: [
              ...s.chatMessages,
              {
                id: `chat-${Date.now()}`,
                sender: "executive",
                senderName: "Asha Krishnan",
                body: reply,
                at: nowIso(),
                read: true,
              },
            ],
          }));
        }, delay);
      },

      markActivityRead: (id) =>
        set((s) => ({
          activities: s.activities.map((a) =>
            a.id === id ? { ...a, read: true } : a,
          ),
        })),
      markAllActivitiesRead: () =>
        set((s) => ({
          activities: s.activities.map((a) => ({ ...a, read: true })),
        })),

      openDocPreview: (docId) => {
        const doc = get().docs.find((d) => d.id === docId);
        if (!doc) return;
        set({
          docPreview: {
            open: true,
            docId: doc.id,
            title: doc.title,
            content: doc.content,
            fileName: doc.fileName,
          },
        });
      },
      closeDocPreview: () => set({ docPreview: null }),
      setKnowledgePreviewId: (id) => set({ knowledgePreviewId: id }),
      setPreferences: (patch) =>
        set((s) => ({ preferences: { ...s.preferences, ...patch } })),
      setReplyDraft: (v) => set({ replyDraft: v }),
      setChatDraft: (v) => set({ chatDraft: v }),
      scheduleMeeting: () => {
        const now = nowIso();
        set((s) => ({
          activities: [
            {
              id: `act-${Date.now()}`,
              type: "ticket_assigned",
              title: "Meeting Requested",
              description: `Call with ${s.accountManager.name} requested for next business day`,
              at: now,
              read: false,
            },
            ...s.activities,
          ],
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        tickets: s.tickets,
        chatMessages: s.chatMessages,
        activities: s.activities,
        preferences: s.preferences,
        summary: s.summary,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export type { TicketPriority };

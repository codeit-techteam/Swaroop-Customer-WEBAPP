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
} from "@/mock/support";
import {
  createCustomerSupportTicket,
  listCustomerSupportTickets,
} from "@/services/support";
import apiClient from "@/lib/apiClient";
import type { Envelope } from "@/lib/api-envelope";
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
  TicketPriority,
  TicketStatus,
} from "@/types/support";

const STORAGE_KEY = "petrotrade.support-center.v2";

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
  chatModalOpen: boolean;
  floatingChatOpen: boolean;
  replyDraft: string;
  chatDraft: string;
  chatTyping: boolean;
  chatExecutiveOnline: boolean;
  docPreview: SupportDocPreviewState | null;
  knowledgePreviewId: string | null;
  isHydrated: boolean;
  isLoading: boolean;
  loadError: string | null;

  setHydrated: (v: boolean) => void;
  setGlobalSearch: (q: string) => void;
  setFilters: (patch: Partial<SupportFiltersState>) => void;
  resetFilters: () => void;
  setSelectedTicketId: (id: string | null) => void;
  setRaiseTicketOpen: (open: boolean) => void;
  setRaiseTicketSuccessOpen: (open: boolean) => void;
  setChatModalOpen: (open: boolean) => void;
  setFloatingChatOpen: (open: boolean) => void;
  loadTickets: () => Promise<void>;
  createTicket: (input: RaiseTicketInput) => Promise<string>;
  replyToTicket: (
    id: string,
    body: string,
    attachmentName?: string,
  ) => Promise<void>;
  addTicketAttachment: (id: string, fileName: string) => void;
  closeTicket: (id: string) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
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

function rebuildSummary(tickets: SupportTicket[]): SupportStatusSummary {
  return {
    openTickets: computeOpenTicketCount(tickets),
    paymentVerificationPending: MOCK_SUPPORT_SUMMARY.paymentVerificationPending,
    shipmentIssuesActive: MOCK_SUPPORT_SUMMARY.shipmentIssuesActive,
    resolvedThisMonth: tickets.filter((t) => t.status === "resolved").length,
  };
}

export const useSupportStore = create<SupportStoreState>()(
  persist(
    (set, get) => ({
      tickets: [],
      faqs: MOCK_FAQS,
      docs: MOCK_SUPPORT_DOCS,
      articles: MOCK_KNOWLEDGE_ARTICLES,
      chatMessages: MOCK_CHAT_THREAD,
      activities: MOCK_SUPPORT_ACTIVITIES,
      accountManager: ACCOUNT_MANAGER,
      summary: { ...MOCK_SUPPORT_SUMMARY, openTickets: 0 },
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
      chatModalOpen: false,
      floatingChatOpen: false,
      replyDraft: "",
      chatDraft: "",
      chatTyping: false,
      chatExecutiveOnline: true,
      docPreview: null,
      knowledgePreviewId: null,
      isHydrated: false,
      isLoading: false,
      loadError: null,

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
      setChatModalOpen: (open) => set({ chatModalOpen: open }),
      setFloatingChatOpen: (open) => set({ floatingChatOpen: open }),

      loadTickets: async () => {
        set({ isLoading: true, loadError: null });
        try {
          const tickets = await listCustomerSupportTickets();
          set({
            tickets,
            summary: rebuildSummary(tickets),
            isLoading: false,
            isHydrated: true,
          });
        } catch (error) {
          set({
            isLoading: false,
            isHydrated: true,
            loadError:
              error instanceof Error
                ? error.message
                : "Unable to load support tickets.",
          });
        }
      },

      createTicket: async (input) => {
        const ticket = await createCustomerSupportTicket(input);
        set((s) => {
          const tickets = [
            ticket,
            ...s.tickets.filter((t) => t.id !== ticket.id),
          ];
          return {
            tickets,
            raiseTicketOpen: false,
            raiseTicketSuccessOpen: true,
            lastCreatedTicketId: ticket.ticketId,
            summary: rebuildSummary(tickets),
            activities: [
              {
                id: `act-${Date.now()}`,
                type: "ticket_assigned",
                title: "Ticket Created",
                description: `${ticket.ticketId} — ${ticket.subject}`,
                at: nowIso(),
                read: false,
              },
              ...s.activities,
            ],
          };
        });
        return ticket.ticketId;
      },

      replyToTicket: async (id, body, attachmentName) => {
        const trimmed = body.trim();
        if (!trimmed && !attachmentName) return;
        await apiClient.post<Envelope<unknown>>(
          `/customer/support/tickets/${id}/reply`,
          {
            body: trimmed || "(Attachment)",
            attachmentName,
          },
        );
        await get().loadTickets();
        set({ replyDraft: "" });
      },

      addTicketAttachment: (id, fileName) => {
        const now = nowIso();
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  updatedAt: now,
                  attachments: [
                    ...t.attachments,
                    {
                      id: `att-${Date.now()}`,
                      name: fileName,
                      sizeLabel: "—",
                      mimeType: "application/octet-stream",
                      uploadedAt: now,
                    },
                  ],
                }
              : t,
          ),
        }));
      },

      updateTicketStatus: (id, status) => {
        const now = nowIso();
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === id ? { ...t, status, updatedAt: now } : t,
          ),
        }));
      },

      closeTicket: (id) => {
        get().updateTicketStatus(id, "closed");
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
        chatMessages: s.chatMessages,
        preferences: s.preferences,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export type { TicketPriority, TicketStatus };

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ACCOUNT_MANAGER,
  DEFAULT_SUPPORT_FILTERS,
  MOCK_FAQS,
  MOCK_KNOWLEDGE_ARTICLES,
  MOCK_SUPPORT_ACTIVITIES,
  MOCK_SUPPORT_DOCS,
  MOCK_SUPPORT_SUMMARY,
} from "@/mock/support";
import {
  createCustomerSupportTicket,
  getCustomerSupportTicket,
  listCustomerSupportTickets,
  replyCustomerSupportTicket,
} from "@/services/support";
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

const STORAGE_KEY = "petrotrade.support-center.v3";
const CHAT_TICKET_SUBJECT = "Live chat support";

function isOpenTicket(ticket: SupportTicket) {
  return ticket.status !== "resolved" && ticket.status !== "closed";
}

function pickOpenChatTicket(
  tickets: SupportTicket[],
): SupportTicket | undefined {
  const open = tickets.filter(isOpenTicket);
  const named = open.find((t) => t.subject === CHAT_TICKET_SUBJECT);
  if (named) return named;
  const awaiting = open.find((t) => t.status === "waiting_customer");
  if (awaiting) return awaiting;
  return [...open].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];
}

function ticketToChatMessages(ticket: SupportTicket): ChatMessage[] {
  return ticket.conversation.map((m) => ({
    id: m.id,
    sender: m.sender,
    senderName: m.senderName,
    body: m.body,
    at: m.at,
    read: m.read,
    attachmentName: m.attachmentName,
  }));
}

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
  chatTicketId: string | null;
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
  ensureChatSession: () => Promise<void>;
  refreshChatMessages: () => Promise<void>;
  sendChatMessage: (
    body: string,
    attachmentName?: string,
  ) => Promise<string | null>;
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
      chatMessages: [],
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
      chatTicketId: null,
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
        const updated = await replyCustomerSupportTicket(
          id,
          trimmed,
          attachmentName,
        );
        set((s) => {
          const tickets = s.tickets.map((t) =>
            t.id === updated.id ? updated : t,
          );
          return {
            tickets,
            replyDraft: "",
            summary: rebuildSummary(tickets),
            ...(s.chatTicketId === updated.id
              ? { chatMessages: ticketToChatMessages(updated) }
              : {}),
          };
        });
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

      ensureChatSession: async () => {
        set({ chatTyping: true });
        try {
          let tickets = get().tickets;
          if (tickets.length === 0) {
            tickets = await listCustomerSupportTickets();
            set({ tickets, summary: rebuildSummary(tickets) });
          }

          const existing =
            tickets.find(
              (t) => t.id === get().chatTicketId && isOpenTicket(t),
            ) ?? pickOpenChatTicket(tickets);

          if (existing) {
            const fresh = await getCustomerSupportTicket(existing.id);
            set((s) => ({
              chatTicketId: fresh.id,
              chatMessages: ticketToChatMessages(fresh),
              chatTyping: false,
              tickets: [fresh, ...s.tickets.filter((t) => t.id !== fresh.id)],
              summary: rebuildSummary([
                fresh,
                ...s.tickets.filter((t) => t.id !== fresh.id),
              ]),
            }));
            return;
          }

          set({
            chatTicketId: null,
            chatMessages: [],
            chatTyping: false,
          });
        } catch {
          set({ chatTyping: false });
        }
      },

      refreshChatMessages: async () => {
        const chatTicketId = get().chatTicketId;
        if (!chatTicketId) return;
        try {
          const fresh = await getCustomerSupportTicket(chatTicketId);
          set((s) => ({
            chatMessages: ticketToChatMessages(fresh),
            tickets: s.tickets.map((t) => (t.id === fresh.id ? fresh : t)),
          }));
        } catch {
          /* keep current thread if refresh fails */
        }
      },

      sendChatMessage: async (body, attachmentName) => {
        const trimmed = body.trim();
        if (!trimmed && !attachmentName) return null;

        set({ chatTyping: true, chatDraft: "" });
        try {
          let chatTicketId = get().chatTicketId;
          let ticket: SupportTicket;

          if (!chatTicketId) {
            ticket = await createCustomerSupportTicket({
              category: "others",
              subject: CHAT_TICKET_SUBJECT,
              description:
                trimmed || `Chat attachment: ${attachmentName ?? "file"}`,
              attachmentName,
              priority: "medium",
            });
            chatTicketId = ticket.id;
          } else {
            ticket = await replyCustomerSupportTicket(
              chatTicketId,
              trimmed,
              attachmentName,
            );
          }

          set((s) => {
            const tickets = [
              ticket,
              ...s.tickets.filter((t) => t.id !== ticket.id),
            ];
            return {
              chatTicketId: ticket.id,
              chatMessages: ticketToChatMessages(ticket),
              chatTyping: false,
              tickets,
              summary: rebuildSummary(tickets),
              activities: [
                {
                  id: `act-${Date.now()}`,
                  type: "ticket_replied" as const,
                  title: "Chat message sent",
                  description: `${ticket.ticketId} — synced with support desk`,
                  at: nowIso(),
                  read: false,
                },
                ...s.activities,
              ],
            };
          });
          return ticket.ticketId;
        } catch (error) {
          set({ chatTyping: false });
          throw error;
        }
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
        chatTicketId: s.chatTicketId,
        preferences: s.preferences,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export type { TicketPriority, TicketStatus };

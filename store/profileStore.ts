"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { customerProfileMock } from "@/mock/profile";
import type {
  BankAccountProfile,
  BusinessAddressProfile,
  CompanyProfile,
  CustomerProfileState,
  ProfileContact,
  ProfileDocument,
  ProfilePreferences,
  ProfileTabId,
  SecurityProfile,
  ShippingAddressProfile,
} from "@/types/profile";

const STORAGE_KEY = "petrotrade.customer-profile.v1";

export interface ProfilePreviewState {
  open: boolean;
  document: ProfileDocument | null;
}

export interface ProfileStoreState extends CustomerProfileState {
  activeTab: ProfileTabId;
  isHydrated: boolean;
  isLoading: boolean;
  isEditingCompany: boolean;
  contactSearch: string;
  addressSearch: string;
  documentSearch: string;
  preview: ProfilePreviewState;

  setHydrated: (v: boolean) => void;
  setActiveTab: (tab: ProfileTabId) => void;
  setContactSearch: (q: string) => void;
  setAddressSearch: (q: string) => void;
  setDocumentSearch: (q: string) => void;
  setEditingCompany: (v: boolean) => void;

  updateCompany: (patch: Partial<CompanyProfile>) => void;
  saveCompany: (data: CompanyProfile) => void;

  addContact: (contact: Omit<ProfileContact, "id">) => void;
  updateContact: (id: string, patch: Partial<ProfileContact>) => void;
  deleteContact: (id: string) => void;

  updateBusinessAddress: (data: BusinessAddressProfile) => void;

  addShippingAddress: (addr: Omit<ShippingAddressProfile, "id">) => void;
  updateShippingAddress: (
    id: string,
    patch: Partial<ShippingAddressProfile>,
  ) => void;
  deleteShippingAddress: (id: string) => void;
  setPreferredShipping: (id: string) => void;

  addBankAccount: (account: Omit<BankAccountProfile, "id">) => void;
  updateBankAccount: (id: string, patch: Partial<BankAccountProfile>) => void;
  deleteBankAccount: (id: string) => void;
  setPrimaryBank: (id: string) => void;

  updatePreferences: (patch: Partial<ProfilePreferences>) => void;
  updateSecurity: (patch: Partial<SecurityProfile>) => void;
  toggleTwoFactor: () => void;
  logoutOtherSessions: () => void;
  logoutSession: (id: string) => void;

  openPreview: (doc: ProfileDocument) => void;
  closePreview: () => void;
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function computeProfileCompletion(state: CustomerProfileState): number {
  const checks: boolean[] = [
    !!state.company.legalName,
    !!state.company.tradeName,
    !!state.company.gstNumber,
    !!state.company.pan,
    !!state.company.email,
    !!state.company.phone,
    !!state.company.cin,
    !!state.company.website,
    !!state.company.description,
    state.gstPan.gstStatus === "verified",
    state.gstPan.panStatus === "verified",
    state.contacts.length > 0,
    state.contacts.some((c) => c.isPrimary),
    !!state.businessAddress.addressLine1,
    !!state.businessAddress.pincode,
    state.shippingAddresses.length > 0,
    state.shippingAddresses.some((a) => a.isPreferred),
    state.bankAccounts.length > 0,
    state.bankAccounts.some((b) => b.isPrimary && b.isVerified),
    state.credit.creditLimit > 0,
    state.security.twoFactorEnabled,
    state.documents.length >= 4,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export const useProfileStore = create<ProfileStoreState>()(
  persist(
    (set) => ({
      ...customerProfileMock,
      activeTab: "company",
      isHydrated: false,
      isLoading: false,
      isEditingCompany: false,
      contactSearch: "",
      addressSearch: "",
      documentSearch: "",
      preview: { open: false, document: null },

      setHydrated: (v) => set({ isHydrated: v }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setContactSearch: (q) => set({ contactSearch: q }),
      setAddressSearch: (q) => set({ addressSearch: q }),
      setDocumentSearch: (q) => set({ documentSearch: q }),
      setEditingCompany: (v) => set({ isEditingCompany: v }),

      updateCompany: (patch) =>
        set((s) => ({
          company: { ...s.company, ...patch },
          gstPan: {
            ...s.gstPan,
            gstNumber: patch.gstNumber ?? s.gstPan.gstNumber,
            panNumber: patch.pan ?? s.gstPan.panNumber,
          },
        })),

      saveCompany: (data) =>
        set((s) => ({
          company: data,
          gstPan: {
            ...s.gstPan,
            gstNumber: data.gstNumber,
            panNumber: data.pan,
          },
          isEditingCompany: false,
        })),

      addContact: (contact) =>
        set((s) => ({
          contacts: [...s.contacts, { ...contact, id: uid("ct") }],
        })),

      updateContact: (id, patch) =>
        set((s) => ({
          contacts: s.contacts.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),

      deleteContact: (id) =>
        set((s) => ({
          contacts: s.contacts.filter((c) => c.id !== id),
        })),

      updateBusinessAddress: (data) => set({ businessAddress: data }),

      addShippingAddress: (addr) =>
        set((s) => {
          const next = { ...addr, id: uid("sa") };
          const list = next.isPreferred
            ? s.shippingAddresses.map((a) => ({ ...a, isPreferred: false }))
            : s.shippingAddresses;
          return { shippingAddresses: [...list, next] };
        }),

      updateShippingAddress: (id, patch) =>
        set((s) => ({
          shippingAddresses: s.shippingAddresses.map((a) => {
            if (a.id !== id) {
              if (patch.isPreferred) return { ...a, isPreferred: false };
              return a;
            }
            return { ...a, ...patch };
          }),
        })),

      deleteShippingAddress: (id) =>
        set((s) => ({
          shippingAddresses: s.shippingAddresses.filter((a) => a.id !== id),
        })),

      setPreferredShipping: (id) =>
        set((s) => ({
          shippingAddresses: s.shippingAddresses.map((a) => ({
            ...a,
            isPreferred: a.id === id,
          })),
        })),

      addBankAccount: (account) =>
        set((s) => {
          const next = { ...account, id: uid("bk") };
          const list = next.isPrimary
            ? s.bankAccounts.map((b) => ({ ...b, isPrimary: false }))
            : s.bankAccounts;
          return { bankAccounts: [...list, next] };
        }),

      updateBankAccount: (id, patch) =>
        set((s) => ({
          bankAccounts: s.bankAccounts.map((b) => {
            if (b.id !== id) {
              if (patch.isPrimary) return { ...b, isPrimary: false };
              return b;
            }
            return { ...b, ...patch };
          }),
        })),

      deleteBankAccount: (id) =>
        set((s) => ({
          bankAccounts: s.bankAccounts.filter((b) => b.id !== id),
        })),

      setPrimaryBank: (id) =>
        set((s) => ({
          bankAccounts: s.bankAccounts.map((b) => ({
            ...b,
            isPrimary: b.id === id,
          })),
        })),

      updatePreferences: (patch) =>
        set((s) => ({ preferences: { ...s.preferences, ...patch } })),

      updateSecurity: (patch) =>
        set((s) => ({ security: { ...s.security, ...patch } })),

      toggleTwoFactor: () =>
        set((s) => ({
          security: {
            ...s.security,
            twoFactorEnabled: !s.security.twoFactorEnabled,
          },
        })),

      logoutOtherSessions: () =>
        set((s) => ({
          security: {
            ...s.security,
            sessions: s.security.sessions.filter((sess) => sess.isCurrent),
          },
        })),

      logoutSession: (id) =>
        set((s) => ({
          security: {
            ...s.security,
            sessions: s.security.sessions.filter((sess) => sess.id !== id),
          },
        })),

      openPreview: (doc) => set({ preview: { open: true, document: doc } }),
      closePreview: () => set({ preview: { open: false, document: null } }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        company: s.company,
        contacts: s.contacts,
        businessAddress: s.businessAddress,
        shippingAddresses: s.shippingAddresses,
        bankAccounts: s.bankAccounts,
        gstPan: s.gstPan,
        credit: s.credit,
        security: s.security,
        preferences: s.preferences,
        activity: s.activity,
        documents: s.documents,
        stats: s.stats,
        lastLogin: s.lastLogin,
        verificationStatus: s.verificationStatus,
        creditStatus: s.creditStatus,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

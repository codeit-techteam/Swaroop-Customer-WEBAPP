import apiClient from "@/lib/apiClient";
import { paginateAll, type Envelope } from "@/lib/api-envelope";

export type BackendDocument = {
  id: string;
  title?: string;
  fileName?: string | null;
  category?: string;
  status?: string;
  createdAt?: string;
};

export async function fetchCustomerDocuments(): Promise<BackendDocument[]> {
  return paginateAll(async (page) => {
    const payload = await apiClient.get<Envelope<BackendDocument[]>>(
      `/customer/documents?page=${page}&limit=50`,
    );
    return { items: payload.data ?? [], totalPages: payload.meta?.totalPages ?? 1 };
  });
}

export async function fetchCustomerNotifications() {
  const payload = await apiClient.get<Envelope<Array<{
    id: string;
    title: string;
    body: string;
    readAt?: string | null;
    createdAt: string;
  }>>>("/customer/notifications?limit=50");
  return payload.data ?? [];
}

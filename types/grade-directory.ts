/** Customer-visible Grade Master entry (no reference prices by design). */
export interface GradeDirectoryCategory {
  id: string;
  code: string;
  name: string;
  displayName: string;
  parentGroup: string | null;
}

export interface GradeDirectoryItem {
  id: string;
  code: string;
  name: string;
  displayName: string;
  description: string | null;
  gradeGroup: string | null;
  gradeNo: string | null;
  manufacturer: string | null;
  fullGradeName: string | null;
  inTodaysDelhiPriceList: boolean;
  category: GradeDirectoryCategory | null;
  liveOfferCount: number;
}

export interface GradeDirectoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  categoryId?: string;
  gradeGroup?: string;
  manufacturer?: string;
  hasOffers?: boolean;
}

export interface GradeFacetQuery {
  category?: string;
  categoryId?: string;
  search?: string;
}

export interface GradeFacetCategory {
  id: string;
  code: string;
  name: string;
  displayName: string;
  gradeCount: number;
}

export interface GradeFacetOption {
  name: string;
  gradeCount: number;
}

export interface GradeFacets {
  categories: GradeFacetCategory[];
  gradeGroups: GradeFacetOption[];
  manufacturers: GradeFacetOption[];
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PagedResult<T> {
  items: T[];
  meta: PageMeta;
}

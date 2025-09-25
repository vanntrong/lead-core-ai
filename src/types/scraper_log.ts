import type { Database } from "../../database.types";

export type ScraperStatus = Database["public"]["Enums"]["scraper_status"];
export type ScraperSource = Database["public"]["Enums"]["lead_source"];

// Base scraper_log type from database
export type ScraperLogRow = Database["public"]["Tables"]["scraper_logs"]["Row"];
export type ScraperLogInsert = Database["public"]["Tables"]["scraper_logs"]["Insert"];
export type ScraperLogUpdate = Database["public"]["Tables"]["scraper_logs"]["Update"];

export interface ScraperLog extends ScraperLogRow { }

export interface PaginatedScraperLogResponse {
  data: ScraperLog[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

export interface CreateScraperLogData extends Partial<ScraperLogRow> {
}

// Lead update data
export interface UpdateScraperLogData extends Partial<ScraperLogRow> {
  id: string;
}

export interface ScraperLogFilters {
  page?: number;
  limit?: number;
  status?: ScraperStatus;
  source?: ScraperSource;
  search?: string; // Search across url, source, status
  date_range?: {
    start: string;
    end: string;
  };
}

export interface ScraperLogStats {
  total: number;
  success: number;
  failed: number;
  average_duration: number | null;
  source_breakdown: Array<{
    source: string;
    count: number;
    success_rate: number;
  }>;
}

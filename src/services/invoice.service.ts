import { createClient } from "@/lib/supabase/server";
import { Invoice, InvoiceFilters } from "@/types/invoice";

export class InvoiceService {
  private async getSupabaseClient() {
    return await createClient();
  }

  /**
   * Get all invoices for a user
   */
  async getUserInvoices(): Promise<Invoice[]> {
    const supabase = await this.getSupabaseClient();
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as Invoice[]) || [];
  }

  async getInvoicesPaginated(filters?: InvoiceFilters): Promise<{
    data: Invoice[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
  }> {
    const supabase = await this.getSupabaseClient();

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const offset = (page - 1) * limit;

    // Build data query
    let query = supabase.from('invoices').select('*');

    // Build count query (head:true for faster count)
    let countQuery = supabase.from('invoices').select('*', { count: 'exact', head: true });

    // Apply pagination and ordering
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const [{ data, error }, { count, error: countError }] = await Promise.all([
      query,
      countQuery,
    ]);

    if (error) {
      console.error("Error fetching paginated invoices:", error);
      throw new Error(`Failed to fetch paginated invoices: ${error.message}`);
    }

    if (countError) {
      console.error("Error fetching invoices count:", countError);
      throw new Error(`Failed to fetch invoices count: ${countError.message}`);
    }

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: (data ?? []) as Invoice[],
      totalCount,
      currentPage: page,
      totalPages,
      itemsPerPage: limit,
    };
  }

}

export const invoiceService = new InvoiceService();
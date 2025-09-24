// features/products/api.ts
import { supabase } from "@/lib/supabase";

export type ImageObj = {
  url: string;
  alt?: string;
  role?: string;
  width?: number;
  height?: number;
};

export type Product = {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  price_cents?: number | null;
  product_type?: string | null;
  scent?: string | null;
  size?: string | null;
  inventory_count?: number | null;
  image_urls?: ImageObj[] | null;
  metadata?: Record<string, any> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

/**
 * Options for fetching products
 */
export type GetProductsOpts = {
  page?: number;            // 1-based
  pageSize?: number;
  filters?: {
    product_type?: string | string[]; // exact match or array
    scent?: string | string[];
    size?: string | string[];
    priceMinCents?: number;
    priceMaxCents?: number;
  };
  orderBy?: { column: string; ascending?: boolean };
};

/**
 * Fetch paginated products with optional filters.
 * Returns { products, total } where total is the full count matching filters.
 */
export async function getProducts(opts: GetProductsOpts = {}) {
  const { page = 1, pageSize = 9, filters = {}, orderBy = { column: "created_at", ascending: false } } = opts;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query: any = supabase.from("products").select("*", { count: "exact" });

  // helper to apply single or array filter using `in` when appropriate
  const applyEqOrIn = (col: string, value?: string | string[]) => {
    if (!value) return;
    if (Array.isArray(value)) {
      if (value.length === 0) return;
      query = query.in(col, value);
    } else {
      query = query.eq(col, value);
    }
  };

  applyEqOrIn("product_type", filters.product_type);
  applyEqOrIn("scent", filters.scent);
  applyEqOrIn("size", filters.size);

  if (typeof filters.priceMinCents === "number") query = query.gte("price_cents", filters.priceMinCents);
  if (typeof filters.priceMaxCents === "number" && isFinite(filters.priceMaxCents)) query = query.lte("price_cents", filters.priceMaxCents);

  query = query.order(orderBy.column, { ascending: !!orderBy.ascending });

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("getProducts error:", error);
    throw error;
  }

  return {
    products: (data ?? []) as Product[],
    total: count ?? 0,
  };
}

/** Fetch a single product by id (or slug if you prefer) */
export async function getProductById(id: string) {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) {
    console.error("getProductById error:", error);
    throw error;
  }
  return data as Product;
}

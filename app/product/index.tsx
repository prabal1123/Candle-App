import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { productListStyles as styles } from "@/styles/productList";
import { getProducts, Product } from "@/features/products/api";

const CATEGORY_LABELS: Record<string, string> = {
  jar: "Jar & Container",
  "gift-set": "Gift Set",
  decorative: "Decorative",
};

const CATEGORY_TO_DB: Record<string, string> = {
  jar: "jar",
  "gift-set": "gift-set",
  decorative: "decorative",
};

/* ---------- helpers ---------- */
function formatPriceFromCents(cents?: number | null) {
  if (!cents && cents !== 0) return "0.00";
  return (cents / 100).toFixed(2);
}

function getColor(p: any): string | null {
  const m = p?.metadata;
  const meta =
    (m && (m.color ?? m.colour)) ??
    (typeof m === "object" ? (m?.color ?? m?.colour) : null);
  if (meta) return String(meta);

  const name: string = p?.name ?? "";
  const m1 = name.match(/colour\s*:\s*([A-Za-z]+)\s*$/i);
  if (m1) return m1[1];
  const m2 = name.match(/\(([A-Za-z]+)\)\s*$/);
  if (m2) return m2[1];
  return null;
}

function normalizeNameForGrouping(name?: string | null): string {
  if (!name) return "";
  let n = name.replace(/colour\s*:\s*[A-Za-z]+\s*$/i, "");
  n = n.replace(/\([A-Za-z]+\)\s*$/, "");
  return n.trim().toLowerCase();
}

type Family = {
  key: string;
  scent: string | null;
  baseName: string;
  ids: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  rep: Product;
};

function buildFamilies(rows: Product[]): Family[] {
  const map = new Map<string, Family>();

  const colorScore = (c?: string | null) => {
    const v = (c ?? "").toLowerCase();
    if (v === "white") return 3;
    if (v === "green") return 2;
    if (v === "red") return 1;
    return 0;
  };

  for (const p of rows) {
    const baseName = normalizeNameForGrouping(p.name);
    const scent = p.scent ?? null;
    const color = getColor(p) ?? "Default";
    const key = `${(scent ?? "").toLowerCase()}::${baseName}`;
    const price = p.price_cents ?? 0;

    if (!map.has(key)) {
      map.set(key, {
        key,
        scent,
        baseName,
        ids: [p.id],
        colors: [color],
        minPrice: price,
        maxPrice: price,
        rep: p,
      });
    } else {
      const f = map.get(key)!;
      f.ids.push(p.id);
      if (!f.colors.includes(color)) f.colors.push(color);
      f.minPrice = Math.min(f.minPrice, price);
      f.maxPrice = Math.max(f.maxPrice, price);

      const currentScore = colorScore(getColor(f.rep));
      const candidateScore = colorScore(color);
      if (candidateScore > currentScore) f.rep = p;
    }
  }

  for (const f of map.values()) {
    f.colors.sort((a, b) => a.localeCompare(b));
  }

  return Array.from(map.values());
}
/* ---------- end helpers ---------- */

export default function ProductListPage() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const activeCategory = (category ?? "").toString().trim();
  const dbValue = CATEGORY_TO_DB[activeCategory];

  const [rows, setRows] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const basePageSize = 9;
  const fetchPageSize = 100;

  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [familyCache, setFamilyCache] = useState<Family[]>([]);

  const { width: screenWidth } = useWindowDimensions();
  const columns = screenWidth <= 420 ? 2 : screenWidth <= 900 ? 3 : 4;

  const horizontalPadding = 56;
  const gapBetween = 12;
  const columnWidth = Math.floor(
    (screenWidth - horizontalPadding - gapBetween * (columns - 1)) / columns
  );

  useEffect(() => {
    setPage(1);
  }, [dbValue]);

  async function load() {
    setLoading(true);
    try {
      const { products: res } = await getProducts({
        page,
        pageSize: fetchPageSize,
        orderBy: { column: "created_at", ascending: false },
        filters: dbValue ? { product_type: dbValue } : undefined,
      });

      const families = buildFamilies(res);
      families.sort(
        (a, b) =>
          new Date(b.rep.created_at ?? 0).getTime() -
          new Date(a.rep.created_at ?? 0).getTime()
      );

      setRows(families.map((f) => f.rep));
      setTotal(families.length);
      setFamilyCache(families);
    } catch {
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page, dbValue]);

  const repsById = useMemo(() => {
    const m = new Map<string, Family>();
    for (const f of familyCache) m.set(f.rep.id, f);
    return m;
  }, [familyCache]);

  const totalPages = Math.max(1, Math.ceil(total / basePageSize));
  const heading =
    dbValue && CATEGORY_LABELS[activeCategory]
      ? CATEGORY_LABELS[activeCategory]
      : "Aromatic Candles";

  const start = (page - 1) * basePageSize;
  const reps = rows.slice(start, start + basePageSize);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 80 }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12, color: "#666" }}>Loading products...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.shopHeading}>{heading}</Text>

      <View style={styles.gridColWrapper}>
        {reps.map((p) => {
          const fam = repsById.get(p.id);
          const colorsLabel =
            fam && fam.colors.length > 1 ? `• ${fam.colors.length} colors` : "";
          const priceLabel =
            fam && fam.minPrice !== fam.maxPrice
              ? `₹${formatPriceFromCents(fam.minPrice)} – ₹${formatPriceFromCents(
                  fam.maxPrice
                )}`
              : `₹${formatPriceFromCents(p.price_cents)}`;

          const cleanName = p.name.replace(
            /\s*Colour\s*:\s*[A-Za-z]+$/i,
            ""
          );

          return (
            <View
              key={p.id}
              style={{ width: columnWidth, padding: 6 }}
              onMouseEnter={
                Platform.OS === "web"
                  ? (e: any) => {
                      e.currentTarget.style.transform = "scale(1.03)";
                      e.currentTarget.style.boxShadow =
                        "0 14px 36px rgba(0,0,0,0.15)";
                    }
                  : undefined
              }
              onMouseLeave={
                Platform.OS === "web"
                  ? (e: any) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 18px rgba(16,24,40,0.06)";
                    }
                  : undefined
              }
            >
              <Link href={`/product/${p.id}`} asChild>
                <Pressable style={styles.productCard}>
                  <Image
                    source={
                      p.image_urls?.[0]?.url
                        ? { uri: p.image_urls[0].url }
                        : require("../../assets/images/logo.png")
                    }
                    style={[
                      styles.productImage,
                      screenWidth <= 420 ? { height: 140 } : { height: 180 },
                    ]}
                    resizeMode="cover"
                  />

                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle} numberOfLines={2}>
                      {cleanName}
                    </Text>

                    {fam && (
                      <Text style={{ marginTop: 2, color: "#666", fontSize: 12 }}>
                        {p.scent ?? ""} {colorsLabel}
                      </Text>
                    )}

                    <Text style={styles.productPrice}>{priceLabel}</Text>
                  </View>
                </Pressable>
              </Link>
            </View>
          );
        })}
      </View>

      {totalPages > 1 && (
        <View style={styles.pagination}>
          <Pressable
            style={[styles.pageBtn, page === 1 && { opacity: 0.5 }]}
            onPress={() => setPage((s) => Math.max(1, s - 1))}
            disabled={page === 1}
          >
            <Text>◀</Text>
          </Pressable>

          <Text style={{ marginHorizontal: 8 }}>
            {page} / {totalPages}
          </Text>

          <Pressable
            style={[styles.pageBtn, page === totalPages && { opacity: 0.5 }]}
            onPress={() => setPage((s) => Math.min(totalPages, s + 1))}
            disabled={page === totalPages}
          >
            <Text>▶</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

// import React, { useMemo, useState, useEffect } from "react";
// import { View, Text, Pressable, StyleSheet } from "react-native";

// export type Variant = {
//   id: string;
//   fragrance: string;
//   jarType: string;       // NEW: e.g. "Amber Jar", "Wooden Jar", "Sachet", "Car Diffuser"
//   color: string;
//   size?: string | null;
//   price: number;
//   stock: number;
//   imageUrl?: string;
// };

// export type VariantSelectorValue = {
//   fragrance: string | null;
//   jarType: string | null;  // NEW
//   color: string | null;
//   size?: string | null;
//   variant: Variant | null;
// };

// interface VariantSelectorProps {
//   variants: Variant[];
//   onChange?: (v: VariantSelectorValue) => void;
//   showSize?: boolean;
// }

// // Label map: DB value → display label
// const JAR_TYPE_LABELS: Record<string, string> = {
//   "amber-jar":     "Amber Jar",
//   "wooden-jar":    "Wooden Jar",
//   "sachet":        "Sachet",
//   "car-diffuser":  "Car Diffuser",
//   "jar":           "Jar",
//   "gift-set":      "Gift Set",
//   "decorative":    "Decorative",
// };

// function jarLabel(val: string): string {
//   return JAR_TYPE_LABELS[val] ?? val;
// }

// export function useVariantSelection(variants: Variant[]) {
//   const [selectedFragrance, setSelectedFragrance] = useState<string | null>(null);
//   const [selectedJarType, setSelectedJarType]     = useState<string | null>(null);
//   const [selectedColor, setSelectedColor]         = useState<string | null>(null);
//   const [selectedSize, setSelectedSize]           = useState<string | null>(null);

//   // ── Step 1: All unique fragrances ──────────────────────────────────────────
//   const fragrances = useMemo(
//     () => Array.from(new Set(variants.map(v => v.fragrance))),
//     [variants]
//   );

//   // ── Step 2: Jar types available for selected fragrance ────────────────────
//   const availableJarTypes = useMemo(() => {
//     const pool = selectedFragrance
//       ? variants.filter(v => v.fragrance === selectedFragrance)
//       : variants;
//     return Array.from(new Set(pool.map(v => v.jarType)));
//   }, [variants, selectedFragrance]);

//   // ── Step 3: Colors available for selected fragrance + jarType ─────────────
//   const availableColors = useMemo(() => {
//     const pool = variants.filter(v =>
//       (!selectedFragrance || v.fragrance === selectedFragrance) &&
//       (!selectedJarType   || v.jarType   === selectedJarType)
//     );
//     return Array.from(new Set(pool.map(v => v.color)));
//   }, [variants, selectedFragrance, selectedJarType]);

//   // ── Step 4: Sizes for current fragrance + jarType + color ─────────────────
//   const availableSizes = useMemo(() => {
//     const pool = variants.filter(v =>
//       (!selectedFragrance || v.fragrance === selectedFragrance) &&
//       (!selectedJarType   || v.jarType   === selectedJarType)   &&
//       (!selectedColor     || v.color     === selectedColor)
//     );
//     return Array.from(new Set(pool.map(v => v.size))).filter(Boolean) as string[];
//   }, [variants, selectedFragrance, selectedJarType, selectedColor]);

//   // ── Resolved variant ───────────────────────────────────────────────────────
//   const selectedVariant = useMemo(() => {
//     return variants.find(v =>
//       v.fragrance === selectedFragrance &&
//       v.jarType   === selectedJarType   &&
//       v.color     === selectedColor     &&
//       (!v.size || v.size === selectedSize)
//     ) ?? null;
//   }, [variants, selectedFragrance, selectedJarType, selectedColor, selectedSize]);

//   // ── Seed defaults on first load ────────────────────────────────────────────
//   useEffect(() => {
//     if (variants.length === 0) return;
//     if (!selectedFragrance) setSelectedFragrance(fragrances[0] ?? null);
//   }, [variants]);

//   // ── When fragrance changes → reset jar type, keep if still valid ──────────
//   useEffect(() => {
//     if (!selectedFragrance) return;
//     if (selectedJarType && availableJarTypes.includes(selectedJarType)) return;
//     setSelectedJarType(availableJarTypes[0] ?? null);
//     setSelectedColor(null);
//     setSelectedSize(null);
//   }, [selectedFragrance, availableJarTypes]);

//   // ── When jar type changes → reset color if no longer valid ────────────────
//   useEffect(() => {
//     if (!selectedJarType) return;
//     if (selectedColor && availableColors.includes(selectedColor)) return;
//     setSelectedColor(availableColors[0] ?? null);
//     setSelectedSize(null);
//   }, [selectedJarType, availableColors]);

//   // ── When color changes → reset size if no longer valid ────────────────────
//   useEffect(() => {
//     if (!selectedColor) return;
//     if (selectedSize && availableSizes.includes(selectedSize)) return;
//     setSelectedSize(availableSizes[0] ?? null);
//   }, [selectedColor, availableSizes]);

//   return {
//     fragrances,
//     availableJarTypes,
//     availableColors,
//     availableSizes,
//     selectedFragrance,  setSelectedFragrance,
//     selectedJarType,    setSelectedJarType,
//     selectedColor,      setSelectedColor,
//     selectedSize,       setSelectedSize,
//     selectedVariant,
//   } as const;
// }

// export const VariantSelector: React.FC<VariantSelectorProps> = ({
//   variants,
//   onChange,
//   showSize,
// }) => {
//   const {
//     fragrances,
//     availableJarTypes,
//     availableColors,
//     availableSizes,
//     selectedFragrance,  setSelectedFragrance,
//     selectedJarType,    setSelectedJarType,
//     selectedColor,      setSelectedColor,
//     selectedSize,       setSelectedSize,
//     selectedVariant,
//   } = useVariantSelection(variants);

//   useEffect(() => {
//     onChange?.({
//       fragrance: selectedFragrance,
//       jarType:   selectedJarType,
//       color:     selectedColor,
//       size:      selectedSize,
//       variant:   selectedVariant,
//     });
//   }, [selectedFragrance, selectedJarType, selectedColor, selectedSize, selectedVariant]);

//   return (
//     <View style={styles.container}>

//       {/* ── FRAGRANCE ─────────────────────────────────────────────────────── */}
//       {fragrances.length > 1 && (
//         <>
//           <Text style={styles.label}>Fragrance</Text>
//           <View style={styles.row}>
//             {fragrances.map(f => (
//               <Pressable
//                 key={f}
//                 style={[styles.pill, selectedFragrance === f && styles.pillActive]}
//                 onPress={() => setSelectedFragrance(f)}
//               >
//                 <Text style={[styles.pillText, selectedFragrance === f && styles.pillTextActive]}>
//                   {f}
//                 </Text>
//               </Pressable>
//             ))}
//           </View>
//         </>
//       )}

//       {/* ── JAR TYPE — only shown if 2+ types exist for this fragrance ────── */}
//       {selectedFragrance && availableJarTypes.length > 1 && (
//         <>
//           <Text style={styles.label}>Type</Text>
//           <View style={styles.row}>
//             {availableJarTypes.map(jt => (
//               <Pressable
//                 key={jt}
//                 style={[styles.card, selectedJarType === jt && styles.cardActive]}
//                 onPress={() => setSelectedJarType(jt)}
//               >
//                 <Text style={[styles.cardText, selectedJarType === jt && styles.cardTextActive]}>
//                   {jarLabel(jt)}
//                 </Text>
//               </Pressable>
//             ))}
//           </View>
//         </>
//       )}

//       {/* ── COLOR — only shown after jar type resolved ─────────────────────── */}
//       {selectedJarType && availableColors.length > 1 && (
//         <>
//           <Text style={styles.label}>Color</Text>
//           <View style={styles.row}>
//             {availableColors.map(c => (
//               <Pressable
//                 key={c}
//                 style={[styles.card, selectedColor === c && styles.cardActive]}
//                 onPress={() => setSelectedColor(c)}
//               >
//                 <Text style={[styles.cardText, selectedColor === c && styles.cardTextActive]}>
//                   {c}
//                 </Text>
//               </Pressable>
//             ))}
//           </View>
//         </>
//       )}

//       {/* ── SIZE ──────────────────────────────────────────────────────────── */}
//       {showSize && selectedColor && availableSizes.length > 1 && (
//         <>
//           <Text style={styles.label}>Size</Text>
//           <View style={styles.row}>
//             {availableSizes.map(s => (
//               <Pressable
//                 key={s}
//                 style={[styles.pill, selectedSize === s && styles.pillActive]}
//                 onPress={() => setSelectedSize(s)}
//               >
//                 <Text style={[styles.pillText, selectedSize === s && styles.pillTextActive]}>
//                   {s}
//                 </Text>
//               </Pressable>
//             ))}
//           </View>
//         </>
//       )}

//       {/* ── SUMMARY ───────────────────────────────────────────────────────── */}
//       {selectedJarType && selectedColor && (
//         <View style={styles.selectionSummary}>
//           <Text style={styles.summaryText}>
//             Selected:{" "}
//             <Text style={styles.highlight}>{jarLabel(selectedJarType)}</Text>
//             {selectedColor ? (
//               <> · <Text style={styles.highlight}>{selectedColor}</Text></>
//             ) : null}
//             {selectedSize ? (
//               <> · <Text style={styles.highlight}>{selectedSize}</Text></>
//             ) : null}
//           </Text>
//         </View>
//       )}

//       {/* ── STOCK ─────────────────────────────────────────────────────────── */}
//       {selectedVariant && (
//         <View style={styles.stockRow}>
//           <View style={[styles.stockDot, { backgroundColor: selectedVariant.stock > 0 ? "#4ADE80" : "#F87171" }]} />
//           <Text style={styles.meta}>
//             {selectedVariant.stock > 0
//               ? `In stock: ${selectedVariant.stock} units`
//               : "Currently out of stock"}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { gap: 16 },
//   label: { fontSize: 14, fontWeight: "700", color: "#111", textTransform: "uppercase", letterSpacing: 0.5 },
//   row: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
//   pill: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
//   pillActive: { borderColor: "#111", backgroundColor: "#111" },
//   pillText: { fontSize: 14, color: "#444" },
//   pillTextActive: { color: "#fff", fontWeight: "600" },
//   card: { minWidth: 80, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", backgroundColor: "#fff" },
//   cardActive: { borderColor: "#111", backgroundColor: "#fff", borderWidth: 2 },
//   cardText: { fontSize: 14, color: "#444" },
//   cardTextActive: { color: "#111", fontWeight: "700" },
//   selectionSummary: { backgroundColor: "#F3F4F6", padding: 12, borderRadius: 8, marginTop: 8, borderLeftWidth: 4, borderLeftColor: "#111" },
//   summaryText: { fontSize: 14, color: "#374151", lineHeight: 20 },
//   highlight: { fontWeight: "800", color: "#000" },
//   stockRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
//   stockDot: { width: 8, height: 8, borderRadius: 4 },
//   meta: { fontSize: 13, color: "#666" },
// });



import React, { useMemo, useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export type Variant = {
  id: string;
  fragrance: string;
  jarType: string;
  color: string;
  size?: string | null;
  price: number;
  stock: number;
  imageUrl?: string;
};

export type VariantSelectorValue = {
  fragrance: string | null;
  jarType: string | null;
  color: string | null;
  size?: string | null;
  variant: Variant | null;
};

interface VariantSelectorProps {
  variants: Variant[];
  onChange?: (v: VariantSelectorValue) => void;
  showSize?: boolean;
}

const JAR_TYPE_LABELS: Record<string, string> = {
  "amber-jar":       "Amber Jar",
  "wooden-lid":      "Wooden Lid",
  "car-diffuser":    "Car Diffuser",
  "wardrobe-sachet": "Wardrobe Sachet",
  "reed-diffuser":   "Reed Diffuser",
  "wax-melt":        "Wax Melt",
  "decor":           "Decor",
  "bouquet":         "Bouquet",
  "wooden-jar":      "Wooden Jar",
  "sachet":          "Sachet",
  "jar":             "Jar",
  "gift-set":        "Gift Set",
  "decorative":      "Decorative",
  "other":           "Other",
};

function jarLabel(val: string | null): string {
  if (!val) return "—";
  return JAR_TYPE_LABELS[val] ?? val;
}

export function useVariantSelection(variants: Variant[]) {
  const [selectedJarType,    setSelectedJarType]    = useState<string | null>(null);
  const [selectedFragrance,  setSelectedFragrance]  = useState<string | null>(null);
  const [selectedColor,      setSelectedColor]      = useState<string | null>(null);
  const [selectedSize,       setSelectedSize]       = useState<string | null>(null);

  // ── Step 1: All unique jar types (primary axis) ───────────────────────────
  const jarTypes = useMemo(
    () => Array.from(new Set(variants.map(v => v.jarType).filter(Boolean))),
    [variants]
  );

  // ── Step 2: Fragrances available for selected jar type ────────────────────
  const availableFragrances = useMemo(() => {
    const pool = selectedJarType
      ? variants.filter(v => v.jarType === selectedJarType)
      : variants;
    return Array.from(new Set(pool.map(v => v.fragrance)));
  }, [variants, selectedJarType]);

  // ── Step 3: Colors for selected jar type + fragrance ─────────────────────
  const availableColors = useMemo(() => {
    const pool = variants.filter(v =>
      (!selectedJarType   || v.jarType   === selectedJarType) &&
      (!selectedFragrance || v.fragrance === selectedFragrance)
    );
    return Array.from(new Set(pool.map(v => v.color)));
  }, [variants, selectedJarType, selectedFragrance]);

  // ── Step 4: Sizes for selected jar type + fragrance + color ───────────────
  const availableSizes = useMemo(() => {
    const pool = variants.filter(v =>
      (!selectedJarType   || v.jarType   === selectedJarType)   &&
      (!selectedFragrance || v.fragrance === selectedFragrance) &&
      (!selectedColor     || v.color     === selectedColor)
    );
    return Array.from(new Set(pool.map(v => v.size))).filter(Boolean) as string[];
  }, [variants, selectedJarType, selectedFragrance, selectedColor]);

  // ── Resolved variant ───────────────────────────────────────────────────────
  const selectedVariant = useMemo(() => {
    return variants.find(v =>
      v.jarType   === selectedJarType   &&
      v.fragrance === selectedFragrance &&
      v.color     === selectedColor     &&
      (!v.size || v.size === selectedSize)
    ) ?? null;
  }, [variants, selectedJarType, selectedFragrance, selectedColor, selectedSize]);

  // ── Seed defaults on first load ────────────────────────────────────────────
  useEffect(() => {
    if (variants.length === 0) return;
    const firstJar = jarTypes[0] ?? null;
    setSelectedJarType(firstJar);
  }, [variants]);

  // ── When jar type changes → reset fragrance if no longer valid ───────────
  useEffect(() => {
    if (!selectedJarType) return;
    if (selectedFragrance && availableFragrances.includes(selectedFragrance)) return;
    setSelectedFragrance(availableFragrances[0] ?? null);
    setSelectedColor(null);
    setSelectedSize(null);
  }, [selectedJarType, availableFragrances]);

  // ── When fragrance changes → reset color if no longer valid ──────────────
  useEffect(() => {
    if (!selectedFragrance) return;
    if (selectedColor && availableColors.includes(selectedColor)) return;
    setSelectedColor(availableColors[0] ?? null);
    setSelectedSize(null);
  }, [selectedFragrance, availableColors]);

  // ── When color changes → reset size if no longer valid ────────────────────
  useEffect(() => {
    if (!selectedColor) return;
    if (selectedSize && availableSizes.includes(selectedSize)) return;
    setSelectedSize(availableSizes[0] ?? null);
  }, [selectedColor, availableSizes]);

  return {
    jarTypes,
    availableFragrances,
    availableColors,
    availableSizes,
    selectedJarType,    setSelectedJarType,
    selectedFragrance,  setSelectedFragrance,
    selectedColor,      setSelectedColor,
    selectedSize,       setSelectedSize,
    selectedVariant,
  } as const;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  onChange,
  showSize,
}) => {
  const {
    jarTypes,
    availableFragrances,
    availableColors,
    availableSizes,
    selectedJarType,    setSelectedJarType,
    selectedFragrance,  setSelectedFragrance,
    selectedColor,      setSelectedColor,
    selectedSize,       setSelectedSize,
    selectedVariant,
  } = useVariantSelection(variants);

  useEffect(() => {
    onChange?.({
      jarType:   selectedJarType,
      fragrance: selectedFragrance,
      color:     selectedColor,
      size:      selectedSize,
      variant:   selectedVariant,
    });
  }, [selectedJarType, selectedFragrance, selectedColor, selectedSize, selectedVariant]);

  return (
    <View style={styles.container}>

      {/* ── JAR TYPE (primary) ────────────────────────────────────────────── */}
      {jarTypes.length > 1 && (
        <>
          <Text style={styles.label}>Type</Text>
          <View style={styles.row}>
            {jarTypes.map(jt => (
              <Pressable
                key={jt}
                style={[styles.card, selectedJarType === jt && styles.cardActive]}
                onPress={() => setSelectedJarType(jt)}
              >
                <Text style={[styles.cardText, selectedJarType === jt && styles.cardTextActive]}>
                  {jarLabel(jt)}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── FRAGRANCE (secondary) ─────────────────────────────────────────── */}
      {selectedJarType && availableFragrances.length > 1 && (
        <>
          <Text style={styles.label}>Fragrance</Text>
          <View style={styles.row}>
            {availableFragrances.map(f => (
              <Pressable
                key={f}
                style={[styles.pill, selectedFragrance === f && styles.pillActive]}
                onPress={() => setSelectedFragrance(f)}
              >
                <Text style={[styles.pillText, selectedFragrance === f && styles.pillTextActive]}>
                  {f}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── COLOR ─────────────────────────────────────────────────────────── */}
      {selectedFragrance && availableColors.length > 1 && (
        <>
          <Text style={styles.label}>Color</Text>
          <View style={styles.row}>
            {availableColors.map(c => (
              <Pressable
                key={c}
                style={[styles.card, selectedColor === c && styles.cardActive]}
                onPress={() => setSelectedColor(c)}
              >
                <Text style={[styles.cardText, selectedColor === c && styles.cardTextActive]}>
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── SIZE ──────────────────────────────────────────────────────────── */}
      {showSize && selectedColor && availableSizes.length > 1 && (
        <>
          <Text style={styles.label}>Size</Text>
          <View style={styles.row}>
            {availableSizes.map(s => (
              <Pressable
                key={s}
                style={[styles.pill, selectedSize === s && styles.pillActive]}
                onPress={() => setSelectedSize(s)}
              >
                <Text style={[styles.pillText, selectedSize === s && styles.pillTextActive]}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── SUMMARY ───────────────────────────────────────────────────────── */}
      {selectedJarType && selectedColor && (
        <View style={styles.selectionSummary}>
          <Text style={styles.summaryText}>
            Selected:{" "}
            <Text style={styles.highlight}>{jarLabel(selectedJarType)}</Text>
            {selectedFragrance ? (
              <> · <Text style={styles.highlight}>{selectedFragrance}</Text></>
            ) : null}
            {selectedColor ? (
              <> · <Text style={styles.highlight}>{selectedColor}</Text></>
            ) : null}
            {selectedSize ? (
              <> · <Text style={styles.highlight}>{selectedSize}</Text></>
            ) : null}
          </Text>
        </View>
      )}

      {/* ── STOCK ─────────────────────────────────────────────────────────── */}
      {selectedVariant && (
        <View style={styles.stockRow}>
          <View
            style={[
              styles.stockDot,
              { backgroundColor: selectedVariant.stock > 0 ? "#4ADE80" : "#F87171" },
            ]}
          />
          <Text style={styles.meta}>
            {selectedVariant.stock > 0
              ? `In stock: ${selectedVariant.stock} units`
              : "Currently out of stock"}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  pillActive: { borderColor: "#111", backgroundColor: "#111" },
  pillText: { fontSize: 14, color: "#444" },
  pillTextActive: { color: "#fff", fontWeight: "600" },
  card: {
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  cardActive: { borderColor: "#111", backgroundColor: "#fff", borderWidth: 2 },
  cardText: { fontSize: 14, color: "#444" },
  cardTextActive: { color: "#111", fontWeight: "700" },
  selectionSummary: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#111",
  },
  summaryText: { fontSize: 14, color: "#374151", lineHeight: 20 },
  highlight: { fontWeight: "800", color: "#000" },
  stockRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  meta: { fontSize: 13, color: "#666" },
});

// import React, { useMemo, useState, useEffect } from "react";
// import { View, Text, Pressable, StyleSheet } from "react-native";

// export type Variant = {
//   id: string;
//   fragrance: string;
//   color: string;
//   price: number;
//   stock: number;
// };

// export type VariantSelectorValue = {
//   fragrance: string | null;
//   color: string | null;
//   variant: Variant | null;
// };

// export function useVariantSelection(variants: Variant[]) {
//   const [selectedFragrance, setSelectedFragrance] = useState<string | null>(null);
//   const [selectedColor, setSelectedColor] = useState<string | null>(null);

//   const fragrances = useMemo(
//     () => Array.from(new Set(variants.map(v => v.fragrance))),
//     [variants]
//   );

//   const colorsForFragrance = useMemo(() => {
//     if (!selectedFragrance) return [];
//     return Array.from(
//       new Set(variants.filter(v => v.fragrance === selectedFragrance).map(v => v.color))
//     );
//   }, [variants, selectedFragrance]);

//   const selectedVariant = useMemo(() => {
//     if (!selectedFragrance || !selectedColor) return null;
//     return (
//       variants.find(v => v.fragrance === selectedFragrance && v.color === selectedColor) || null
//     );
//   }, [variants, selectedFragrance, selectedColor]);

//   useEffect(() => {
//     if (!selectedFragrance && fragrances.length) {
//       setSelectedFragrance(fragrances[0]);
//     }
//   }, [fragrances]);

//   useEffect(() => {
//     if (selectedFragrance && colorsForFragrance.length) {
//       if (!selectedColor || !colorsForFragrance.includes(selectedColor)) {
//         setSelectedColor(colorsForFragrance[0]);
//       }
//     }
//   }, [selectedFragrance, colorsForFragrance]);

//   return {
//     fragrances,
//     colorsForFragrance,
//     selectedFragrance,
//     setSelectedFragrance,
//     selectedColor,
//     setSelectedColor,
//     selectedVariant,
//   } as const;
// }

// export const VariantSelector: React.FC<{
//   variants: Variant[];
//   onChange?: (v: VariantSelectorValue) => void;
// }> = ({ variants, onChange }) => {
//   const {
//     fragrances,
//     colorsForFragrance,
//     selectedFragrance,
//     setSelectedFragrance,
//     selectedColor,
//     setSelectedColor,
//     selectedVariant,
//   } = useVariantSelection(variants);

//   useEffect(() => {
//     onChange?.({
//       fragrance: selectedFragrance,
//       color: selectedColor,
//       variant: selectedVariant,
//     });
//   }, [selectedFragrance, selectedColor, selectedVariant]);

//   return (
//     <View style={styles.container}>
//       {/* Fragrance */}
//       <Text style={styles.label}>Fragrance</Text>
//       <View style={styles.row}>
//         {fragrances.map((f) => (
//           <Pressable
//             key={f}
//             style={[
//               styles.pill,
//               selectedFragrance === f && styles.pillActive,
//             ]}
//             onPress={() => setSelectedFragrance(f)}
//           >
//             <Text
//               style={[
//                 styles.pillText,
//                 selectedFragrance === f && styles.pillTextActive,
//               ]}
//             >
//               {f}
//             </Text>
//           </Pressable>
//         ))}
//       </View>

//       {/* Color */}
//       <Text style={styles.label}>Color</Text>
//       <View style={styles.row}>
//         {colorsForFragrance.map((c) => (
//           <Pressable
//             key={c}
//             style={[
//               styles.card,
//               selectedColor === c && styles.cardActive,
//             ]}
//             onPress={() => setSelectedColor(c)}
//           >
//             <Text
//               style={[
//                 styles.cardText,
//                 selectedColor === c && styles.cardTextActive,
//               ]}
//             >
//               {c}
//             </Text>
//           </Pressable>
//         ))}
//       </View>

//       {selectedVariant && (
//         <Text style={styles.meta}>
//           {selectedVariant.stock > 0
//             ? `In stock: ${selectedVariant.stock}`
//             : "Out of stock"}
//         </Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { gap: 12 },

//   label: {
//     fontSize: 14,
//     fontWeight: "600",
//   },

//   row: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//   },

//   pill: {
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 999,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     backgroundColor: "#fff",
//   },

//   pillActive: {
//     borderColor: "#111827",
//     backgroundColor: "#111827",
//   },

//   pillText: {
//     fontSize: 14,
//     color: "#111827",
//   },

//   pillTextActive: {
//     color: "#fff",
//     fontWeight: "600",
//   },

//   card: {
//     minWidth: 72,
//     paddingVertical: 12,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },

//   cardActive: {
//     borderColor: "#111827",
//     backgroundColor: "#F9FAFB",
//   },

//   cardText: {
//     fontSize: 14,
//     color: "#111827",
//   },

//   cardTextActive: {
//     fontWeight: "600",
//   },

//   meta: {
//     marginTop: 4,
//     fontSize: 13,
//     color: "#444",
//   },
// });



import React, { useMemo, useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export type Variant = {
  id: string;
  fragrance: string;
  color: string;
  size?: string | null;
  price: number;
  stock: number;
};

export type VariantSelectorValue = {
  fragrance: string | null;
  color: string | null;
  size?: string | null;
  variant: Variant | null;
};

interface VariantSelectorProps {
  variants: Variant[];
  onChange?: (v: VariantSelectorValue) => void;
  showSize?: boolean;
}

export function useVariantSelection(variants: Variant[]) {
  const [selectedFragrance, setSelectedFragrance] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // 1. Independent Options: Pull all unique choices from the entire product family
  const fragrances = useMemo(() => 
    Array.from(new Set(variants.map(v => v.fragrance))), [variants]
  );

  const allColors = useMemo(() => 
    Array.from(new Set(variants.map(v => v.color))), [variants]
  );

  const allSizes = useMemo(() => 
    Array.from(new Set(variants.map(v => v.size))).filter(Boolean) as string[], [variants]
  );

  // 2. The Selection Logic: Find a match for the current combination
  const selectedVariant = useMemo(() => {
    return variants.find(v => 
      v.fragrance === selectedFragrance && 
      v.color === selectedColor && 
      (!v.size || v.size === selectedSize)
    ) || null;
  }, [variants, selectedFragrance, selectedColor, selectedSize]);

  // 3. Persistent Defaults: Only run once when the component loads
  useEffect(() => {
    if (variants.length > 0) {
      if (!selectedFragrance) setSelectedFragrance(fragrances[0]);
      if (!selectedColor) setSelectedColor(allColors[0]);
      if (!selectedSize) setSelectedSize(allSizes[0]);
    }
  }, [variants]);

  // 4. Persistence Guard: When color/fragrance changes, check if the CURRENT size is still valid.
  // If the current size (e.g. 200ml) exists in the new color, DO NOTHING.
  // If it doesn't exist, only then fallback to a size that does exist.
  useEffect(() => {
    if (selectedColor && selectedFragrance) {
      const validSizesForThisColor = variants
        .filter(v => v.fragrance === selectedFragrance && v.color === selectedColor)
        .map(v => v.size);

      if (selectedSize && !validSizesForThisColor.includes(selectedSize)) {
        // Only reset if 200ml isn't available in the new color
        setSelectedSize(validSizesForThisColor[0] || null);
      }
    }
  }, [selectedColor, selectedFragrance]);

  return {
    fragrances,
    allColors,
    allSizes,
    selectedFragrance,
    setSelectedFragrance,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    selectedVariant,
  } as const;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({ 
  variants, 
  onChange, 
  showSize 
}) => {
  const {
    fragrances,
    allColors,
    allSizes,
    selectedFragrance,
    setSelectedFragrance,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    selectedVariant,
  } = useVariantSelection(variants);

  useEffect(() => {
    onChange?.({
      fragrance: selectedFragrance,
      color: selectedColor,
      size: selectedSize,
      variant: selectedVariant,
    });
  }, [selectedFragrance, selectedColor, selectedSize, selectedVariant]);

  return (
    <View style={styles.container}>
      {/* Fragrance */}
      <Text style={styles.label}>Fragrance</Text>
      <View style={styles.row}>
        {fragrances.map((f) => (
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

      {/* Color */}
      <Text style={styles.label}>Color</Text>
      <View style={styles.row}>
        {allColors.map((c) => (
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

      {/* Size */}
      {showSize && allSizes.length > 0 && (
        <>
          <Text style={styles.label}>Size</Text>
          <View style={styles.row}>
            {allSizes.map((s) => (
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

      {/* Selection Summary Text */}
      {(selectedColor || selectedSize) && (
        <View style={styles.selectionSummary}>
           <Text style={styles.summaryText}>
            Now you have selected <Text style={styles.highlight}>{selectedSize || 'Standard'}</Text> with the <Text style={styles.highlight}>{selectedColor}</Text> color
           </Text>
        </View>
      )}

      {selectedVariant && (
        <View style={styles.stockRow}>
           <View style={[styles.stockDot, { backgroundColor: selectedVariant.stock > 0 ? '#4ADE80' : '#F87171' }]} />
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
  label: { fontSize: 14, fontWeight: "700", color: '#111', textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#fff" },
  pillActive: { borderColor: "#111", backgroundColor: "#111" },
  pillText: { fontSize: 14, color: "#444" },
  pillTextActive: { color: "#fff", fontWeight: "600" },
  card: { minWidth: 80, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", backgroundColor: "#fff" },
  cardActive: { borderColor: "#111", backgroundColor: "#fff", borderWidth: 2 },
  cardText: { fontSize: 14, color: "#444" },
  cardTextActive: { color: "#111", fontWeight: "700" },
  selectionSummary: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, marginTop: 8, borderLeftWidth: 4, borderLeftColor: '#111' },
  summaryText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  highlight: { fontWeight: '800', color: '#000' },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  meta: { fontSize: 13, color: "#666" },
});
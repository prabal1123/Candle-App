// components/VariantSelector.tsx
import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from "react-native";

export type Variant = {
  id: string; // unique per variant (e.g., SKU)
  fragrance: string; // e.g., "Lavender"
  color: string; // e.g., "Purple"
  price: number;
  stock: number; // 0 means out of stock
  imageUrl?: string;
};

export type VariantSelectorValue = {
  fragrance: string | null;
  color: string | null;
  variant: Variant | null;
};

export function useVariantSelection(variants: Variant[]) {
  const [selectedFragrance, setSelectedFragrance] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const fragrances = useMemo(
    () => Array.from(new Set(variants.map(v => v.fragrance))),
    [variants]
  );

  const colorsForFragrance = useMemo(() => {
    if (!selectedFragrance) return [] as string[];
    return Array.from(
      new Set(
        variants
          .filter(v => v.fragrance === selectedFragrance)
          .map(v => v.color)
      )
    );
  }, [variants, selectedFragrance]);

  const selectedVariant: Variant | null = useMemo(() => {
    if (!selectedFragrance || !selectedColor) return null;
    return (
      variants.find(
        v => v.fragrance === selectedFragrance && v.color === selectedColor
      ) || null
    );
  }, [variants, selectedFragrance, selectedColor]);

  // auto-select sensible defaults
  React.useEffect(() => {
    if (!selectedFragrance && fragrances.length > 0) {
      setSelectedFragrance(fragrances[0]);
    }
  }, [fragrances, selectedFragrance]);

  React.useEffect(() => {
    if (selectedFragrance && colorsForFragrance.length > 0) {
      if (!selectedColor || !colorsForFragrance.includes(selectedColor)) {
        setSelectedColor(colorsForFragrance[0]);
      }
    } else {
      setSelectedColor(null);
    }
  }, [selectedFragrance, colorsForFragrance]);

  return {
    fragrances,
    colorsForFragrance,
    selectedFragrance,
    setSelectedFragrance,
    selectedColor,
    setSelectedColor,
    selectedVariant,
  } as const;
}

// Simple dropdown using Modal (no external deps)
type DropdownProps = {
  label: string;
  value: string | null;
  options: string[];
  onChange: (val: string) => void;
  disabled?: boolean;
};

const Dropdown: React.FC<DropdownProps> = ({ label, value, options, onChange, disabled }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.dropdownWrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        style={[styles.trigger, disabled && styles.disabled]}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.valueText}>{value ?? `Select ${label.toLowerCase()}`}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{label}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={styles.option}
                onPress={() => {
                  onChange(item);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{item}</Text>
              </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.empty}>No options</Text>}
          />
        </View>
      </Modal>
    </View>
  );
};

export const VariantSelector: React.FC<{ variants: Variant[]; onChange?: (v: VariantSelectorValue) => void; }>
= ({ variants, onChange }) => {
  const {
    fragrances,
    colorsForFragrance,
    selectedFragrance,
    setSelectedFragrance,
    selectedColor,
    setSelectedColor,
    selectedVariant,
  } = useVariantSelection(variants);

  React.useEffect(() => {
    onChange?.({
      fragrance: selectedFragrance,
      color: selectedColor,
      variant: selectedVariant,
    });
  }, [selectedFragrance, selectedColor, selectedVariant]);

  return (
    <View style={styles.container}>
      <Dropdown
        label="Fragrance"
        value={selectedFragrance}
        options={fragrances}
        onChange={setSelectedFragrance}
      />
      <Dropdown
        label="Color"
        value={selectedColor}
        options={colorsForFragrance}
        onChange={setSelectedColor}
        disabled={!selectedFragrance}
      />

      {selectedVariant && (
        <View style={styles.meta}>
          <Text style={styles.metaText}>Price: ₹{selectedVariant.price.toFixed(2)}</Text>
          <Text style={styles.metaText}>
            {selectedVariant.stock > 0 ? `In stock: ${selectedVariant.stock}` : "Out of stock"}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 12 },
  dropdownWrap: { marginBottom: 12 },
  label: { fontSize: 14, opacity: 0.8, marginBottom: 6 },
  trigger: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  disabled: { opacity: 0.5 },
  valueText: { fontSize: 16 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  sheet: {
    position: "absolute",
    left: 16,
    right: 16,
    top: "30%",
    maxHeight: "60%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 6,
  },
  sheetTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  option: { paddingVertical: 12 },
  optionText: { fontSize: 16 },
  empty: { textAlign: "center", paddingVertical: 12, opacity: 0.6 },
  meta: { marginTop: 8 },
  metaText: { fontSize: 14 },
});

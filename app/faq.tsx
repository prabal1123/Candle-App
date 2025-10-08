// app/faq.tsx
import React, { useMemo, useState } from "react";
import { ScrollView, View, Text, TextInput, Pressable } from "react-native";
import { Stack } from "expo-router";

type QA = { q: string; a: string };
type Section = { title: string; items: QA[] };

const SECTIONS: Section[] = [
  {
    title: "Products",
    items: [
      {
        q: "What materials are your candles made from?",
        a: "Our candles use natural soy wax blends, lead-free cotton wicks, and IFRA-compliant fragrance oils.",
      },
      {
        q: "Are your candles eco-friendly?",
        a: "Yes. We prioritize recyclable packaging, sustainably sourced wax, and cruelty-free fragrances.",
      },
      {
        q: "How long do your candles typically burn?",
        a: "Burn times vary by size: minis ~12–15 hrs, standard jars ~35–45 hrs, and large jars ~55–65 hrs.",
      },
    ],
  },
  {
    title: "Shipping",
    items: [
      {
        q: "What are your shipping options?",
        a: "Standard (3–7 business days) and Express (1–3 business days) within India. Rates shown at checkout.",
      },
      {
        q: "How long does shipping usually take?",
        a: "Standard orders ship in 24–48 hrs; delivery in 3–7 business days depending on your location.",
      },
      {
        q: "Do you offer international shipping?",
        a: "International shipping is available to select regions. Duties/taxes may apply at delivery.",
      },
    ],
  },
  {
    title: "Returns",
    items: [
      {
        q: "What is your return policy?",
        a: "Unused items can be returned within 30 days of delivery for a refund or exchange (original packaging required).",
      },
      {
        q: "How do I initiate a return?",
        a: "Email support@happycandles.com with your order number and reason for return. We’ll share a prepaid label if eligible.",
      },
      {
        q: "Are there any items that cannot be returned?",
        a: "Custom/personalized items and used candles aren’t eligible unless defective on arrival.",
      },
    ],
  },
  {
    title: "Other",
    items: [
      {
        q: "How can I contact customer support?",
        a: "Reach us at support@happycandles.com or via the Help section in your account from 10:00–18:00 IST, Mon–Sat.",
      },
      {
        q: "Do you offer gift wrapping?",
        a: "Yes. Add gift wrapping at checkout and include a personal note at no extra cost.",
      },
      {
        q: "Can I customize my candle order?",
        a: "For bulk or custom scent/label requests, contact wholesale@happycandles.com.",
      },
    ],
  },
];

function AccordionItem({
  q,
  a,
  initiallyOpen = false,
}: {
  q: string;
  a: string;
  initiallyOpen?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#e5e0dc",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 7,
      }}
    >
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 8,
          gap: 12,
        }}
      >
        <Text style={{ color: "#181411", fontSize: 14, fontWeight: "600", flex: 1 }}>
          {q}
        </Text>
        <Text
          style={{
            color: "#181411",
            fontSize: 18,
            transform: [{ rotate: open ? "180deg" : "0deg" }],
          }}
          accessibilityLabel={open ? "Collapse" : "Expand"}
        >
          ˅
        </Text>
      </Pressable>
      {open ? (
        <Text style={{ color: "#887563", fontSize: 14, lineHeight: 20, paddingBottom: 6 }}>
          {a}
        </Text>
      ) : null}
    </View>
  );
}

export default function FAQ(): JSX.Element {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.map((sec) => ({
      ...sec,
      items: sec.items.filter(
        (it) =>
          it.q.toLowerCase().includes(q) ||
          it.a.toLowerCase().includes(q) ||
          sec.title.toLowerCase().includes(q)
      ),
    })).filter((sec) => sec.items.length > 0);
  }, [query]);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
      }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Uses your global header; just sets the title here */}
      <Stack.Screen options={{ title: "FAQ — Happy Candles" }} />

      <View style={{ maxWidth: 960, width: "100%", alignSelf: "center" }}>
        {/* Page Title */}
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <Text
            style={{
              color: "#181411",
              fontSize: 28,
              fontWeight: "700",
              letterSpacing: -0.3,
            }}
          >
            Frequently Asked Questions
          </Text>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <View
            style={{
              height: 48,
              borderRadius: 12,
              backgroundColor: "#f4f2f0",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ color: "#887563", fontSize: 18, marginRight: 6 }}>🔎</Text>
            <TextInput
              placeholder="Search for a question"
              placeholderTextColor="#887563"
              value={query}
              onChangeText={setQuery}
              style={{
                flex: 1,
                color: "#181411",
                fontSize: 16,
              }}
            />
          </View>
        </View>

        {/* Sections */}
        {filtered.map((section) => (
          <View key={section.title} style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            <Text
              style={{
                color: "#181411",
                fontSize: 22,
                fontWeight: "700",
                letterSpacing: -0.2,
                paddingHorizontal: 0,
                paddingBottom: 6,
                paddingTop: 8,
              }}
            >
              {section.title}
            </Text>

            <View style={{ gap: 12, paddingBottom: 12 }}>
              {section.items.map((item, idx) => (
                <AccordionItem key={`${section.title}-${idx}`} q={item.q} a={item.a} />
              ))}
            </View>
          </View>
        ))}

        {/* Empty state when search has no matches */}
        {filtered.length === 0 ? (
          <View style={{ padding: 16 }}>
            <Text style={{ color: "#887563", fontSize: 14 }}>
              No results. Try a different keyword.
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

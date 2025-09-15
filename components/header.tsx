// components/Header.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function Header() {
  return (
    <View style={{ height: 72, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link href="/" asChild>
        <Pressable>
          <Text style={{ fontWeight: '700', fontSize: 18 }}>Candle Co.</Text>
        </Pressable>
      </Link>

      <View style={{ flexDirection: 'row', gap: 18 }}>
        {/* Shop => routes to /shop (products dashboard) */}
        <Link href="/shop" asChild>
          <Pressable>
            <Text style={{ fontWeight: '600' }}>Shop</Text>
          </Pressable>
        </Link>

        <Link href="/about" asChild>
          <Pressable><Text>About</Text></Pressable>
        </Link>

        <Link href="/contact" asChild>
          <Pressable><Text>Contact</Text></Pressable>
        </Link>
      </View>
    </View>
  );
}

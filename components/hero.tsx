// components/Hero.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function Hero() {
  const router = useRouter();

  function goToShop() {
    router.push('/shop'); // navigates to products dashboard
  }

  return (
    <View style={{ height: 520, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 44, fontWeight: '800', color: '#fff' }}>Illuminate Your Moments</Text>
      <Text style={{ marginTop: 12, color: '#fff', textAlign: 'center' }}>Discover our exquisite collection...</Text>

      <Pressable onPress={goToShop} style={{ marginTop: 20, paddingVertical: 12, paddingHorizontal: 20, backgroundColor: '#F97316', borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Browse Collection</Text>
      </Pressable>
    </View>
  );
}

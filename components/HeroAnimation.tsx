import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Platform, View } from 'react-native';

export default function HeroAnimation() {
  // Create an animated value for the subtle glow flicker
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // A slow, organic breathing loop that mimics a real candle flame
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.9,
          duration: 3500,
          useNativeDriver: true, // Uses native thread for buttery smooth performance
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Base dark elegant vignette overlay */}
      <View style={styles.darkOverlay} />
      
      {/* Animated amber candlelight glow overlay */}
      <Animated.View 
        style={[
          styles.glowOverlay, 
          { opacity: glowAnim }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(24, 20, 17, 0.45)', // Adds a rich, moody contrast so text stays readable
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e28743', 
    opacity: 0.35,
    ...Platform.select({
      web: {
        // Creates a beautiful, premium ambient glow focused in the center behind your text
        background: 'radial-gradient(circle at center, rgba(226, 135, 67, 0.3) 0%, rgba(0,0,0,0) 75%)',
      }
    })
  },
});
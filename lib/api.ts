// lib/api.ts
import { Platform } from 'react-native';

// Replace with your laptop LAN IP discovered earlier
const LOCAL_IP = '192.168.1.5';
const DEV_PORT = 4242;

export const API_BASE =
  Platform.OS === 'android'
    ? `http://10.0.2.2:${DEV_PORT}` // Android emulator
    : Platform.OS === 'ios'
    ? `http://localhost:${DEV_PORT}` // iOS simulator
    : `http://${LOCAL_IP}:${DEV_PORT}`; // physical device or other

export const createUrl = (path: string) => `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;

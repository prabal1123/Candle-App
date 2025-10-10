// lib/guest.ts
import { Platform } from "react-native";

let inMemoryGuestId: string | null = null;

function makeUuid() {
  try { return crypto.randomUUID(); } catch {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export function getGuestIdSync(): string {
  if (inMemoryGuestId) return inMemoryGuestId;

  // Web (no RN Platform), use localStorage synchronously
  if (typeof window !== "undefined" && !(Platform as any)?.OS) {
    const existing = window.localStorage.getItem("guest_id");
    inMemoryGuestId = existing ?? makeUuid();
    if (!existing) window.localStorage.setItem("guest_id", inMemoryGuestId);
    return inMemoryGuestId;
  }

  // RN: generate now; we'll sync to AsyncStorage later
  inMemoryGuestId = makeUuid();
  return inMemoryGuestId;
}

export async function reconcileGuestIdAsync() {
  try {
    const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
    const stored = await AsyncStorage.getItem("guest_id");
    if (stored) {
      inMemoryGuestId = stored;
    } else if (inMemoryGuestId) {
      await AsyncStorage.setItem("guest_id", inMemoryGuestId);
    } else {
      inMemoryGuestId = makeUuid();
      await AsyncStorage.setItem("guest_id", inMemoryGuestId);
    }
  } catch {
    // ignore
  }
}

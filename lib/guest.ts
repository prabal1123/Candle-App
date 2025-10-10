// lib/guest.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getOrCreateGuestId(): Promise<string> {
  let guestId = await AsyncStorage.getItem("guest_id");
  if (!guestId) {
    guestId = crypto.randomUUID();
    await AsyncStorage.setItem("guest_id", guestId);
  }
  return guestId;
}

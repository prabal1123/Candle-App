// // components/Header.tsx
// import React from 'react';
// import { View, Text, Pressable } from 'react-native';
// import { Link } from 'expo-router';

// export default function Header() {
//   return (
//     <View style={{ height: 72, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
//       <Link href="/" asChild>
//         <Pressable>
//           <Text style={{ fontWeight: '700', fontSize: 18 }}>Candle Co.</Text>
//         </Pressable>
//       </Link>

//       <View style={{ flexDirection: 'row', gap: 18 }}>
//         {/* Shop => routes to /shop (products dashboard) */}
//         <Link href="/shop" asChild>
//           <Pressable>
//             <Text style={{ fontWeight: '600' }}>Shop</Text>
//           </Pressable>
//         </Link>

//         <Link href="/about" asChild>
//           <Pressable><Text>About</Text></Pressable>
//         </Link>

//         <Link href="/contact" asChild>
//           <Pressable><Text>Contact</Text></Pressable>
//         </Link>
//       </View>
//     </View>
//   );
// }


// components/header.tsx
import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Link } from "expo-router";

export default function Header() {
  return (
    <View
      style={{
        height: 64,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#f4f2f0",
        backgroundColor: "rgba(255,255,255,0.98)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Brand */}
      <Link href="/" asChild>
        <Pressable style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../assets/images/logo.png")}
            style={{ width: 36, height: 36, borderRadius: 6 }}
          />
          <Text style={{ marginLeft: 12, fontWeight: "700", fontSize: 16 }}>
            Candle Co.
          </Text>
        </Pressable>
      </Link>

      {/* Nav (REMOVE gap, use margins on children) */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Link href="/shop" asChild>
          <Pressable style={{ marginRight: 18 }}>
            <Text style={{ fontWeight: "600" }}>Shop</Text>
          </Pressable>
        </Link>

        <Link href="/about" asChild>
          <Pressable style={{ marginRight: 18 }}>
            <Text>About</Text>
          </Pressable>
        </Link>

        <Link href="/contact" asChild>
          <Pressable>
            <Text>Contact</Text>
          </Pressable>
        </Link>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable
          style={{
            height: 40,
            width: 40,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f4f2f0",
            marginRight: 10,
          }}
          accessibilityLabel="Search"
        >
          <Text>🔍</Text>
        </Pressable>

        <Link href="/cart" asChild>
          <Pressable
            style={{
              height: 40,
              width: 40,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f4f2f0",
            }}
            accessibilityLabel="Cart"
          >
            <Text>🛒</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

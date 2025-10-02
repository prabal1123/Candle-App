// components/Header.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { headerStyles } from "../styles/header";

export default function Header() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const [user, setUser] = useState<any | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const anim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // support different supabase SDK versions
        if (typeof supabase.auth.getUser === "function") {
          const resp = await supabase.auth.getUser();
          if (!mounted) return;
          setUser(resp?.data?.user ?? null);
        } else if (typeof supabase.auth.getSession === "function") {
          const sess = await supabase.auth.getSession();
          if (!mounted) return;
          setUser(sess?.data?.session?.user ?? null);
        } else if (typeof (supabase.auth as any).user === "function") {
          const u = (supabase.auth as any).user();
          if (!mounted) return;
          setUser(u ?? null);
        }
      } catch (e) {
        console.warn("[Header] getUser error:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleMenu = () => {
    const toValue = menuOpen ? 0 : 1;
    Animated.timing(anim, { toValue, duration: 210, useNativeDriver: false }).start();
    setMenuOpen((v) => !v);
  };

  // close menu when switching to desktop size
  useEffect(() => {
    if (!isMobile && menuOpen) {
      Animated.timing(anim, { toValue: 0, duration: 140, useNativeDriver: false }).start();
      setMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  const menuHeight = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 240] }); // increase if you add more items

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      router.replace("/auth/login");
    } catch (err) {
      console.warn("[Header] signOut error:", err);
    }
  }

  function goToProfile() {
    try {
      router.push("/account/profile");
    } catch (err) {
      if (typeof window !== "undefined") window.location.href = "/account/profile";
    }
  }

  const displayName =
    user?.user_metadata?.full_name || user?.email || "Account";
  const initials = (user?.user_metadata?.full_name ?? user?.email ?? "U")
    .split(" ")
    .map((s: string) => s[0] ?? "")
    .slice(0, 2)
    .join("");
  const avatarSource = user?.user_metadata?.avatar_url
    ? { uri: user.user_metadata.avatar_url }
    : {
        uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=fff&color=333&size=128`,
      };

  const handleNavAndClose = (href: string) => {
    if (isMobile) {
      Animated.timing(anim, { toValue: 0, duration: 140, useNativeDriver: false }).start(() => {
        setMenuOpen(false);
        router.push(href);
      });
    } else {
      router.push(href);
    }
  };

  return (
    <View style={headerStyles.headerRoot}>
      <View style={headerStyles.headerInner}>
        {/* brand */}
        <Pressable style={headerStyles.brandBtn} onPress={() => router.push("/")}>
          <Image source={require("../assets/images/logo.png")} style={headerStyles.logo} />
          <Text style={headerStyles.brandText}>Happy Candles</Text>
        </Pressable>

        {/* desktop nav */}
        {!isMobile && (
          <View style={headerStyles.nav}>
            <Pressable style={headerStyles.navItem} onPress={() => router.push("/product")}>
              <Text style={headerStyles.navText}>Shop</Text>
            </Pressable>
            <Pressable style={headerStyles.navItem} onPress={() => router.push("/about")}>
              <Text style={headerStyles.navText}>About</Text>
            </Pressable>
            <Pressable style={headerStyles.navItem} onPress={() => router.push("/contact")}>
              <Text style={headerStyles.navText}>Contact</Text>
            </Pressable>
          </View>
        )}

        {/* actions */}
        <View style={headerStyles.actions}>
          {!isMobile ? (
            <>
              {/* search removed */}
              <Pressable accessibilityLabel="Cart" style={headerStyles.iconBtn} onPress={() => router.push("/cart")}>
                <Text>🛒</Text>
              </Pressable>

              <Pressable
                onPress={goToProfile}
                accessibilityLabel="Account"
                style={headerStyles.profileTrigger}
              >
                <Image source={avatarSource as any} style={headerStyles.avatar} />
              </Pressable>
            </>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* mobile: cart beside hamburger */}
              <Pressable onPress={() => router.push("/cart")} style={headerStyles.iconBtn}>
                <Text>🛒</Text>
              </Pressable>
              <Pressable onPress={toggleMenu} style={headerStyles.hamburger}>
                <View style={[headerStyles.hLine, menuOpen && headerStyles.hLineTopOpen]} />
                <View style={[headerStyles.hLine, menuOpen && headerStyles.hLineMidOpen]} />
                <View style={[headerStyles.hLine, menuOpen && headerStyles.hLineBottomOpen]} />
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* mobile slide-down menu */}
      {isMobile && (
        <Animated.View style={[headerStyles.mobileMenu, { height: menuHeight, overflow: "hidden" }]}>
          <View style={headerStyles.mobileMenuInner}>

            {/* Profile heading + details */}
            <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#444", marginBottom: 8 }}>
                Profile
              </Text>

              <Pressable
                onPress={() => {
                  setMenuOpen(false);
                  goToProfile();
                }}
                style={headerStyles.mobileProfileHeader}
              >
                <Image source={avatarSource as any} style={headerStyles.mobileProfileAvatar} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={headerStyles.mobileProfileName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  {user?.email ? (
                    <Text style={headerStyles.mobileProfileEmail} numberOfLines={1}>
                      {user.email}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            </View>

            <View style={headerStyles.mobileMenuDivider} />

            <Pressable onPress={() => handleNavAndClose("/product")} style={headerStyles.mobileMenuItem}>
              <Text style={headerStyles.mobileMenuText}>Shop</Text>
            </Pressable>
            <Pressable onPress={() => handleNavAndClose("/about")} style={headerStyles.mobileMenuItem}>
              <Text style={headerStyles.mobileMenuText}>About</Text>
            </Pressable>
            <Pressable onPress={() => handleNavAndClose("/contact")} style={headerStyles.mobileMenuItem}>
              <Text style={headerStyles.mobileMenuText}>Contact</Text>
            </Pressable>

            <View style={headerStyles.mobileMenuDivider} />

            <Pressable onPress={() => handleNavAndClose("/cart")} style={headerStyles.mobileMenuItem}>
              <Text style={headerStyles.mobileMenuText}>Cart</Text>
            </Pressable>

            <View style={headerStyles.mobileMenuDivider} />

            <Pressable
              onPress={() => {
                setMenuOpen(false);
                handleSignOut();
              }}
              style={headerStyles.mobileMenuItem}
            >
              <Text style={[headerStyles.mobileMenuText, { color: "#ef4444", fontWeight: "700" }]}>
                Sign out
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

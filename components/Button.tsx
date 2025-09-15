// // components/ui/Button.tsx
// import React from "react";
// import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
// import { Theme } from "@/styles/theme";

// type Variant = "primary" | "secondary" | "ghost";

// type Props = {
//   children: React.ReactNode;
//   onPress?: () => void;
//   disabled?: boolean;
//   variant?: Variant;
//   style?: ViewStyle;
//   testID?: string;
//   accessibilityLabel?: string;
// };

// export default function Button({
//   children,
//   onPress,
//   disabled = false,
//   variant = "primary",
//   style,
//   testID,
//   accessibilityLabel,
// }: Props) {
//   const containerStyle = [
//     styles.base,
//     variant === "primary" && styles.primary,
//     variant === "secondary" && styles.secondary,
//     variant === "ghost" && styles.ghost,
//     disabled && styles.disabled,
//     style,
//   ];

//   const textStyle = [
//     styles.textBase,
//     variant === "ghost" ? styles.textGhost : styles.textSolid,
//     disabled && styles.textDisabled,
//   ];

//   return (
//     <Pressable
//       accessibilityRole="button"
//       accessibilityState={{ disabled }}
//       accessibilityLabel={accessibilityLabel}
//       onPress={disabled ? undefined : onPress}
//       style={containerStyle}
//       testID={testID}
//       android_ripple={{ color: "#00000010" }}
//     >
//       <Text style={textStyle}>{children}</Text>
//     </Pressable>
//   );
// }

// const styles = StyleSheet.create({
//   base: {
//     paddingVertical: Theme.spacing.md,
//     paddingHorizontal: Theme.spacing.lg,
//     borderRadius: Theme.radius.lg,
//     alignItems: "center",
//     justifyContent: "center",
//     minHeight: 44,
//   },
//   primary: {
//     backgroundColor: Theme.colors.primary,
//   },
//   secondary: {
//     backgroundColor: "#F3F3F3",
//     borderWidth: 1,
//     borderColor: Theme.colors.border,
//   },
//   ghost: {
//     backgroundColor: "transparent",
//   },
//   disabled: {
//     backgroundColor: Theme.colors.disabled,
//   },
//   textBase: {
//     fontSize: Theme.fontSize.base,
//     fontWeight: "700",
//   },
//   textSolid: {
//     color: Theme.colors.white,
//   },
//   textGhost: {
//     color: Theme.colors.primary,
//   },
//   textDisabled: {
//     color: "#777777",
//   },
// });

import React, { forwardRef, memo } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  GestureResponderEvent,
  PressableProps,
} from "react-native";
import { Theme } from "@/styles/theme";

type Variant = "primary" | "secondary" | "ghost";

export type ButtonProps = {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
  accessibilityLabel?: string;
  hitSlop?: { top?: number; bottom?: number; left?: number; right?: number };
} & Omit<PressableProps, "style">;

const Button = forwardRef<any, ButtonProps>(
  (
    {
      children,
      onPress,
      disabled = false,
      variant = "primary",
      style,
      textStyle,
      testID,
      accessibilityLabel,
      hitSlop,
      ...rest
    },
    ref
  ) => {
    const containerStyles = [
      styles.base,
      variant === "primary" && styles.primary,
      variant === "secondary" && styles.secondary,
      variant === "ghost" && styles.ghost,
      disabled && styles.disabled,
      style,
    ];

    const labelStyles = [
      styles.textBase,
      variant === "ghost" ? styles.textGhost : styles.textSolid,
      disabled && styles.textDisabled,
      textStyle,
    ];

    return (
      <Pressable
        ref={ref}
        onPress={disabled ? undefined : onPress}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={containerStyles}
        android_ripple={{ color: "#00000010" }}
        hitSlop={hitSlop}
        disabled={disabled}
        {...rest}
      >
        <Text style={labelStyles}>{children}</Text>
      </Pressable>
    );
  }
);

Button.displayName = "Button";

export default memo(Button);

const styles = StyleSheet.create({
  base: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  primary: {
    backgroundColor: Theme.colors.primary,
  },
  secondary: {
    backgroundColor: "#F3F3F3",
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    backgroundColor: Theme.colors.disabled,
  },
  textBase: {
    fontSize: Theme.fontSize.base,
    fontWeight: "700",
  },
  textSolid: {
    color: Theme.colors.white,
  },
  textGhost: {
    color: Theme.colors.primary,
  },
  textDisabled: {
    color: "#777777",
  },
});

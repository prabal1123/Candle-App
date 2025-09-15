// components/ui/Input.tsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Theme } from "@/styles/theme";

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string | null;
  containerStyle?: ViewStyle;
  inputProps?: TextInputProps;
};

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  containerStyle,
  inputProps,
}: Props) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={inputProps?.keyboardType}
        importantForAutofill={Platform.OS === "android" ? "yes" : "auto"}
        style={[styles.input]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontSize: Theme.fontSize.label,
    color: Theme.colors.bodyText,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    fontSize: Theme.fontSize.base,
    color: Theme.colors.text,
    backgroundColor: Theme.colors.background,
  },
  error: {
    marginTop: 8,
    color: "#C0392B",
    fontSize: 13,
  },
});

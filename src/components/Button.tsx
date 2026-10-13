import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";

import { colors } from "../constants/theme";

type ButtonProps = {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function Button({ title, onPress, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.brand,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
});
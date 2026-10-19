import { useEffect, useMemo, useRef } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/theme";

export type SortOption<T extends string> = {
  id: T;
  title: string;
  hint: string;
};

type SortSheetProps<T extends string> = {
  options: readonly SortOption<T>[];
  value: T;
  onChange: (value: T) => void;
  onClose: () => void;
};

// Dark bottom sheet for picking the rewards sort order. Sits above the tab bar.
export default function SortSheet<T extends string>({
  options,
  value,
  onChange,
  onClose,
}: SortSheetProps<T>) {
  const slide = useRef(new Animated.Value(500)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 14 }),
    ]).start();
  }, [fade, slide]);

  // Slide down and fade out, then tell the parent to unmount the sheet.
  const close = () => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 500, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  // Drag the handle/header down to dismiss; let go early and it springs back.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
        onPanResponderMove: (_, g) => {
          slide.setValue(Math.max(g.dy, 0));
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > 120 || g.vy > 0.8) {
            close();
          } else {
            Animated.spring(slide, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 0,
              speed: 16,
            }).start();
          }
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slide]
  );

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={close}
          style={styles.fill}
        />
      </Animated.View>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slide }] }]}>
        <View {...panResponder.panHandlers} style={styles.dragArea}>
          <View style={styles.handle} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Sort</Text>
          <Pressable
            accessibilityRole="button"
            onPress={close}
            style={({ pressed }) => [styles.done, pressed && styles.pressed]}
          >
            <Text style={styles.doneLabel}>Done</Text>
          </Pressable>
        </View>

        <View style={styles.options}>
          {options.map((option) => {
            const active = option.id === value;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => onChange(option.id)}
                style={({ pressed }) => [
                  styles.option,
                  active && styles.optionActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={[styles.optionHint, active && styles.optionHintActive]}>
                  {option.hint}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  fill: {
    flex: 1,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  sheet: {
    paddingHorizontal: 23,
    paddingBottom: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    // Slightly see-through, like the mockup.
    backgroundColor: "rgba(38, 38, 38, 0.92)",
  },
  dragArea: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 10,
    marginHorizontal: -23,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.white,
  },
  done: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  doneLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.black,
  },
  options: {
    gap: 14,
  },
  option: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  optionActive: {
    backgroundColor: colors.brand,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: colors.ink,
  },
  optionHint: {
    marginTop: 6,
    fontSize: 15,
    color: colors.muted,
  },
  optionHintActive: {
    color: colors.ink,
  },
  pressed: {
    opacity: 0.85,
  },
});
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/theme";
import LocationPin from "../LocationPin";

// "Validating your visit..." loading state, shown after "Validate now".
export default function ValidatingVisit() {
  const pulse = useRef(new Animated.Value(0)).current;
  const [dots, setDots] = useState(2);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    const timer = setInterval(() => setDots((value) => (value % 3) + 1), 400);

    return () => {
      loop.stop();
      clearInterval(timer);
    };
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] });

  return (
    <View style={styles.screen} accessibilityLabel="Validating your visit">
      <StatusBar style="dark" />

      <Animated.View style={[styles.ring, { transform: [{ scale }], opacity }]}>
        <LocationPin width={62} height={97} />
      </Animated.View>

      <Text style={styles.heading}>VALIDATING</Text>
      <Text style={styles.subheading}>
        YOUR <Text style={styles.accent}>VISIT{".".repeat(dots)}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 23,
    paddingTop: 80,
    backgroundColor: colors.white,
  },
  ring: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: "rgba(92, 225, 230, 0.5)",
  },
  heading: {
    marginTop: 44,
    fontSize: 44,
    lineHeight: 46,
    fontWeight: "900",
    letterSpacing: -1,
    color: colors.ink,
  },
  subheading: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: colors.ink,
  },
  accent: {
    color: colors.brand,
  },
});
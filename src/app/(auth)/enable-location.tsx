import * as Location from "expo-location";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

import Button from "../../components/Button";
import { colors } from "../../constants/theme";

function LocationPin() {
  return (
    <Svg width={84} height={132} viewBox="0 0 60 94">
      <Defs>
        <LinearGradient id="pinGradient" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#54EEDE" />
          <Stop offset="1" stopColor="#2584CB" />
        </LinearGradient>
      </Defs>

      <Path
        d="M30 94 C30 94 0 58 0 30 A30 30 0 1 1 60 30 C60 58 30 94 30 94 Z"
        fill="url(#pinGradient)"
      />
      <Circle cx={30} cy={34} r={12} fill={colors.white} />
      <Circle cx={30} cy={78} r={4} fill={colors.white} />
    </Svg>
  );
}

export default function EnableLocation() {
  const router = useRouter();

  // New users see this right after sign up and can skip it ("Maybe Later").
  // From Explore -> View Map (location still off) it is required: no skip button.
  const { required, placeId } = useLocalSearchParams<{ required?: string; placeId?: string }>();
  const isRequired = required === "1";

  const [requesting, setRequesting] = useState(false);

  const onEnabled = () => {
    if (isRequired && placeId) {
      // Came from "Validate Visit": go back to that landmark with the route map open.
      router.dismissTo({ pathname: "/detail", params: { id: placeId, route: "1" } });
      return;
    }

    if (isRequired) {
      // Location is on now: go back to Explore and open its map section.
      router.dismissTo({ pathname: "/explore", params: { map: "1" } });
      return;
    }

    router.replace("/explore");
  };

  const onSkip = () => {
    router.replace("/explore");
  };

  const onEnable = async () => {
    if (requesting) return;
    setRequesting(true);

    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      console.log("Location permission:", status);

      if (status === "granted") {
        onEnabled();
        return;
      }

      if (!canAskAgain) {
        Alert.alert(
          "Location is turned off",
          "Turn on location access for WAYR in your phone settings to see nearby Landmarks.",
          [
            { text: "Not now", style: "cancel" },
            { text: "Open settings", onPress: () => Linking.openSettings() },
          ]
        );
      }
    } finally {
      setRequesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ gestureEnabled: !isRequired }} />
      <StatusBar style="dark" />

      <View style={styles.body}>
        <View style={styles.pin}>
          <LocationPin />
        </View>

        <Text style={styles.heading}>ENABLE</Text>
        <Text style={styles.subheading}>
          YOUR <Text style={styles.accent}>LOCATION</Text>
        </Text>
        <Text style={styles.description}>
          WAYR needs your location to show nearby Landmarks and validate your visits when
          you explore.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button title="Enable Location" onPress={onEnable} style={styles.primary} />

        {isRequired ? null : (
          <Pressable
            accessibilityRole="button"
            onPress={onSkip}
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryLabel}>Maybe Later</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 23,
    paddingBottom: 28,
  },
  pin: {
    marginBottom: 30,
  },
  heading: {
    fontSize: 54,
    lineHeight: 54,
    fontWeight: "900",
    letterSpacing: -1,
    textAlign: "center",
    color: colors.ink,
  },
  subheading: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
    color: colors.ink,
  },
  accent: {
    color: colors.brand,
  },
  description: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
  footer: {
    paddingHorizontal: 23,
    paddingBottom: 24,
  },
  primary: {
    height: 49,
    borderRadius: 12,
  },
  secondary: {
    height: 45,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  pressed: {
    opacity: 0.7,
  },
  secondaryLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.brand,
  },
});
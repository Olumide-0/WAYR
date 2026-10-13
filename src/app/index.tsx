import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

import SplashBackground from "../components/SplashBackground";
import { colors } from "../constants/theme";

const SPLASH_DURATION_MS = 2000;

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <SplashBackground />

      <Image
        source={require("../../assets/images/WAYR_Main_Horizontal 1.png")}
        resizeMode="contain"
        style={styles.logo}
        accessibilityLabel="WAYR"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.splash,
  },
  logo: {
    width: 220,
    height: 100,
  },
});
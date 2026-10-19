import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  ChevronRight,
  CircleHelp,
  Info,
  LucideIcon,
  ShieldCheck,
} from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";

type SettingsItem = {
  id: string;
  title: string;
  icon: LucideIcon;
};

// TODO: each row should open its own screen once those designs are ready.
const ITEMS: SettingsItem[] = [
  { id: "privacy", title: "Privacy & Security", icon: ShieldCheck },
  { id: "help", title: "Help & Support", icon: CircleHelp },
  { id: "about", title: "About WAYR", icon: Info },
];

export default function Settings() {
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.navigate("/profile");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={goBack}
          style={styles.back}
        >
          <ArrowLeft size={22} strokeWidth={2} color={colors.ink} />
        </Pressable>

        <Text style={styles.title}>SETTINGS</Text>

        <View style={styles.list}>
          {ITEMS.map(({ id, title, icon: Icon }) => (
            <Pressable
              key={id}
              accessibilityRole="button"
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.icon}>
                <Icon size={22} strokeWidth={1.75} color={colors.black} />
              </View>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {title.toUpperCase()}
              </Text>
              <ChevronRight size={22} strokeWidth={1.75} color={colors.ink} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: 23,
    paddingTop: 30,
    paddingBottom: 28,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    marginTop: 26,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: colors.black,
  },
  list: {
    marginTop: 40,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F4F4F4",
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#DADADA",
  },
  rowTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.ink,
  },
});
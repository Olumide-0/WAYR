import { StatusBar } from "expo-status-bar";
import { Trophy } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/theme";
import Button from "../Button";

type RewardSuccessProps = {
  points: number;
  onExploreMore: () => void;
  onViewWallet: () => void;
};

// "You earned 75+ Waypoints!" shown after a visit is validated.
export default function RewardSuccess({ points, onExploreMore, onViewWallet }: RewardSuccessProps) {
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <View style={styles.card}>
        {/* TODO: swap for the trophy-and-coins image from the design. */}
        <View style={styles.trophy}>
          <Trophy size={120} strokeWidth={1.25} color="#E3A12F" fill="#F5C04A" />
        </View>

        <Text style={styles.earned}>YOU EARNED</Text>
        <Text style={styles.points}>{points}+</Text>
        <Text style={styles.waypoints} numberOfLines={1} adjustsFontSizeToFit>
          WAYPOINTS!
        </Text>

        <Button title="Explore More" onPress={onExploreMore} style={styles.primary} />

        <Pressable
          accessibilityRole="button"
          onPress={onViewWallet}
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryLabel}>View Wallet</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingTop: 40,
    backgroundColor: colors.splash,
  },
  card: {
    alignItems: "center",
    paddingHorizontal: 26,
    paddingTop: 30,
    paddingBottom: 30,
    borderRadius: 28,
    backgroundColor: colors.white,
  },
  trophy: {
    height: 190,
    alignItems: "center",
    justifyContent: "center",
  },
  earned: {
    marginTop: 18,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: colors.ink,
  },
  points: {
    marginTop: 8,
    fontSize: 64,
    lineHeight: 70,
    fontWeight: "900",
    letterSpacing: -1,
    color: colors.brand,
  },
  waypoints: {
    fontSize: 42,
    lineHeight: 46,
    fontWeight: "900",
    letterSpacing: -1,
    color: colors.ink,
  },
  primary: {
    alignSelf: "stretch",
    height: 52,
    marginTop: 32,
    borderRadius: 12,
  },
  secondary: {
    alignSelf: "stretch",
    height: 52,
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
    fontSize: 16,
    fontWeight: "800",
    color: colors.brand,
  },
});
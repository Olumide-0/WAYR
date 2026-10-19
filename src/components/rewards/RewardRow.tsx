import { MapPin } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Reward } from "../../constants/rewards";
import { colors } from "../../constants/theme";

type RewardRowProps = {
  reward: Reward;
  onPress: () => void;
};

export default function RewardRow({ reward, onPress }: RewardRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${reward.title}, ${reward.points} Waypoints`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Image source={reward.image} resizeMode="cover" style={styles.photo} />

      <View style={styles.info}>
        <View style={[styles.status, !reward.available && styles.statusOff]}>
          <Text style={[styles.statusLabel, !reward.available && styles.statusLabelOff]}>
            {reward.available ? "Available" : "Unavailable"}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {reward.title}
        </Text>
        <Text style={styles.merchant} numberOfLines={1}>
          {reward.merchant}
        </Text>

        <View style={styles.bottom}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{reward.points} Wpts</Text>
          </View>

          <View style={styles.distance}>
            <MapPin size={16} strokeWidth={1.75} color={colors.ink} />
            <Text style={styles.distanceLabel}>{reward.distanceKm}km</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  pressed: {
    opacity: 0.8,
  },
  photo: {
    width: 104,
    height: 104,
    borderRadius: 12,
    backgroundColor: colors.ink,
  },
  info: {
    flex: 1,
  },
  status: {
    alignSelf: "flex-start",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.black,
  },
  statusOff: {
    backgroundColor: colors.muted,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.brand,
  },
  statusLabelOff: {
    color: colors.white,
  },
  title: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
    color: colors.ink,
  },
  merchant: {
    marginTop: 4,
    fontSize: 13,
    color: colors.muted,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: colors.white,
  },
  badgeLabel: {
    fontSize: 11,
    color: colors.black,
  },
  distance: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  distanceLabel: {
    fontSize: 12,
    color: colors.ink,
  },
});
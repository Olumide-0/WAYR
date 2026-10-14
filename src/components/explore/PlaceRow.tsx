import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Place } from "../../constants/places";
import { colors } from "../../constants/theme";

type PlaceRowProps = {
  place: Place;
  onPress?: () => void;
};

export default function PlaceRow({ place, onPress }: PlaceRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && styles.pressed]}
    >
      {place.image ? (
        <Image source={place.image} resizeMode="cover" style={styles.photo} />
      ) : (
        <View style={styles.photo} />
      )}

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {place.description}
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>+{place.points} Wpts</Text>
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
    width: 92,
    height: 92,
    borderRadius: 12,
    backgroundColor: colors.ink,
  },
  info: {
    flex: 1,
    alignItems: "flex-start",
  },
  name: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  description: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.white,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.black,
  },
});
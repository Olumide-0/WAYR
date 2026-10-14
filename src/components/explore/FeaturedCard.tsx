import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Place } from "../../constants/places";
import { colors } from "../../constants/theme";
import Button from "../Button";
import { PointsBadge, TagList } from "./PlaceMeta";

type FeaturedCardProps = {
  place: Place;
  onViewDetail: () => void;
  onViewMap: () => void;
};

export default function FeaturedCard({ place, onViewDetail, onViewMap }: FeaturedCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>FEATURED LANDMARKS</Text>

      <View style={styles.photo}>
        {place.image ? (
          <Image source={place.image} resizeMode="cover" style={styles.photoImage} />
        ) : null}
        <View style={styles.overlay} />

        <View style={styles.badge}>
          <PointsBadge points={place.points} />
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {place.name}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {place.address}
          </Text>
          <TagList tags={place.tags} />
        </View>
      </View>

      <View style={styles.actions}>
        <Button title="View Detail" onPress={onViewDetail} style={styles.action} />

        <Pressable
          accessibilityRole="button"
          onPress={onViewMap}
          style={({ pressed }) => [styles.action, styles.outline, pressed && styles.pressed]}
        >
          <Text style={styles.outlineLabel}>View Map</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: colors.ink,
  },
  photo: {
    height: 170,
    marginTop: 14,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: colors.ink,
  },
  photoImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  info: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.white,
  },
  address: {
    marginTop: 3,
    marginBottom: 8,
    fontSize: 11,
    color: colors.white,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  action: {
    flex: 1,
    width: "auto",
    height: 44,
    borderRadius: 12,
  },
  outline: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.brand,
  },
  pressed: {
    opacity: 0.7,
  },
  outlineLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.brand,
  },
});
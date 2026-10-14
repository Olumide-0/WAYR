import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Place } from "../../constants/places";
import { colors } from "../../constants/theme";
import { PointsBadge, TagList } from "./PlaceMeta";

type NearbyCardProps = {
  place: Place;
  width: number;
  onPress: () => void;
};

export default function NearbyCard({ place, width, onPress }: NearbyCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [{ width }, pressed && styles.pressed]}
    >
      <View style={styles.photo}>
        {place.image ? (
          <Image source={place.image} resizeMode="cover" style={styles.photoImage} />
        ) : null}

        <View style={styles.badge}>
          <PointsBadge points={place.points} />
        </View>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {place.name}
      </Text>
      <Text style={styles.address} numberOfLines={1}>
        {place.address}
      </Text>
      <TagList tags={place.tags} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
  },
  photo: {
    height: 150,
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.white,
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
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  name: {
    marginTop: 12,
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
});
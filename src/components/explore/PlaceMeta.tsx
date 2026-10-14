import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/theme";

export function PointsBadge({ points }: { points: number }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeLabel}>+{points} Wpts</Text>
    </View>
  );
}

export function TagList({ tags }: { tags: string[] }) {
  return (
    <View style={styles.tags}>
      {tags.map((tag) => (
        <View key={tag} style={styles.tag}>
          <Text style={styles.tagLabel}>{tag}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.brand,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.black,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: colors.pill,
  },
  tagLabel: {
    fontSize: 11,
    color: colors.ink,
  },
});
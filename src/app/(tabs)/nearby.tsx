import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PlaceRow from "../../components/explore/PlaceRow";
import { ALL_PLACES } from "../../constants/places";
import { colors } from "../../constants/theme";

const FILTERS = ["All", "Museum", "Art", "Culture", "Iconic"];

export default function Nearby() {
  const router = useRouter();
  const [filter, setFilter] = useState("All");

  const places = filter === "All" ? ALL_PLACES : ALL_PLACES.filter((p) => p.tags.includes(filter));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" />

      <FlatList
        data={places}
        keyExtractor={(place) => place.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.empty}>No landmarks in this category yet</Text>}
        ListHeaderComponent={
          <View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => router.navigate("/explore")}
              style={styles.back}
            >
              <ArrowLeft size={22} strokeWidth={2} color={colors.black} />
            </Pressable>

            <Text style={styles.title}>NEARBY PLACES</Text>
            <Text style={styles.subtitle}>Visit landmarks to earn Waypoints</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              {FILTERS.map((item) => {
                const active = item === filter;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setFilter(item)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <PlaceRow
            place={item}
            onPress={() => router.navigate({ pathname: "/detail", params: { id: item.id } })}
          />
        )}
      />
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
    paddingTop: 20,
    paddingBottom: 28,
  },
  back: {
    width: 42,
    height: 42,
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
    marginTop: 30,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: colors.black,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
  filters: {
    gap: 8,
    paddingVertical: 24,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
    backgroundColor: "rgba(61, 61, 61, 0.1)",
  },
  chipActive: {
    backgroundColor: colors.brand,
  },
  chipLabel: {
    fontSize: 13,
    color: colors.ink,
  },
  chipLabelActive: {
    fontWeight: "800",
    color: colors.black,
  },
  separator: {
    height: 14,
  },
  empty: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 15,
    color: colors.muted,
  },
});
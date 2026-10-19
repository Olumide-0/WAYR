import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronDown, RefreshCw } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RewardRow from "../../components/rewards/RewardRow";
import SortSheet from "../../components/rewards/SortSheet";
import { REWARDS } from "../../constants/rewards";
import { colors } from "../../constants/theme";
import { useWallet } from "../../store/wallet";

const FILTERS = ["All", "Food & Drinks", "Experiences", "Retail"];

const SORTS = [
  {
    id: "nearby",
    label: "Nearby",
    title: "Nearby",
    hint: "Closest partners first.",
  },
  {
    id: "low",
    label: "Low to High",
    title: "Waypoints: Low to High",
    hint: "Best for quick wins",
  },
  {
    id: "high",
    label: "High to Low",
    title: "Waypoints: High to Low",
    hint: "Big goals",
  },
  {
    id: "popular",
    label: "Popular",
    title: "Popular",
    hint: "Featured rewards first",
  },
] as const;

type SortId = (typeof SORTS)[number]["id"];

export default function Rewards() {
  const router = useRouter();
  const { balance } = useWallet();

  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState<SortId>("nearby");
  const [sortOpen, setSortOpen] = useState(false);

  const spin = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);

  // TODO: refetch rewards from the API. For now it just spins the icon.
  useEffect(() => {
    if (!refreshing) return;
    spin.setValue(0);
    const animation = Animated.timing(spin, {
      toValue: 1,
      duration: 700,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    animation.start(() => setRefreshing(false));
    return () => animation.stop();
  }, [refreshing, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const filtered =
    filter === "All" ? REWARDS : REWARDS.filter((r) => r.category === filter);
  const rewards = [...filtered].sort((a, b) => {
    if (sort === "low") return a.points - b.points;
    if (sort === "high") return b.points - a.points;
    if (sort === "popular") return b.popularity - a.popularity;
    return a.distanceKm - b.distanceKm;
  });

  const sortLabel = SORTS.find((item) => item.id === sort)?.label;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar style="dark" />

        <FlatList
          data={rewards}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No rewards in this category yet</Text>
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <View style={styles.titleText}>
                  <Text style={styles.title}>REWARDS</Text>
                  <Text style={styles.subtitle}>
                    Redeem Waypoints at Melbourne partners.
                  </Text>
                </View>

                <View style={styles.balanceBox}>
                  <Text style={styles.balanceLabel}>Your balance</Text>
                  <Text style={styles.balanceValue}>
                    <Text style={styles.balance}>{balance}</Text> Wpts
                  </Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersScroll}
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
                      <Text
                        style={[
                          styles.chipLabel,
                          active && styles.chipLabelActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.toolbar}>
                <View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Sort by ${sortLabel}`}
                    onPress={() => setSortOpen(true)}
                    style={styles.sort}
                  >
                    <Text style={styles.sortLabel}>
                      Sort: <Text style={styles.sortValue}>{sortLabel}</Text>
                    </Text>
                    <ChevronDown size={18} strokeWidth={2} color={colors.ink} />
                  </Pressable>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Refresh rewards"
                  onPress={() => setRefreshing(true)}
                  style={({ pressed }) => [
                    styles.refresh,
                    pressed && styles.pressed,
                  ]}
                >
                  <Animated.View style={{ transform: [{ rotate }] }}>
                    <RefreshCw
                      size={16}
                      strokeWidth={2.25}
                      color={colors.ink}
                    />
                  </Animated.View>
                  <Text style={styles.refreshLabel}>Refresh</Text>
                </Pressable>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <RewardRow
              reward={item}
              onPress={() =>
                router.navigate({ pathname: "/reward", params: { id: item.id } })
              }
            />
          )}
        />
      </SafeAreaView>

      {sortOpen ? (
        <SortSheet
          options={SORTS}
          value={sort}
          onChange={setSort}
          onClose={() => setSortOpen(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: 23,
    paddingTop: 50,
    paddingBottom: 28,
  },
  header: {
    zIndex: 2,
    marginBottom: 22,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  titleText: {
    flex: 1,
    paddingTop: 6,
  },
  balanceBox: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.black,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.white,
  },
  balanceValue: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "800",
    color: colors.white,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: colors.black,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
  balance: {
    fontWeight: "800",
    color: colors.brand,
  },
  filtersScroll: {
    marginTop: 26,
    marginHorizontal: -23,
  },
  filters: {
    gap: 6,
    paddingHorizontal: 23,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: "rgba(61, 61, 61, 0.1)",
  },
  chipActive: {
    backgroundColor: colors.brand,
  },
  chipLabel: {
    fontSize: 15,
    color: colors.ink,
  },
  chipLabelActive: {
    fontWeight: "800",
    color: colors.ink,
  },
  toolbar: {
    zIndex: 2,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 22,
  },
  sort: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: "rgba(61, 61, 61, 0.1)",
  },
  sortLabel: {
    fontSize: 15,
    color: colors.ink,
  },
  sortValue: {
    fontWeight: "700",
  },
  refresh: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.brand,
  },
  pressed: {
    opacity: 0.8,
  },
  refreshLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  separator: {
    height: 14,
  },
  empty: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 15,
    color: colors.muted,
  },
});
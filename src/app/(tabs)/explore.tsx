import * as Location from "expo-location";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Search, SlidersHorizontal } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  BackHandler,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FeaturedCard from "../../components/explore/FeaturedCard";
import NearbyCard from "../../components/explore/NearbyCard";
import MapSection from "../../components/map/MapSection";
import { FEATURED_PLACE, NEARBY_PLACES, Place } from "../../constants/places";
import { colors } from "../../constants/theme";

// TODO: replace with the first name from the signed-in user / saved profile.
const USER_FIRST_NAME = "Sarah";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "GOOD MORNING";
  if (hour < 18) return "GOOD AFTERNOON";
  return "GOOD EVENING";
};

const matches = (place: Place, query: string) =>
  [place.name, place.address, ...place.tags].some((value) =>
    value.toLowerCase().includes(query)
  );

export default function Explore() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const navigation = useNavigation();

  // "View Map" swaps this page for the map section. Enable Location sends the user
  // back here with ?map=1 once location is on, so the map opens right after.
  const { map } = useLocalSearchParams<{ map?: string }>();
  const [showMap, setShowMap] = useState(map === "1");
  const [query, setQuery] = useState("");

  const closeMap = () => {
    setShowMap(false);
    router.setParams({ map: undefined });
  };

  useEffect(() => {
    if (map === "1") setShowMap(true);
  }, [map]);

  // Back button (Android) and tapping the Explore tab again both return to the list.
  useEffect(() => {
    if (!showMap) return;

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      closeMap();
      return true;
    });
    const unsubscribe = navigation.addListener("tabPress" as never, closeMap as never);

    return () => {
      subscription.remove();
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMap, navigation]);

  const q = query.trim().toLowerCase();
  const showFeatured = !q || matches(FEATURED_PLACE, q);
  const nearby = q ? NEARBY_PLACES.filter((place) => matches(place, q)) : NEARBY_PLACES;
  const nothingFound = !showFeatured && nearby.length === 0;

  const openMap = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status !== "granted") {
      // Location is still off, so ask for it here. No "Maybe Later" in this case.
      router.push({ pathname: "/enable-location", params: { required: "1" } });
      return;
    }

    // Location is already on (e.g. enabled during sign up): go straight to the map.
    setShowMap(true);
  };

  const openDetail = (place: Place) => {
    router.navigate({ pathname: "/detail", params: { id: place.id } });
  };

  if (showMap) return <MapSection />;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.top}>
          <Text style={styles.greeting} numberOfLines={1} adjustsFontSizeToFit>
            {getGreeting()}, {USER_FIRST_NAME.toUpperCase()}
          </Text>
          <Text style={styles.subtitle}>Visit landmarks to earn Waypoints</Text>

          <View style={styles.searchRow}>
            <View style={styles.search}>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search landmarks, tags..."
                placeholderTextColor={colors.ink}
                style={styles.searchInput}
                returnKeyType="search"
                autoCorrect={false}
              />
              <Search size={20} strokeWidth={1.5} color={colors.ink} />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filters"
              // TODO: open the filters sheet.
              onPress={() => console.log("Open filters")}
              style={styles.filter}
            >
              <SlidersHorizontal size={20} strokeWidth={1.5} color={colors.ink} />
            </Pressable>
          </View>

          {showFeatured ? (
            <View style={styles.featured}>
              <FeaturedCard
                place={FEATURED_PLACE}
                onViewDetail={() => openDetail(FEATURED_PLACE)}
                onViewMap={openMap}
              />
            </View>
          ) : null}

          {nothingFound ? (
            <Text style={styles.empty}>No landmarks found for “{query.trim()}”</Text>
          ) : null}
        </View>

        {nearby.length > 0 ? (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>EXPLORE NEARBY PLACES</Text>
              <Pressable
                accessibilityRole="link"
                onPress={() => router.navigate("/nearby")}
              >
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            </View>

            <FlatList
              data={nearby}
              keyExtractor={(place) => place.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <NearbyCard
                  place={item}
                  width={width * 0.68}
                  onPress={() => openDetail(item)}
                />
              )}
            />
          </View>
        ) : null}
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
    flexGrow: 1,
  },
  top: {
    paddingHorizontal: 23,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 26,
    lineHeight: 30,
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 22,
  },
  search: {
    flex: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.white,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: colors.ink,
  },
  filter: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.white,
  },
  featured: {
    marginTop: 22,
  },
  empty: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 15,
    color: colors.muted,
  },
  panel: {
    marginTop: 28,
    paddingTop: 22,
    paddingBottom: 28,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: colors.panel,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 23,
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: colors.white,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
  },
  list: {
    paddingHorizontal: 23,
    gap: 14,
  },
});
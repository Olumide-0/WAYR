import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Search, SlidersHorizontal } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ALL_PLACES, FEATURED_PLACE, Place } from "../../constants/places";
import { MAP_STYLE } from "../../constants/mapStyle";
import { colors } from "../../constants/theme";
import NearbyCard from "../explore/NearbyCard";
import { MapPin, PlaceCallout, UserPuck } from "./MapPin";

// Places store [longitude, latitude]; react-native-maps wants { latitude, longitude }.
const toLatLng = ([longitude, latitude]: [number, number]) => ({ latitude, longitude });

// TODO: replace with the real route from the user to the selected landmark
// (a directions API). For now it just joins the sample places.
const coordinateOf = (id: string) => ALL_PLACES.find((place) => place.id === id)!.coordinate;

const ROUTE = [
  coordinateOf("national-gallery-of-victoria"),
  [144.9672, -37.8195] as [number, number],
  coordinateOf("flinders-street-station"),
  [144.9688, -37.8174] as [number, number],
  coordinateOf("hosier-lane-street-art"),
].map(toLatLng);

const INITIAL_REGION = {
  ...toLatLng(FEATURED_PLACE.coordinate),
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

// Height of the bit of the panel that stays visible when it is dragged down.
const HANDLE_AREA = 34;

const matches = (place: Place, query: string) =>
  [place.name, place.address, ...place.tags].some((value) =>
    value.toLowerCase().includes(query)
  );

// Shown inside the Explore page when the user taps "View Map" (tab bar stays visible).
// Explore only renders this once location permission is granted.
export default function MapSection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const mapRef = useRef<MapView>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(FEATURED_PLACE.id);
  const [user, setUser] = useState<{ latitude: number; longitude: number } | null>(null);
  const [heading, setHeading] = useState(0);

  const q = query.trim().toLowerCase();
  const places = q ? ALL_PLACES.filter((place) => matches(place, q)) : ALL_PLACES;
  const selected = places.find((place) => place.id === selectedId) ?? null;

  // Live position + compass heading for the blue arrow.
  useEffect(() => {
    let active = true;
    let positionSub: Location.LocationSubscription | undefined;
    let headingSub: Location.LocationSubscription | undefined;
    let first = true;

    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (!active || status !== "granted") return;

      try {
        positionSub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 5 },
          ({ coords }) => {
            const next = { latitude: coords.latitude, longitude: coords.longitude };
            setUser(next);

            if (first) {
              first = false;
              mapRef.current?.animateToRegion(
                { ...next, latitudeDelta: 0.02, longitudeDelta: 0.02 },
                800
              );
            }
          }
        );

        headingSub = await Location.watchHeadingAsync((value) => {
          setHeading(value.trueHeading >= 0 ? value.trueHeading : value.magHeading);
        });
      } catch (error) {
        console.log("Could not watch the location:", error);
      }

      if (!active) {
        positionSub?.remove();
        headingSub?.remove();
      }
    })();

    return () => {
      active = false;
      positionSub?.remove();
      headingSub?.remove();
    };
  }, []);

  // Draggable "Explore nearby places" panel: 0 = open, collapsed = only the handle shows.
  const [panelHeight, setPanelHeight] = useState(0);
  const collapsed = Math.max(panelHeight - HANDLE_AREA, 0);

  const translateY = useRef(new Animated.Value(0)).current;
  const offset = useRef(0);
  const dragStart = useRef(0);

  useEffect(() => {
    const id = translateY.addListener(({ value }) => {
      offset.current = value;
    });
    return () => translateY.removeListener(id);
  }, [translateY]);

  const snapTo = (target: number) => {
    Animated.spring(translateY, {
      toValue: target,
      useNativeDriver: false,
      bounciness: 0,
      speed: 16,
    }).start();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Only take over once the finger actually moves vertically, so taps on
        // "View All" and horizontal card scrolling keep working.
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dy) > 4 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderGrant: () => {
          translateY.stopAnimation();
          dragStart.current = offset.current;
        },
        onPanResponderMove: (_, g) => {
          translateY.setValue(Math.min(Math.max(dragStart.current + g.dy, 0), collapsed));
        },
        onPanResponderRelease: (_, g) => {
          const position = Math.min(Math.max(dragStart.current + g.dy, 0), collapsed);
          const goDown = g.vy > 0.4 || (g.vy > -0.4 && position > collapsed / 2);
          snapTo(goDown ? collapsed : 0);
        },
        onPanResponderTerminate: () => snapTo(offset.current > collapsed / 2 ? collapsed : 0),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collapsed]
  );

  const focusPlace = (place: Place) => {
    setSelectedId(place.id);
    mapRef.current?.animateToRegion(
      { ...toLatLng(place.coordinate), latitudeDelta: 0.01, longitudeDelta: 0.01 },
      600
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        customMapStyle={MAP_STYLE}
        userInterfaceStyle="light"
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsPointsOfInterests={false}
        toolbarEnabled={false}
        mapPadding={{ top: insets.top + 70, right: 0, bottom: HANDLE_AREA, left: 0 }}
        onPress={() => setSelectedId(null)}
      >
        <Polyline
          coordinates={ROUTE}
          strokeColor="#1AA3F5"
          strokeWidth={9}
          lineCap="round"
          lineJoin="round"
        />

        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={toLatLng(place.coordinate)}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={1}
            onPress={(event) => {
              event.stopPropagation();
              focusPlace(place);
            }}
          >
            <MapPin name={place.name} />
          </Marker>
        ))}

        {selected ? (
          <Marker
            key={`callout-${selected.id}`}
            coordinate={toLatLng(selected.coordinate)}
            anchor={{ x: 0, y: 1 }}
            zIndex={2}
            tappable={false}
          >
            <PlaceCallout name={selected.name} />
          </Marker>
        ) : null}

        {user ? (
          <Marker
            coordinate={user}
            anchor={{ x: 0.5, y: 0.5 }}
            rotation={heading - 45}
            flat
            zIndex={3}
            tappable={false}
          >
            <UserPuck />
          </Marker>
        ) : null}
      </MapView>

      <View style={[styles.searchRow, { top: insets.top + 12 }]}>
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

      <Animated.View
        style={[styles.panel, { transform: [{ translateY }] }]}
        onLayout={(event) => setPanelHeight(event.nativeEvent.layout.height)}
      >
        <View {...panResponder.panHandlers}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Expand or collapse nearby places"
            onPress={() => snapTo(offset.current > collapsed / 2 ? 0 : collapsed)}
            style={styles.handleArea}
          >
            <View style={styles.handle} />
          </Pressable>

          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>EXPLORE NEARBY PLACES</Text>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.navigate("/nearby")}
            >
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>
        </View>

        {places.length > 0 ? (
          <FlatList
            data={places}
            keyExtractor={(place) => place.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <NearbyCard
                place={item}
                width={width * 0.68}
                onPress={() => focusPlace(item)}
              />
            )}
          />
        ) : (
          <Text style={styles.empty}>No landmarks found for “{query.trim()}”</Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  searchRow: {
    position: "absolute",
    left: 23,
    right: 23,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: colors.panel,
  },
  handleArea: {
    height: HANDLE_AREA,
    alignItems: "center",
    justifyContent: "center",
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
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
  empty: {
    paddingHorizontal: 23,
    paddingBottom: 12,
    fontSize: 15,
    color: colors.white,
  },
});
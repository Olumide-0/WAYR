import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { CircleX, Gem, Search, SlidersHorizontal } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MAP_STYLE } from "../../constants/mapStyle";
import { getRouteStops, Place, RouteStop } from "../../constants/places";
import { colors } from "../../constants/theme";
import { MapPin, UserPuck } from "./MapPin";

type LatLng = { latitude: number; longitude: number };

// How close (in metres) the user must get to a stop for it to count as visited.
const VISIT_RADIUS_M = 50;
// Only join the user's dot to the route when they are reasonably close to it.
const MAX_ROUTE_START_M = 20000;

const toLatLng = ([longitude, latitude]: [number, number]): LatLng => ({
  latitude,
  longitude,
});

// Straight-line distance in metres between two points.
const distanceInMetres = (a: LatLng, b: LatLng) => {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(b.latitude)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
};

function StopLabel({
  stop,
  visited,
  directionsOnly,
}: {
  stop: RouteStop;
  visited: boolean;
  directionsOnly: boolean;
}) {
  const hint = directionsOnly
    ? "Pick up your reward here"
    : visited
      ? "Visited"
      : stop.isFinal
        ? "Your Final Landmark"
        : "Nearby place";

  return (
    <View style={styles.labelWrapper}>
      <View style={styles.label}>
        {directionsOnly ? null : (
          <View style={styles.labelPoints}>
            <Gem size={14} strokeWidth={1.75} color={colors.brand} />
            <Text style={styles.labelPointsText}>{stop.points} Wpts</Text>
          </View>
        )}
        <Text
          style={[styles.labelName, directionsOnly && styles.labelNameOnly]}
          numberOfLines={1}
        >
          {stop.place.name}
        </Text>
        <Text style={styles.labelHint}>{hint}</Text>
      </View>
    </View>
  );
}

type RouteMapProps = {
  place: Place;
  onClose: () => void;
  // Called once when the user reaches (or taps) the final landmark, with the bonus
  // points from the nearby stops they visited on the way. Optional.
  onArrive?: (bonusPoints: number) => void;
  // Just directions (e.g. to a reward partner): only the destination, no points,
  // no nearby stops and no check-ins. Spending happens with "Pay with Wpts".
  directionsOnly?: boolean;
};

// "Get Directions" map shown on the detail page after "Validate Visit".
// The final landmark gives its own points; each nearby stop on the way adds a bonus,
// but only if the user actually visits it.
export default function RouteMap({
  place,
  onClose,
  onArrive,
  directionsOnly = false,
}: RouteMapProps) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const stops = useMemo(
    () =>
      directionsOnly
        ? [{ place, points: 0, isFinal: true }]
        : getRouteStops(place),
    [place, directionsOnly],
  );
  const [visited, setVisited] = useState<string[]>([]);
  const [user, setUser] = useState<LatLng | null>(null);
  const [heading, setHeading] = useState(0);
  const [query, setQuery] = useState("");

  // Total for this trip: only the stops the user really reached.
  // TODO: send the visited stops to the API so the points are awarded on the server.
  const earned = stops
    .filter((stop) => visited.includes(stop.place.id))
    .reduce((sum, stop) => sum + stop.points, 0);

  // Refs so the location watcher always sees the latest values.
  const visitedRef = useRef<string[]>([]);
  const arrivedRef = useRef(false);
  const onArriveRef = useRef(onArrive);

  useEffect(() => {
    onArriveRef.current = onArrive;
  }, [onArrive]);

  const markVisited = (id: string) => {
    if (visitedRef.current.includes(id)) return;
    visitedRef.current = [...visitedRef.current, id];
    setVisited(visitedRef.current);
  };

  const arrive = () => {
    if (arrivedRef.current) return;
    arrivedRef.current = true;

    const bonus = stops
      .filter(
        (stop) => !stop.isFinal && visitedRef.current.includes(stop.place.id),
      )
      .reduce((sum, stop) => sum + stop.points, 0);

    onArriveRef.current?.(bonus);
  };

  // Follow the user, and check them in at any stop they get close to.
  useEffect(() => {
    let active = true;
    let positionSub: Location.LocationSubscription | undefined;
    let headingSub: Location.LocationSubscription | undefined;

    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (!active || status !== "granted") return;

      try {
        positionSub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5 },
          ({ coords }) => {
            const here = {
              latitude: coords.latitude,
              longitude: coords.longitude,
            };
            setUser(here);

            // Directions only: nothing to check in or earn.
            if (directionsOnly) return;

            stops.forEach((stop) => {
              if (
                distanceInMetres(here, toLatLng(stop.place.coordinate)) <=
                VISIT_RADIUS_M
              ) {
                markVisited(stop.place.id);
                if (stop.isFinal) arrive();
              }
            });
          },
        );

        headingSub = await Location.watchHeadingAsync((value) => {
          setHeading(
            value.trueHeading >= 0 ? value.trueHeading : value.magHeading,
          );
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
  }, [stops, directionsOnly]);

  const stopCoordinates = stops.map((stop) => toLatLng(stop.place.coordinate));
  const userNearRoute =
    user && distanceInMetres(user, stopCoordinates[0]) <= MAX_ROUTE_START_M
      ? user
      : null;

  // TODO: replace the straight lines with a real walking route (directions API).
  const route = userNearRoute
    ? [userNearRoute, ...stopCoordinates]
    : stopCoordinates;

  const fitRoute = () => {
    // A single point (e.g. directions with the user far away): just centre on it.
    if (route.length < 2) {
      mapRef.current?.animateToRegion(
        { ...route[0], latitudeDelta: 0.01, longitudeDelta: 0.01 },
        400,
      );
      return;
    }

    mapRef.current?.fitToCoordinates(route, {
      edgePadding: { top: insets.top + 90, right: 190, bottom: 120, left: 50 },
      animated: true,
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...stopCoordinates[0],
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        customMapStyle={MAP_STYLE}
        userInterfaceStyle="light"
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsPointsOfInterests={false}
        toolbarEnabled={false}
        mapPadding={{ top: insets.top + 70, right: 0, bottom: 80, left: 0 }}
        onMapReady={fitRoute}
      >
        <Polyline
          coordinates={route}
          strokeColor="#1AA3F5"
          strokeWidth={9}
          lineCap="round"
          lineJoin="round"
        />

        {stops.map((stop) => (
          <Marker
            key={stop.place.id}
            coordinate={toLatLng(stop.place.coordinate)}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={1}
            // Tapping the final landmark opens "Ready to validate" (handy for testing).
            // Dev only: tapping a nearby stop pretends you've visited it, since the sample
            // stops are in Melbourne. Real check-ins happen automatically by proximity.
            onPress={
              directionsOnly
                ? undefined
                : stop.isFinal
                  ? arrive
                  : __DEV__
                    ? () => markVisited(stop.place.id)
                    : undefined
            }
          >
            <MapPin name={stop.place.name} />
          </Marker>
        ))}

        {stops.map((stop) => (
          <Marker
            key={`label-${stop.place.id}`}
            coordinate={toLatLng(stop.place.coordinate)}
            anchor={{ x: 0, y: 0.5 }}
            zIndex={2}
            tappable={false}
          >
            <StopLabel
              stop={stop}
              visited={visited.includes(stop.place.id)}
              directionsOnly={directionsOnly}
            />
          </Marker>
        ))}

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

        {/* TODO: open the filters sheet. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filters"
          style={styles.filter}
        >
          <SlidersHorizontal size={20} strokeWidth={1.5} color={colors.ink} />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Close map. ${earned} Waypoints earned on this route`}
        onPress={onClose}
        style={({ pressed }) => [styles.close, pressed && styles.pressed]}
      >
        <Text style={styles.closeLabel}>Close Map</Text>
        <CircleX size={18} strokeWidth={1.75} color={colors.black} />
      </Pressable>
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
  labelWrapper: {
    paddingLeft: 16,
  },
  label: {
    minWidth: 150,
    maxWidth: 200,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.black,
  },
  labelPoints: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  labelPointsText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.brand,
  },
  labelName: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "800",
    color: colors.white,
  },
  labelNameOnly: {
    marginTop: 0,
  },
  labelHint: {
    marginTop: 4,
    fontSize: 9,
    color: colors.white,
  },
  close: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.brand,
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pressed: {
    opacity: 0.8,
  },
  closeLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.black,
  },
});
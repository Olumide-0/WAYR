import { useEffect, useMemo, useRef } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { Place } from "../../constants/places";
import { colors } from "../../constants/theme";
import { MapPin } from "../map/MapPin";

type ValidateSheetProps = {
  place: Place;
  // Points the user gets for this visit (landmark + any nearby stops they visited).
  points: number;
  onValidate: () => void;
  onClose: () => void;
};

// "Ready to validate" bottom sheet shown over the detail page when the user reaches
// the final landmark. Sits above the tab bar, like the mockup.
export default function ValidateSheet({ place, points, onValidate, onClose }: ValidateSheetProps) {
  const slide = useRef(new Animated.Value(500)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 14 }),
    ]).start();
  }, [fade, slide]);

  // Slide down and fade out, then tell the parent to unmount the sheet.
  const close = () => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 500, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  // Drag the handle down to dismiss; let go early and it springs back.
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
        onPanResponderMove: (_, g) => {
          slide.setValue(Math.max(g.dy, 0));
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > 120 || g.vy > 0.8) {
            close();
          } else {
            Animated.spring(slide, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 0,
              speed: 16,
            }).start();
          }
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slide]
  );

  const [longitude, latitude] = place.coordinate;
  const coordinate = { latitude, longitude };

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={close}
          style={styles.fill}
        />
      </Animated.View>

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slide }] }]}>
        <View {...panResponder.panHandlers} style={styles.dragArea}>
          <View style={styles.handle} />
        </View>

        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {place.name}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={close}
            style={({ pressed }) => [styles.done, pressed && styles.pressed]}
          >
            <Text style={styles.doneLabel}>Done</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.mapBox} pointerEvents="none">
            <MapView
              style={styles.fill}
              liteMode
              initialRegion={{ ...coordinate, latitudeDelta: 0.06, longitudeDelta: 0.06 }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              toolbarEnabled={false}
              showsCompass={false}
            >
              <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 1 }}>
                <MapPin name={place.name} />
              </Marker>
              <Marker coordinate={coordinate} anchor={{ x: 0.8, y: -0.1 }}>
                <View style={styles.pointsTag}>
                  <Text style={styles.pointsTagLabel}>+{points}WP</Text>
                </View>
              </Marker>
            </MapView>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.title}>READY TO VALIDATE</Text>
            <Text style={styles.text}>
              When you’re within range, we’ll confirm and award Waypoints.
            </Text>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={onValidate}
                style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
              >
                <Text style={styles.primaryLabel}>Validate now</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={close}
                style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryLabel}>Not now</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  fill: {
    flex: 1,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheet: {
    paddingHorizontal: 18,
    paddingBottom: 22,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: "#262626",
  },
  dragArea: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 8,
    marginHorizontal: -18,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: colors.white,
  },
  done: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  doneLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  card: {
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: colors.white,
  },
  mapBox: {
    height: 160,
    backgroundColor: colors.inputBg,
  },
  pointsTag: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: colors.black,
  },
  pointsTagLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
  cardBody: {
    padding: 14,
    paddingTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.ink,
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  primary: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.brand,
  },
  primaryLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },
  secondary: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  secondaryLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.brand,
  },
  pressed: {
    opacity: 0.8,
  },
});
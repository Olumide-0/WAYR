import { Image } from "expo-image";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Bookmark,
  Gem,
  Map as MapIcon,
  ShieldCheck,
  Target,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import Button from "../../components/Button";
import RouteMap from "../../components/map/RouteMap";
import { ALL_PLACES } from "../../constants/places";
import { colors } from "../../constants/theme";

const HERO_HEIGHT = 380;
const SOFT_BOX = "rgba(0, 0, 0, 0.1)";

export default function Detail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // ?route=1 comes back from Enable Location so the route map opens straight away.
  const { id, route } = useLocalSearchParams<{ id?: string; route?: string }>();

  const [saved, setSaved] = useState(false);
  const [showRoute, setShowRoute] = useState(route === "1");

  // This screen stays mounted between places, so reset it when the place changes.
  useEffect(() => {
    setShowRoute(route === "1");
  }, [id, route]);

  useEffect(() => {
    setSaved(false);
  }, [id]);

  const closeRoute = () => {
    setShowRoute(false);
    router.setParams({ route: undefined });
  };

  // Android back button closes the route map first.
  useEffect(() => {
    if (!showRoute) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      closeRoute();
      return true;
    });
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRoute]);

  const place = ALL_PLACES.find((item) => item.id === id);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.navigate("/explore");
  };

  if (!place) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + 12 }]}>
        <StatusBar style="dark" />
        <Pressable accessibilityRole="button" onPress={goBack} style={styles.lightBack}>
          <ArrowLeft size={22} strokeWidth={2} color={colors.black} />
        </Pressable>
        <Text style={styles.missingText}>This landmark could not be found</Text>
      </View>
    );
  }

  const validate = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status !== "granted") {
      // Location is off: ask for it (no "Maybe Later"), then come back with the map open.
      router.push({
        pathname: "/enable-location",
        params: { required: "1", placeId: place.id },
      });
      return;
    }

    setShowRoute(true);
  };

  if (showRoute) return <RouteMap place={place} onClose={closeRoute} />;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          {place.detailImage ?? place.image ? (
            <Image
              source={place.detailImage ?? place.image}
              contentFit="cover"
              style={styles.heroImage}
            />
          ) : null}

          <Svg style={styles.heroShade} width="100%" height="100%">
            <Defs>
              <LinearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#000000" stopOpacity="0.15" />
                <Stop offset="0.45" stopColor="#000000" stopOpacity="0.1" />
                <Stop offset="1" stopColor="#000000" stopOpacity="0.8" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#shade)" />
          </Svg>

          <View style={[styles.topRow, { top: insets.top + 12 }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={goBack}
              style={styles.roundButton}
            >
              <ArrowLeft size={22} strokeWidth={2} color={colors.brand} />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={saved ? "Remove bookmark" : "Bookmark"}
              onPress={() => setSaved((value) => !value)}
              style={styles.roundButton}
            >
              <Bookmark
                size={22}
                strokeWidth={2}
                color={colors.brand}
                fill={saved ? colors.brand : "transparent"}
              />
            </Pressable>
          </View>

          <View style={styles.heroInfo}>
            <View style={styles.category}>
              <Text style={styles.categoryLabel}>{place.tags[0]}</Text>
            </View>

            <Text style={styles.title}>{place.name.toUpperCase()}</Text>
            <Text style={styles.address}>{place.address}</Text>

            <View style={styles.reward}>
              <Gem size={34} strokeWidth={1.5} color={colors.brand} />
              <View>
                <Text style={styles.rewardTitle}>{place.points} Waypoints</Text>
                <Text style={styles.rewardHint}>Can earn again in 24hrs</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.heading}>ABOUT</Text>
          <Text style={styles.paragraph}>{place.about ?? place.description}</Text>

          <Text style={[styles.heading, styles.sectionGap]}>LOCATION</Text>
          <View style={styles.locationBox}>
            <Text style={styles.locationAddress}>{place.address.toUpperCase()}</Text>

            <View style={styles.direction}>
              <Text style={styles.directionLabel}>View Direction</Text>
              {/* Static for now. TODO: open directions to the landmark. */}
              <View style={styles.directionButton}>
                <MapIcon size={22} strokeWidth={1.5} color={colors.black} />
              </View>
            </View>
          </View>

          <Text style={[styles.heading, styles.sectionGap]}>WHAT YOU’LL EARN</Text>
          <View style={styles.infoBox}>
            <Target size={16} strokeWidth={2} color={colors.brand} />
            <Text style={styles.infoText}>
              Visit this Landmark to earn {place.points} Waypoints
            </Text>
          </View>

          <Text style={[styles.heading, styles.sectionGap]}>HOW WE VALIDATE</Text>
          <View style={[styles.infoBox, styles.validateBox]}>
            <View style={styles.shield}>
              <ShieldCheck size={22} strokeWidth={1.5} color={colors.white} />
            </View>
            <Text style={[styles.infoText, styles.validateText]}>
              We use proximity and a short confirmation step. If it’s not working, we’ll tell
              you exactly what to try.
            </Text>
          </View>

          <Button
            title={`Validate Visit & Earn ${place.points} Waypoints`}
            onPress={validate}
            style={styles.validate}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingBottom: 28,
  },
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: colors.ink,
  },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  heroShade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topRow: {
    position: "absolute",
    left: 23,
    right: 23,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roundButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  heroInfo: {
    position: "absolute",
    left: 23,
    right: 23,
    bottom: 18,
  },
  category: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: colors.black,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
  title: {
    marginTop: 14,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: colors.white,
  },
  address: {
    marginTop: 6,
    fontSize: 13,
    color: colors.white,
  },
  reward: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.white,
  },
  rewardHint: {
    marginTop: 2,
    fontSize: 11,
    color: colors.white,
  },
  body: {
    paddingHorizontal: 23,
    paddingTop: 28,
  },
  heading: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.2,
    color: colors.black,
  },
  sectionGap: {
    marginTop: 28,
  },
  paragraph: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
  locationBox: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 10,
    backgroundColor: SOFT_BOX,
  },
  locationAddress: {
    flex: 1,
    paddingRight: 12,
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },
  direction: {
    alignItems: "flex-end",
    gap: 6,
  },
  directionLabel: {
    fontSize: 10,
    color: colors.ink,
  },
  directionButton: {
    width: 46,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.brand,
  },
  infoBox: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 10,
    backgroundColor: SOFT_BOX,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colors.ink,
  },
  validateBox: {
    gap: 14,
  },
  validateText: {
    color: colors.muted,
  },
  shield: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "rgba(61, 61, 61, 0.45)",
  },
  validate: {
    height: 52,
    marginTop: 28,
    borderRadius: 12,
  },
  missing: {
    flex: 1,
    paddingHorizontal: 23,
    backgroundColor: colors.white,
  },
  lightBack: {
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
  missingText: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 15,
    color: colors.muted,
  },
});
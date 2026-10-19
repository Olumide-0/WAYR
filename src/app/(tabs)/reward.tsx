import { Image } from "expo-image";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Bookmark, CircleCheck, MapPin, ShieldCheck } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import Button from "../../components/Button";
import RouteMap from "../../components/map/RouteMap";
import ConfirmPayment from "../../components/rewards/ConfirmPayment";
import RedeemQR from "../../components/rewards/RedeemQR";
import StaticMap from "../../components/map/StaticMap";
import { Place } from "../../constants/places";
import { REWARDS } from "../../constants/rewards";
import { colors } from "../../constants/theme";
import { spendPoints, useWallet } from "../../store/wallet";

// Placeholder backup code, e.g. "FGUUK2V5M". Skips look-alike characters (0/O, 1/I).
const makeCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join(
    ""
  );
};

const HERO_HEIGHT = 440;
const SOFT_BOX = "#F4F4F4";

// Reward ("payment") detail: what it costs and how to redeem it with Waypoints.
export default function RewardDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // ?route=1 comes back from Enable Location so the route map opens straight away.
  const { id, route } = useLocalSearchParams<{ id?: string; route?: string }>();
  const { balance } = useWallet();

  const [saved, setSaved] = useState(false);
  const [showRoute, setShowRoute] = useState(route === "1");
  const [confirming, setConfirming] = useState(false);
  // Backup code for the QR screen after paying; null when not redeeming.
  const [redeemCode, setRedeemCode] = useState<string | null>(null);

  // This screen stays mounted between rewards, so reset it when the reward changes.
  useEffect(() => {
    setSaved(false);
    setConfirming(false);
    setRedeemCode(null);
  }, [id]);

  // Android back button closes "Confirm payment" / the QR screen.
  useEffect(() => {
    if (!confirming && !redeemCode) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      setConfirming(false);
      setRedeemCode(null);
      return true;
    });
    return () => subscription.remove();
  }, [confirming, redeemCode]);

  useEffect(() => {
    setShowRoute(route === "1");
  }, [id, route]);

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

  const reward = REWARDS.find((item) => item.id === id);

  // The partner is the destination on the "Get Directions" map (directions only, no
  // points — spending happens with "Pay with Wpts"). Memoised so the map
  // doesn't restart its location tracking on every render.
  const destination = useMemo<Place | null>(
    () =>
      reward
        ? {
            id: `reward-${reward.id}`,
            name: reward.merchant,
            address: reward.address,
            description: reward.whatYouGet,
            points: 0,
            tags: [reward.category],
            coordinate: reward.coordinate,
          }
        : null,
    [reward]
  );

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.navigate("/rewards");
  };

  if (!reward) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + 12 }]}>
        <StatusBar style="dark" />
        <Pressable accessibilityRole="button" onPress={goBack} style={styles.lightBack}>
          <ArrowLeft size={22} strokeWidth={2} color={colors.black} />
        </Pressable>
        <Text style={styles.missingText}>This reward could not be found</Text>
      </View>
    );
  }

  const getDirections = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status !== "granted") {
      // Location is off: ask for it (no "Maybe Later"), then come back with the map open.
      router.push({
        pathname: "/enable-location",
        params: { required: "1", rewardId: reward.id },
      });
      return;
    }

    setShowRoute(true);
  };

  if (showRoute && destination) {
    return <RouteMap place={destination} onClose={closeRoute} directionsOnly />;
  }

  // "Pay with Wpts" opens the confirm step (it handles not having enough Waypoints).
  const pay = () => {
    if (!reward.available) {
      Alert.alert("Not available", "This reward isn't available right now.");
      return;
    }
    setConfirming(true);
  };

  // Pay creates a pending redemption and shows its QR code. Nothing is deducted yet.
  // TODO: the API should create the pending redemption (and hold the points) and
  // return the real code.
  const confirmPay = () => {
    setConfirming(false);
    setRedeemCode(makeCode());
  };

  // The partner scanning the code is what deducts the Waypoints. Until there is a
  // real scanner + backend, "I'm at the counter continue" stands in for that scan.
  // TODO: replace with the server confirming the scan (push notification / polling).
  const atCounter = () => {
    if (!spendPoints(reward.title, reward.points)) {
      setRedeemCode(null);
      Alert.alert(
        "Not enough Waypoints",
        "Your balance changed, so this redemption couldn't be completed."
      );
      return;
    }

    setRedeemCode(null);
    Alert.alert(
      "Redeemed!",
      `${reward.points} Waypoints were deducted. Enjoy your ${reward.title.toLowerCase()}.`
    );
  };

  if (redeemCode) {
    return (
      <RedeemQR
        qrValue={`wayr:redeem:${reward.id}:${redeemCode}`}
        code={redeemCode}
        merchant={reward.merchant}
        address={reward.address}
        onContinue={atCounter}
        // Leaving before the scan cancels it, so nothing is deducted.
        onBack={() => setRedeemCode(null)}
      />
    );
  }

  if (confirming) {
    return (
      <ConfirmPayment
        cost={reward.points}
        balance={balance}
        onPay={confirmPay}
        onCancel={() => setConfirming(false)}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image
            source={reward.detailImage ?? reward.image}
            contentFit="cover"
            style={styles.heroImage}
          />

          <Svg style={styles.heroShade} width="100%" height="100%">
            <Defs>
              <LinearGradient id="rewardShade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#000000" stopOpacity="0.15" />
                <Stop offset="0.5" stopColor="#000000" stopOpacity="0.05" />
                <Stop offset="1" stopColor="#000000" stopOpacity="0.75" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#rewardShade)" />
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
            <Text style={styles.address}>{reward.address}</Text>
            <Text style={styles.title}>{reward.title.toUpperCase()}</Text>
            <Text style={styles.merchant}>
              at <Text style={styles.merchantName}>{reward.merchant}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.costBox}>
            <View>
              <Text style={styles.costLabel}>Cost</Text>
              <Text style={styles.costValue}>
                <Text style={styles.accent}>{reward.points}</Text> WAYPOINTS
              </Text>
              <Text style={styles.costHint}>Required to Redeem</Text>
            </View>

            <View style={styles.balanceBox}>
              <Text style={styles.balanceLabel}>Your balance</Text>
              <Text style={styles.balanceValue}>
                <Text style={styles.accent}>{balance}</Text> Wpts
              </Text>
            </View>
          </View>

          <Button title="Pay with Wpts" onPress={pay} style={styles.pay} />

          <Text style={styles.heading}>WHAT YOU GET</Text>
          <View style={styles.box}>
            <Text style={styles.boxText}>{reward.whatYouGet}</Text>
          </View>

          <Text style={styles.heading}>HOW TO REDEEM</Text>
          <View style={styles.box}>
            <Text style={styles.boxText}>{reward.howToRedeem}</Text>
          </View>

          <Text style={styles.heading}>HOW WE VALIDATE</Text>
          <View style={[styles.box, styles.steps]}>
            {reward.steps.map((step) => (
              <View key={step} style={styles.step}>
                <CircleCheck size={16} strokeWidth={2} color={colors.brand} />
                <Text style={styles.boxText}>{step}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.heading}>TERMS & CONDITIONS</Text>
          <View style={styles.box}>
            <Text style={styles.boxText}>{reward.terms}</Text>
          </View>

          <Text style={styles.heading}>PARTNER LOCATION</Text>
          <View style={styles.locationCard}>
            <StaticMap coordinate={reward.coordinate} name={reward.merchant} />

            <View style={styles.locationBody}>
              <View style={styles.locationRow}>
                <MapPin size={18} strokeWidth={1.75} color={colors.muted} />
                <Text style={styles.locationText}>{reward.address}</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={getDirections}
                style={({ pressed }) => [styles.directions, pressed && styles.pressed]}
              >
                <Text style={styles.directionsLabel}>Get Directions</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.heading}>INSTANT QR REDEMPTION</Text>
          <View style={[styles.box, styles.qrBox]}>
            <View style={styles.shield}>
              <ShieldCheck size={22} strokeWidth={1.5} color={colors.brand} />
            </View>
            <Text style={[styles.boxText, styles.qrText]}>
              You’ll get a scannable QR code with a backup text code.
            </Text>
          </View>
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
    paddingBottom: 32,
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
    bottom: 24,
  },
  address: {
    fontSize: 13,
    color: colors.white,
  },
  title: {
    marginTop: 8,
    fontSize: 36,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: colors.white,
  },
  merchant: {
    marginTop: 8,
    fontSize: 13,
    color: colors.white,
  },
  merchantName: {
    fontWeight: "700",
  },
  body: {
    paddingHorizontal: 23,
    paddingTop: 22,
  },
  costBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 4,
    backgroundColor: SOFT_BOX,
  },
  costLabel: {
    fontSize: 11,
    color: colors.ink,
  },
  costValue: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: colors.black,
  },
  costHint: {
    marginTop: 6,
    fontSize: 10,
    color: colors.muted,
  },
  accent: {
    color: colors.brand,
  },
  balanceBox: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: colors.black,
  },
  balanceLabel: {
    fontSize: 10,
    color: colors.white,
  },
  balanceValue: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "800",
    color: colors.white,
  },
  pay: {
    height: 52,
    marginTop: 36,
    borderRadius: 10,
  },
  heading: {
    marginTop: 34,
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.2,
    color: colors.ink,
  },
  box: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: SOFT_BOX,
  },
  boxText: {
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.5,
    color: colors.muted,
  },
  steps: {
    gap: 8,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationCard: {
    overflow: "hidden",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  locationBody: {
    padding: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: colors.muted,
  },
  directions: {
    height: 44,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  pressed: {
    opacity: 0.7,
  },
  directionsLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.brand,
  },
  qrBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  shield: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.brand,
    backgroundColor: "rgba(61, 61, 61, 0.35)",
  },
  qrText: {
    flex: 1,
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
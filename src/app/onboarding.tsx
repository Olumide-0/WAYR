import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  FlatList,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import Button from "../components/Button";
import { colors } from "../constants/theme";

// TODO: point this at the first screen after onboarding (sign in / sign up / tabs).
const AFTER_ONBOARDING = "/sign-in" as const;

type Slide = {
  id: string;
  image: ImageSourcePropType;
  titleTop: string;
  titleLead: string;
  titleAccent: string;
  description: string;
  cta: string;
};

const SLIDES: Slide[] = [
  {
    id: "discover",
    image: require("../../assets/images/Onboarding.png"),
    titleTop: "DISCOVER",
    titleLead: "YOUR ",
    titleAccent: "CITY",
    description: "Find Hidden gems and experience places worth exploring",
    cta: "Next",
  },
  {
    id: "earn",
    image: require("../../assets/images/Onboarding-2.png"),
    titleTop: "EARN",
    titleLead: "AS YOU ",
    titleAccent: "EXPLORE",
    description: "Validate your presence at Landmarks to earn Waypointsnot just steps.",
    cta: "Next",
  },
  {
    id: "redeem",
    image: require("../../assets/images/Onboarding-3.png"),
    titleTop: "REDEEM",
    titleLead: "YOUR ",
    titleAccent: "REWARDS",
    description: "Use your Waypoints at partner locations for exclusive experience",
    cta: "Get started",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;

  const finish = () => router.replace(AFTER_ONBOARDING);

  const handleNext = () => {
    if (isLast) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        initialNumToRender={1}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Image
              source={item.image}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              style={styles.background}
            />

            <View style={styles.overlay}>
              <View style={styles.textBlock}>
                <Text style={styles.titleTop}>{item.titleTop}</Text>
                <Text style={styles.titleBottom}>
                  {item.titleLead}
                  <Text style={styles.titleAccent}>{item.titleAccent}</Text>
                </Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>

              <Button title={item.cta} onPress={handleNext} style={styles.cta} />
            </View>
          </View>
        )}
      />

      {!isLast && (
        <Pressable accessibilityRole="button" onPress={finish} style={styles.skip}>
          <Text style={styles.skipLabel}>Skip</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  slide: {
    flex: 1,
    backgroundColor: colors.black,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 53,
    paddingBottom: 74,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  textBlock: {
    alignItems: "center",
  },
  titleTop: {
    fontSize: 44,
    lineHeight: 44,
    fontWeight: "900",
    letterSpacing: -1,
    color: colors.white,
  },
  titleBottom: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: colors.white,
  },
  titleAccent: {
    color: colors.brand,
  },
  description: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 18,
    color: "rgba(255,255,255,0.9)",
    width: 220,
  },
  cta: {
    marginTop: 100,
  },
  skip: {
    position: "absolute",
    top: 78,
    right: 20,
    height: 31,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: colors.white,
  },
  skipLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.black,
  },
});
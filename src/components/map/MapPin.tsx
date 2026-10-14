import { StyleSheet, Text, View } from "react-native";
import { Navigation } from "lucide-react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { colors } from "../../constants/theme";

export const PIN_WIDTH = 30;
export const PIN_HEIGHT = 42;

// Drawn inside a <Marker>, which handles the tap itself.
export function MapPin({ name }: { name: string }) {
  return (
    <View accessibilityLabel={name}>
      <Svg width={PIN_WIDTH} height={PIN_HEIGHT} viewBox="0 0 30 42">
        <Path
          d="M15 42 C15 42 0 25 0 15 A15 15 0 1 1 30 15 C30 25 15 42 15 42 Z"
          fill="#EA4335"
        />
        <Circle cx={15} cy={15} r={5.5} fill={colors.white} />
      </Svg>
    </View>
  );
}

// Rendered in its own <Marker> on the same coordinate as the pin (not tappable).
// Dark label that sits to the right of the pin's head, like the mockup.
export function PlaceCallout({ name }: { name: string }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bubble}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>
    </View>
  );
}

// Blue arrow in a white ring with a soft halo (the user's position).
export function UserPuck() {
  return (
    <View style={styles.puckHalo}>
      <View style={styles.puck}>
        <Navigation size={20} strokeWidth={0} fill={colors.white} color={colors.white} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  puckHalo: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 38,
    backgroundColor: "rgba(26, 163, 245, 0.22)",
  },
  puck: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: "#1A8FF0",
  },
  wrapper: {
    marginLeft: 14,
    marginBottom: 14,
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: 230,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#111111",
  },
  name: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.white,
  },
});
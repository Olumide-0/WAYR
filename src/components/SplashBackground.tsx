import { StyleSheet } from "react-native";
import Svg, { Polygon, Rect } from "react-native-svg";

import { colors } from "../constants/theme";

// Coordinates traced from the Figma "Home" frame (478 x 1035).
const WIDTH = 478;
const HEIGHT = 1035;

export default function SplashBackground() {
  return (
    <Svg
      style={styles.svg}
      width="100%"
      height="100%"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <Rect x={0} y={0} width={WIDTH} height={HEIGHT} fill={colors.splash} />

      {/* top-right wedge */}
      <Polygon points="31,0 478,0 478,146" fill={colors.white} />

      {/* left, upper */}
      <Polygon points="0,242 314,336 0,441" fill={colors.white} />

      {/* right, middle */}
      <Polygon points="478,517 184,619 478,722" fill={colors.white} />

      {/* left, lower */}
      <Polygon points="0,793 314,899 0,994" fill={colors.white} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
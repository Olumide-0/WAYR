import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { colors } from "../constants/theme";

type LocationPinProps = {
  width?: number;
  height?: number;
};

// Cyan-to-blue gradient pin (Enable Location, Validating visit).
export default function LocationPin({ width = 84, height = 132 }: LocationPinProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 60 94">
      <Defs>
        <LinearGradient id="pinGradient" x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#54EEDE" />
          <Stop offset="1" stopColor="#2584CB" />
        </LinearGradient>
      </Defs>

      <Path
        d="M30 94 C30 94 0 58 0 30 A30 30 0 1 1 60 30 C60 58 30 94 30 94 Z"
        fill="url(#pinGradient)"
      />
      <Circle cx={30} cy={34} r={12} fill={colors.white} />
      <Circle cx={30} cy={78} r={4} fill={colors.white} />
    </Svg>
  );
}
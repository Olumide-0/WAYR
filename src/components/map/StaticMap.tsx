import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

import { colors } from "../../constants/theme";
import { MapPin } from "./MapPin";

type StaticMapProps = {
  // [longitude, latitude]
  coordinate: [number, number];
  name: string;
  // Small black tag under the pin, e.g. "+40WP". Optional.
  tag?: string;
  height?: number;
};

// Small, non-interactive map preview with a single pin.
export default function StaticMap({ coordinate, name, tag, height = 160 }: StaticMapProps) {
  const [longitude, latitude] = coordinate;
  const point = { latitude, longitude };

  return (
    <View style={[styles.box, { height }]} pointerEvents="none">
      <MapView
        style={styles.fill}
        liteMode
        initialRegion={{ ...point, latitudeDelta: 0.06, longitudeDelta: 0.06 }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        showsCompass={false}
      >
        <Marker coordinate={point} anchor={{ x: 0.5, y: 1 }}>
          <MapPin name={name} />
        </Marker>
        {tag ? (
          <Marker coordinate={point} anchor={{ x: 0.8, y: -0.1 }}>
            <View style={styles.tag}>
              <Text style={styles.tagLabel}>{tag}</Text>
            </View>
          </Marker>
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.inputBg,
  },
  fill: {
    flex: 1,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: colors.black,
  },
  tagLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
});
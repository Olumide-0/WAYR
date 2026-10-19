import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";

type RedeemQRProps = {
  // Value encoded in the QR code (what the partner scans).
  qrValue: string;
  // Backup text code shown under the QR.
  code: string;
  merchant: string;
  address: string;
  onContinue: () => void;
  onBack: () => void;
};

// "Redeeming" step: QR code + backup code the user shows at the partner's counter.
export default function RedeemQR({
  qrValue,
  code,
  merchant,
  address,
  onContinue,
  onBack,
}: RedeemQRProps) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={styles.back}
        >
          <ArrowLeft size={22} strokeWidth={2} color={colors.ink} />
        </Pressable>

        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            onPress={onContinue}
            style={({ pressed }) => [styles.continue, pressed && styles.pressed]}
          >
            <Text style={styles.continueLabel}>I’m at the counter continue</Text>
          </Pressable>

          <View style={styles.qr} accessibilityLabel={`QR code ${code}`}>
            <QRCode value={qrValue} size={190} color={colors.black} backgroundColor={colors.white} />
          </View>

          <Text style={styles.code} selectable>
            {code}
          </Text>

          <View style={styles.partner}>
            <Text style={styles.merchant}>{merchant}</Text>
            <Text style={styles.address}>{address.toUpperCase()}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: 23,
    paddingTop: 30,
    paddingBottom: 32,
  },
  back: {
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
  card: {
    marginTop: 24,
    padding: 10,
    paddingBottom: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  continue: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.brand,
  },
  continueLabel: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
    color: colors.ink,
  },
  pressed: {
    opacity: 0.8,
  },
  qr: {
    alignItems: "center",
    marginTop: 38,
  },
  code: {
    marginTop: 32,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
    color: colors.ink,
  },
  partner: {
    marginTop: 22,
    paddingHorizontal: 10,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#E6E6E6",
  },
  merchant: {
    fontSize: 11,
    color: colors.ink,
  },
  address: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: colors.black,
  },
});
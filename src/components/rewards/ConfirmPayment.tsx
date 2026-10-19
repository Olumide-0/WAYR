import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";

type ConfirmPaymentProps = {
  cost: number;
  balance: number;
  onPay: () => void;
  onCancel: () => void;
};

const SOFT_BOX = "#E6E6E6";

function Amount({ value }: { value: number }) {
  return (
    <Text style={styles.amount}>
      <Text style={styles.accent}>{value}</Text> WAYPOINTS
    </Text>
  );
}

// "Confirm payment" step shown after tapping "Pay with Wpts" on a reward.
export default function ConfirmPayment({ cost, balance, onPay, onCancel }: ConfirmPaymentProps) {
  const after = balance - cost;
  const canPay = after >= 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onCancel}
          style={styles.back}
        >
          <ArrowLeft size={22} strokeWidth={2} color={colors.ink} />
        </Pressable>

        <Text style={styles.title}>CONFIRM PAYMENT</Text>

        <View style={styles.card}>
          <View style={styles.costBox}>
            <View>
              <Text style={styles.smallLabel}>Cost</Text>
              <View style={styles.costValue}>
                <Amount value={cost} />
              </View>
              <Text style={styles.costHint}>Required to Redeem</Text>
            </View>

            <View style={styles.balanceBox}>
              <Text style={styles.balanceLabel}>Your balance</Text>
              <Text style={styles.balanceValue}>
                <Text style={styles.accent}>{balance}</Text> Wpts
              </Text>
            </View>
          </View>

          <Text style={styles.note}>
            {canPay ? (
              <>
                This will deduct <Text style={styles.noteStrong}>{cost} Waypoints</Text> from
                your balance when the partner scans your code
              </>
            ) : (
              <>
                You need <Text style={styles.noteStrong}>{-after} more Waypoints</Text> for this
                reward
              </>
            )}
          </Text>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.smallLabel}>Cost</Text>
              <Amount value={cost} />
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.smallLabel}>Balance</Text>
              <Amount value={canPay ? after : balance} />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canPay }}
            disabled={!canPay}
            onPress={onPay}
            style={({ pressed }) => [
              styles.pay,
              !canPay && styles.payDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.payLabel}>Pay with Wpts</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
          >
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
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
  title: {
    marginTop: 34,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: colors.ink,
  },
  card: {
    marginTop: 22,
    padding: 6,
    paddingBottom: 18,
    borderRadius: 20,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  costBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    backgroundColor: SOFT_BOX,
  },
  smallLabel: {
    fontSize: 12,
    color: colors.ink,
  },
  costValue: {
    marginTop: 8,
  },
  costHint: {
    marginTop: 6,
    fontSize: 11,
    color: colors.muted,
  },
  amount: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: colors.black,
  },
  accent: {
    color: colors.brand,
  },
  balanceBox: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: colors.black,
  },
  balanceLabel: {
    fontSize: 11,
    color: colors.white,
  },
  balanceValue: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "800",
    color: colors.white,
  },
  note: {
    marginVertical: 20,
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 0.5,
    color: colors.muted,
  },
  noteStrong: {
    fontWeight: "800",
    color: colors.ink,
  },
  summary: {
    gap: 26,
    padding: 14,
    borderRadius: 12,
    backgroundColor: SOFT_BOX,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pay: {
    height: 52,
    marginTop: 26,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.brand,
  },
  payDisabled: {
    backgroundColor: colors.pill,
  },
  payLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  cancel: {
    height: 48,
    marginTop: 10,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  cancelLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.brand,
  },
  pressed: {
    opacity: 0.8,
  },
});
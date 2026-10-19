import { StatusBar } from "expo-status-bar";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";
import { Activity, useWallet } from "../../store/wallet";

const SOFT = "#F4F4F4";

function Points({ value, unit, size = 15 }: { value: number; unit: string; size?: number }) {
  return (
    <Text style={[styles.points, { fontSize: size }]}>
      <Text style={styles.pointsValue}>{value}</Text> {unit}
    </Text>
  );
}

function ActivityRow({ item }: { item: Activity }) {
  const earned = item.type === "earned";
  const Icon = earned ? ArrowUpRight : ArrowDownLeft;

  return (
    <View style={styles.row}>
      <View style={[styles.icon, earned ? styles.iconEarned : styles.iconSpent]}>
        <Icon size={22} strokeWidth={1.75} color={colors.black} />
      </View>

      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title.toUpperCase()}
        </Text>
        <Text style={styles.rowTime}>{item.time}</Text>
      </View>

      <Points value={item.points} unit="WPTS" />
    </View>
  );
}

export default function Wallet() {
  const { balance, activities } = useWallet();

  const earnedRecent = activities.filter((a) => a.type === "earned").reduce(
    (sum, a) => sum + a.points,
    0
  );
  const spentRecent = activities.filter((a) => a.type === "spent").reduce(
    (sum, a) => sum + a.points,
    0
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" />

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.empty}>No activity yet. Go explore!</Text>}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>WALLET</Text>
            <Text style={styles.subtitle}>Your Waypoints balance and activity.</Text>

            <View style={styles.balance}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceValue} numberOfLines={1} adjustsFontSizeToFit>
                <Text style={styles.pointsValue}>{balance}</Text> WAYPOINTS
              </Text>
              <Text style={styles.balanceHint}>
                Keep exploring Waypoints come from real-world moments.
              </Text>
            </View>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Earned (recent)</Text>
                <Points value={earnedRecent} unit="WAYPOINTS" />
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Spent (recent)</Text>
                <Points value={spentRecent} unit="WAYPOINTS" />
              </View>
            </View>

            <Text style={styles.heading}>ACTIVITIES</Text>
          </View>
        }
        renderItem={({ item }) => <ActivityRow item={item} />}
      />
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
    paddingTop: 50,
    paddingBottom: 28,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: colors.black,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 20,
    color: colors.muted,
  },
  balance: {
    marginTop: 28,
    paddingHorizontal: 14,
    paddingVertical: 24,
    borderRadius: 10,
    backgroundColor: colors.black,
  },
  balanceLabel: {
    fontSize: 13,
    color: colors.white,
  },
  balanceValue: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: colors.white,
  },
  balanceHint: {
    marginTop: 12,
    fontSize: 12,
    color: colors.white,
  },
  stats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  stat: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: SOFT,
  },
  statLabel: {
    marginBottom: 6,
    fontSize: 12,
    color: colors.ink,
  },
  points: {
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.black,
  },
  pointsValue: {
    color: colors.brand,
  },
  heading: {
    marginTop: 34,
    marginBottom: 14,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
    color: colors.ink,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: SOFT,
  },
  icon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  iconEarned: {
    backgroundColor: colors.brand,
  },
  iconSpent: {
    backgroundColor: "#C4C4C4",
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.ink,
  },
  rowTime: {
    marginTop: 6,
    fontSize: 12,
    color: colors.ink,
  },
  separator: {
    height: 14,
  },
  empty: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 15,
    color: colors.muted,
  },
});
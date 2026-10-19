import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Bell, Camera, CircleCheck, Gift, Settings } from "lucide-react-native";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";
import { updateProfile, useProfile } from "../../store/profile";
import { Activity, useWallet } from "../../store/wallet";

const SOFT = "#F4F4F4";

function ActivityRow({ item }: { item: Activity }) {
  const visited = item.type === "earned";
  const Icon = visited ? CircleCheck : Gift;

  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Icon size={22} strokeWidth={1.75} color={colors.black} />
      </View>

      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title.toUpperCase()}
        </Text>
        <Text style={styles.rowTime}>{item.time}</Text>
      </View>

      <Text style={styles.points}>
        <Text style={styles.accent}>{item.points}</Text> WPTS
      </Text>
    </View>
  );
}

export default function Profile() {
  const router = useRouter();
  const { activities } = useWallet();
  const profile = useProfile();
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  // Stats come from the same activity list the Wallet uses.
  const landmarksVisited = activities.filter((a) => a.type === "earned").length;
  const rewardsRedeemed = activities.filter((a) => a.type === "spent").length;

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    // TODO: upload the new photo to the user's profile.
    updateProfile({ photo: result.assets[0].uri });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar style="dark" />

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No activity yet. Visit a landmark to get started!</Text>
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>PROFILE</Text>

              <View style={styles.headerButtons}>
                {/* TODO: open notifications. */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Notifications"
                  style={styles.iconButton}
                >
                  <Bell size={24} strokeWidth={1.75} color={colors.black} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Settings"
                  onPress={() => router.navigate("/settings")}
                  style={styles.iconButton}
                >
                  <Settings size={24} strokeWidth={1.75} color={colors.black} />
                </Pressable>
              </View>
            </View>

            <View style={styles.user}>
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  {profile.photo ? (
                    <Image source={{ uri: profile.photo }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.initial}>
                      {(profile.firstName.charAt(0) || "?").toUpperCase()}
                    </Text>
                  )}
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Change profile photo"
                  onPress={pickPhoto}
                  style={styles.camera}
                >
                  <Camera size={18} strokeWidth={1.75} color={colors.black} />
                </Pressable>
              </View>

              <Text style={styles.name}>{fullName}</Text>
              <Text style={styles.email}>{profile.email}</Text>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.navigate("/edit-profile")}
                style={styles.edit}
              >
                <Text style={styles.editLabel}>Edit profile</Text>
              </Pressable>
            </View>

            <Text style={styles.heading}>EXPLORATION STATS</Text>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{landmarksVisited}</Text>
                <Text style={styles.statLabel}>Landmark Visited</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{rewardsRedeemed}</Text>
                <Text style={styles.statLabel}>Rewards Redeemed</Text>
              </View>
            </View>

            <Text style={[styles.heading, styles.activitiesHeading]}>RECENT ACTIVITIES</Text>
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
    paddingTop: 40,
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: colors.black,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.pill,
    backgroundColor: colors.white,
  },
  user: {
    alignItems: "center",
    marginTop: 34,
  },
  avatarRing: {
    width: 132,
    height: 132,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 66,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  avatar: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 60,
    backgroundColor: colors.brand,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  initial: {
    fontSize: 54,
    fontWeight: "900",
    color: colors.black,
  },
  camera: {
    position: "absolute",
    right: -4,
    bottom: 10,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.brand,
    backgroundColor: colors.white,
  },
  name: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
  },
  email: {
    marginTop: 6,
    fontSize: 14,
    color: colors.muted,
  },
  edit: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#ECECEC",
  },
  editLabel: {
    fontSize: 14,
    color: colors.ink,
  },
  heading: {
    marginTop: 40,
    marginBottom: 14,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
    color: colors.ink,
  },
  activitiesHeading: {
    marginTop: 34,
  },
  stats: {
    flexDirection: "row",
    gap: 10,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 10,
    backgroundColor: "#E6E6E6",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.ink,
  },
  statLabel: {
    marginTop: 8,
    fontSize: 12,
    color: colors.ink,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: SOFT,
  },
  icon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: colors.brand,
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
    marginTop: 8,
    fontSize: 12,
    color: colors.ink,
  },
  points: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.black,
  },
  accent: {
    color: colors.brand,
  },
  separator: {
    height: 14,
  },
  empty: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 15,
    color: colors.muted,
  },
});
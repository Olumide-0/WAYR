import { Tabs, useSegments } from "expo-router";
import { Gift, MapIcon, User, Wallet } from "lucide-react-native";

import { colors } from "../../constants/theme";

export default function TabsLayout() {
  // "Nearby places" and "Detail" are hidden tabs, so keep "Explore" highlighted on them.
  const segments = useSegments() as string[];
  const onExploreFlow = segments.includes("nearby") || segments.includes("detail");
  // The reward detail page is a hidden tab too, so keep "Rewards" highlighted on it.
  const onRewardFlow = segments.includes("reward");
  // Edit Profile and Settings are hidden tabs, so keep "Profile" highlighted on them.
  const onProfileFlow = segments.includes("edit-profile") || segments.includes("settings");

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.black,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.inputBorder,
        },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarInactiveTintColor: onExploreFlow ? colors.brand : colors.black,
          tabBarIcon: ({ color }) => <MapIcon size={22} strokeWidth={1.5} color={color} />,
        }}
      />
      <Tabs.Screen name="nearby" options={{ href: null }} />
      <Tabs.Screen name="detail" options={{ href: null }} />
      <Tabs.Screen name="reward" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarInactiveTintColor: onRewardFlow ? colors.brand : colors.black,
          tabBarIcon: ({ color }) => <Gift size={22} strokeWidth={1.5} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color }) => <Wallet size={22} strokeWidth={1.5} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarInactiveTintColor: onProfileFlow ? colors.brand : colors.black,
          tabBarIcon: ({ color }) => <User size={22} strokeWidth={1.5} color={color} />,
        }}
      />
    </Tabs>
  );
}
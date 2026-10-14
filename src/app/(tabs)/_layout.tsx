import { Tabs, useSegments } from "expo-router";
import { Gift, MapIcon, User, Wallet } from "lucide-react-native";

import { colors } from "../../constants/theme";

export default function TabsLayout() {
  // "Nearby places" and "Detail" are hidden tabs, so keep "Explore" highlighted on them.
  const segments = useSegments() as string[];
  const onExploreFlow = segments.includes("nearby") || segments.includes("detail");

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
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
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
          tabBarIcon: ({ color }) => <User size={22} strokeWidth={1.5} color={color} />,
        }}
      />
    </Tabs>
  );
}
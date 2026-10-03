import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, usePathname } from "expo-router";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Today", icon: "⌂", path: "/" },
    { name: "Diary", icon: "▣", path: "/diary" },
    { name: "Progress", icon: "▥", path: "/progress" },
    { name: "Profile", icon: "♙", path: "/profile" },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const active = pathname === item.path;

        return (
          <Pressable
            key={item.name}
            style={styles.item}
            onPress={() => router.replace(item.path as any)}
          >
            <View style={active ? styles.activeIcon : styles.iconContainer}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>

            <Text style={active ? styles.activeLabel : styles.label}>
              {item.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",

    paddingTop: 9,
    paddingBottom: 10,

    borderTopWidth: 1,
    borderTopColor: "#E9E7DF",

    backgroundColor: "#FFFDF7",
  },

  item: {
    width: 65,
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    width: 34,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  activeIcon: {
    width: 34,
    height: 28,
    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#97FF79",
  },

  icon: {
    fontSize: 20,
    color: "#151515",
  },

  activeLabel: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    color: "#151515",
  },

  label: {
    marginTop: 3,
    fontSize: 11,
    color: "#707070",
  },
});

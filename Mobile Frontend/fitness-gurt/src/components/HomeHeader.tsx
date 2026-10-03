import { StyleSheet, Text, View } from "react-native";
import DoodleSun from "./DoodleSun";

type HomeHeaderProps = {
  name: string;
};

export default function HomeHeader({ name }: HomeHeaderProps) {
  const now = new Date();

  // Example: Thu, Oct 1
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Automatic greeting
  const hour = now.getHours();

  let greeting = "Good evening,";

  if (hour < 12) {
    greeting = "Good morning,";
  } else if (hour < 18) {
    greeting = "Good afternoon,";
  }

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{greeting}</Text>

      <View style={styles.nameRow}>
        <Text style={styles.name}>{name}!</Text>

        <DoodleSun size={27} />
      </View>

      <Text style={styles.date}>{formattedDate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  greeting: {
    fontSize: 16,
    color: "#151515",
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  name: {
    fontSize: 28,
    fontWeight: "800",
    color: "#151515",
  },

  date: {
    marginTop: 4,
    fontSize: 12,
    color: "#707070",
  },
});

import { StyleSheet, Text, View } from "react-native";

type CalorieSummaryProps = {
  eaten: number;
  goal: number;
};

export default function CalorieSummary({ eaten, goal }: CalorieSummaryProps) {
  const remaining = Math.max(goal - eaten, 0);

  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.icon}>🍴</Text>

        <View>
          <Text style={styles.number}>{eaten.toLocaleString()}</Text>
          <Text style={styles.label}>Eaten</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.item}>
        <Text style={styles.icon}>🔥</Text>

        <View>
          <Text style={styles.number}>{remaining.toLocaleString()}</Text>
          <Text style={styles.label}>Remaining</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 22,
    marginBottom: 28,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  icon: {
    fontSize: 24,
  },

  number: {
    fontSize: 18,
    fontWeight: "800",
    color: "#151515",
  },

  label: {
    marginTop: 2,
    fontSize: 12,
    color: "#707070",
  },

  divider: {
    width: 1,
    height: 36,
    backgroundColor: "#E3E1D9",
  },
});

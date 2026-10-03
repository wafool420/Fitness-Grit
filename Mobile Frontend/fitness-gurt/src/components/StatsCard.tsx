import { StyleSheet, Text, View } from "react-native";

type StatsCardProps = {
  currentWeight: number | null;
  goalWeight: number | null;
  height: number | null;
};

export default function StatsCard({
  currentWeight,
  goalWeight,
  height,
}: StatsCardProps) {
  let bmi: number | null = null;

  if (currentWeight !== null && height !== null && height > 0) {
    const heightInMeters = height / 100;

    bmi = currentWeight / (heightInMeters * heightInMeters);
  }

  const stats = [
    {
      name: "Current Weight",
      value: currentWeight !== null ? `${currentWeight} kg` : "Not set",
    },
    {
      name: "Goal Weight",
      value: goalWeight !== null ? `${goalWeight} kg` : "Not set",
    },
    {
      name: "Height",
      value: height !== null ? `${height} cm` : "Not set",
    },
    {
      name: "BMI",
      value: bmi !== null ? bmi.toFixed(1) : "Not available",
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Stats</Text>

      <View style={styles.card}>
        {stats.map((stat, index) => (
          <View
            key={stat.name}
            style={[styles.row, index !== stats.length - 1 && styles.divider]}
          >
            <Text style={styles.name}>{stat.name}</Text>

            <Text style={styles.value}>{stat.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },

  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#151515",
    marginBottom: 10,
  },

  card: {
    borderWidth: 1,
    borderColor: "#E9E7DF",
    borderRadius: 18,
    paddingHorizontal: 16,
  },

  row: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#EFEEE8",
  },

  name: {
    flex: 1,
    fontSize: 13,
    color: "#707070",
  },

  value: {
    fontSize: 13,
    fontWeight: "700",
    color: "#151515",
  },
});

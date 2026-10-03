import { StyleSheet, Text, View } from "react-native";

type GoalsCardProps = {
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
  waterGoal: number;
};

export default function GoalsCard({
  calorieGoal,
  proteinGoal,
  carbGoal,
  fatGoal,
  waterGoal,
}: GoalsCardProps) {
  const goals = [
    {
      icon: "🔥",
      name: "Daily Calorie Goal",
      value: `${calorieGoal.toLocaleString()} kcal`,
    },
    {
      icon: "🥩",
      name: "Protein Goal",
      value: `${proteinGoal} g`,
    },
    {
      icon: "🌽",
      name: "Carbs Goal",
      value: `${carbGoal} g`,
    },
    {
      icon: "🥜",
      name: "Fat Goal",
      value: `${fatGoal} g`,
    },
    {
      icon: "💧",
      name: "Water Goal",
      value: `${waterGoal} L`,
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Goals</Text>

      <View style={styles.card}>
        {goals.map((goal, index) => (
          <View
            key={goal.name}
            style={[styles.row, index !== goals.length - 1 && styles.divider]}
          >
            <Text style={styles.icon}>{goal.icon}</Text>

            <Text style={styles.name}>{goal.name}</Text>

            <Text style={styles.value}>{goal.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
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

  icon: {
    width: 30,
    fontSize: 19,
  },

  name: {
    flex: 1,
    fontSize: 13,
    color: "#151515",
  },

  value: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555555",
  },
});

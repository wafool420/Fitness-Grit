import { StyleSheet, Text, View } from "react-native";

type MacroBreakdownProps = {
  protein: number;
  proteinGoal: number;

  carbs: number;
  carbGoal: number;

  fat: number;
  fatGoal: number;

  title?: string;
};

export default function MacroBreakdown({
  protein,
  proteinGoal,
  carbs,
  carbGoal,
  fat,
  fatGoal,
  title = "Macros",
}: MacroBreakdownProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <MacroRow name="Protein" eaten={protein} goal={proteinGoal} />

      <MacroRow name="Carbs" eaten={carbs} goal={carbGoal} />

      <MacroRow name="Fat" eaten={fat} goal={fatGoal} />
    </View>
  );
}

type MacroRowProps = {
  name: string;
  eaten: number;
  goal: number;
};

function MacroRow({ name, eaten, goal }: MacroRowProps) {
  const percentage = goal > 0 ? Math.min((eaten / goal) * 100, 100) : 0;

  return (
    <View style={styles.macro}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroName}>{name}</Text>

        <Text style={styles.macroAmount}>
          {Math.round(eaten)} / {Math.round(goal)} g
        </Text>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
            },
          ]}
        />
      </View>

      <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,

    padding: 18,

    borderWidth: 1,
    borderColor: "#E9E7DF",
    borderRadius: 18,
  },

  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#151515",

    marginBottom: 6,
  },

  macro: {
    marginTop: 18,
  },

  macroHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  macroName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#151515",
  },

  macroAmount: {
    fontSize: 13,
    color: "#707070",
  },

  progressBackground: {
    height: 12,

    marginTop: 9,

    borderRadius: 20,

    backgroundColor: "#EFEEE8",

    overflow: "hidden",
  },

  progressFill: {
    height: "100%",

    borderRadius: 20,

    backgroundColor: "#97FF79",
  },

  percentage: {
    marginTop: 5,

    fontSize: 11,

    color: "#707070",

    textAlign: "right",
  },
});

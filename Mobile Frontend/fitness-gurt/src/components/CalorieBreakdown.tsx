import { StyleSheet, Text, View } from "react-native";

type CalorieBreakdownProps = {
  protein: number;
  carbs: number;
  fat: number;
};

export default function CalorieBreakdown({
  protein,
  carbs,
  fat,
}: CalorieBreakdownProps) {
  // Calories contributed by each macro
  const proteinCalories = protein * 4;

  const carbCalories = carbs * 4;

  const fatCalories = fat * 9;

  const totalMacroCalories = proteinCalories + carbCalories + fatCalories;

  // Calculate percentages
  const proteinPercent =
    totalMacroCalories > 0
      ? Math.round((proteinCalories / totalMacroCalories) * 100)
      : 0;

  const carbPercent =
    totalMacroCalories > 0
      ? Math.round((carbCalories / totalMacroCalories) * 100)
      : 0;

  const fatPercent =
    totalMacroCalories > 0
      ? Math.round((fatCalories / totalMacroCalories) * 100)
      : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calorie Breakdown</Text>

      {/* MACRO BAR */}

      <View style={styles.bar}>
        {proteinCalories > 0 && (
          <View
            style={[
              styles.proteinBar,
              {
                flex: proteinCalories,
              },
            ]}
          />
        )}

        {carbCalories > 0 && (
          <View
            style={[
              styles.carbsBar,
              {
                flex: carbCalories,
              },
            ]}
          />
        )}

        {fatCalories > 0 && (
          <View
            style={[
              styles.fatBar,
              {
                flex: fatCalories,
              },
            ]}
          />
        )}

        {totalMacroCalories === 0 && <View style={styles.emptyBar} />}
      </View>

      {/* PROTEIN */}

      <View style={styles.row}>
        <View style={styles.left}>
          <View style={[styles.dot, styles.proteinDot]} />

          <Text style={styles.name}>Protein</Text>
        </View>

        <Text style={styles.amount}>{Math.round(protein)} g</Text>

        <Text style={styles.percent}>{proteinPercent}%</Text>
      </View>

      {/* CARBS */}

      <View style={styles.row}>
        <View style={styles.left}>
          <View style={[styles.dot, styles.carbsDot]} />

          <Text style={styles.name}>Carbs</Text>
        </View>

        <Text style={styles.amount}>{Math.round(carbs)} g</Text>

        <Text style={styles.percent}>{carbPercent}%</Text>
      </View>

      {/* FAT */}

      <View style={styles.row}>
        <View style={styles.left}>
          <View style={[styles.dot, styles.fatDot]} />

          <Text style={styles.name}>Fat</Text>
        </View>

        <Text style={styles.amount}>{Math.round(fat)} g</Text>

        <Text style={styles.percent}>{fatPercent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    padding: 18,

    borderWidth: 1,
    borderColor: "#E9E7DF",

    borderRadius: 18,
  },

  title: {
    fontSize: 17,
    fontWeight: "800",

    color: "#151515",
  },

  bar: {
    height: 14,

    marginTop: 16,
    marginBottom: 18,

    flexDirection: "row",

    borderRadius: 20,

    overflow: "hidden",

    backgroundColor: "#F0EFE8",
  },

  proteinBar: {
    backgroundColor: "#97FF79",
  },

  carbsBar: {
    backgroundColor: "#FFD95A",
  },

  fatBar: {
    backgroundColor: "#FF8C8C",
  },

  emptyBar: {
    flex: 1,

    backgroundColor: "#F0EFE8",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 12,
  },

  left: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 11,
    height: 11,

    borderRadius: 6,

    marginRight: 9,
  },

  proteinDot: {
    backgroundColor: "#97FF79",
  },

  carbsDot: {
    backgroundColor: "#FFD95A",
  },

  fatDot: {
    backgroundColor: "#FF8C8C",
  },

  name: {
    fontSize: 14,

    color: "#151515",
  },

  amount: {
    width: 65,

    textAlign: "right",

    fontSize: 13,

    color: "#707070",
  },

  percent: {
    width: 48,

    textAlign: "right",

    fontSize: 13,
    fontWeight: "700",

    color: "#151515",
  },
});

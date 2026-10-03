import { StyleSheet, Text, View } from "react-native";

type ChartDay = {
  day: string;
  calories: number;
};

type ProgressChartProps = {
  data: ChartDay[];
  goal: number;
  daysForAverage?: number;
  average?: number;
};

export default function ProgressChart({
  data,
  goal,
  daysForAverage = data.length,
  average,
}: ProgressChartProps) {
  // =====================================================
  // CHART SCALE
  // =====================================================

  const highestCalories = Math.max(
    goal,
    ...data.map((item) => item.calories),
    1,
  );

  // =====================================================
  // WEEK TOTAL
  // =====================================================

  const totalCalories = data.reduce((total, item) => total + item.calories, 0);

  // =====================================================
  // AVERAGE
  // =====================================================

  const averageCalories =
    average !== undefined
      ? average
      : daysForAverage > 0
        ? Math.round(totalCalories / daysForAverage)
        : 0;

  // =====================================================
  // DIFFERENCE FROM GOAL
  // =====================================================

  const dailyDifference = averageCalories - goal;

  // =====================================================
  // UI
  // =====================================================

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {data.map((item) => {
          const barHeight =
            item.calories > 0
              ? Math.max((item.calories / highestCalories) * 130, 4)
              : 0;

          return (
            <View key={item.day} style={styles.barColumn}>
              <View style={styles.barArea}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                    },
                  ]}
                />
              </View>

              <Text style={styles.day}>{item.day}</Text>
            </View>
          );
        })}
      </View>

      {/* SUMMARY */}

      <View style={styles.summary}>
        {/* AVERAGE */}

        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {averageCalories.toLocaleString()}
          </Text>

          <Text style={styles.summaryLabel}>Average</Text>
        </View>

        <View style={styles.divider} />

        {/* GOAL */}

        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{goal.toLocaleString()}</Text>

          <Text style={styles.summaryLabel}>Goal</Text>
        </View>

        <View style={styles.divider} />

        {/* DAILY DIFFERENCE */}

        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {dailyDifference > 0
              ? `+${dailyDifference.toLocaleString()}`
              : dailyDifference.toLocaleString()}
          </Text>

          <Text style={styles.summaryLabel}>Daily Avg</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },

  chart: {
    height: 160,

    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",

    paddingHorizontal: 6,
  },

  barColumn: {
    flex: 1,
    alignItems: "center",
  },

  barArea: {
    height: 130,
    justifyContent: "flex-end",
  },

  bar: {
    width: 24,

    backgroundColor: "#97FF79",

    borderRadius: 8,
  },

  day: {
    marginTop: 8,

    fontSize: 11,

    color: "#707070",
  },

  summary: {
    marginTop: 22,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: "800",

    color: "#151515",
  },

  summaryLabel: {
    marginTop: 3,

    fontSize: 11,

    color: "#707070",
  },

  divider: {
    width: 1,
    height: 32,

    backgroundColor: "#E5E3DB",
  },
});

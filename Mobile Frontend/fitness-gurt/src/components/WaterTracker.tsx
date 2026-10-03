import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

type WaterTrackerProps = {
  drank: number;
  goal: number;
};

export default function WaterTracker({ drank, goal }: WaterTrackerProps) {
  const progress = Math.min(drank / goal, 1);

  // Number of little water indicators
  const totalDots = 10;
  const filledDots = Math.round(progress * totalDots);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Water</Text>

          <Text style={styles.amount}>
            {drank.toFixed(1)} L / {goal.toFixed(1)} L
          </Text>
        </View>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/add-water")}
        >
          <Text style={styles.add}>+</Text>
        </Pressable>
      </View>

      {/* Water progress dots */}
      <View style={styles.waterDots}>
        {Array.from({ length: totalDots }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.waterDot,
              index < filledDots && styles.waterDotFilled,
            ]}
          />
        ))}
      </View>

      <Text style={styles.message}>💧 Keep sipping throughout the day</Text>
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#151515",
  },

  amount: {
    marginTop: 4,
    fontSize: 13,
    color: "#707070",
  },

  addButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#97FF79",
    alignItems: "center",
    justifyContent: "center",
  },

  add: {
    fontSize: 22,
    fontWeight: "500",
    color: "#151515",
    lineHeight: 22,
    textAlign: "center",
    includeFontPadding: false,
    transform: [{ translateY: -3 }],
  },

  waterDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 16,
  },

  waterDot: {
    flex: 1,
    height: 9,
    borderRadius: 10,
    backgroundColor: "#E8E7DF",
  },

  waterDotFilled: {
    backgroundColor: "#79d9ff",
  },

  message: {
    marginTop: 10,
    fontSize: 12,
    color: "#707070",
  },
});

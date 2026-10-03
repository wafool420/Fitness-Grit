import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type CalorieRingProps = {
  eaten: number;
  goal: number;
};

export default function CalorieRing({ eaten, goal }: CalorieRingProps) {
  const size = 180;
  const strokeWidth = 14;

  const radius = (size - strokeWidth) / 2;

  const circumference = 2 * Math.PI * radius;

  const progress = Math.min(eaten / goal, 1);

  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={styles.container}>
      <View style={styles.ring}>
        {/* Doodle accents */}
        <View style={styles.doodles}>
          <View style={[styles.doodleLine, styles.doodle1]} />

          <View style={[styles.doodleLine, styles.doodle2]} />

          <View style={[styles.doodleLine, styles.doodle3]} />

          <View style={[styles.doodleLine, styles.doodle4]} />

          <View style={[styles.doodleLine, styles.doodle5]} />
        </View>

        {/* Calorie ring */}
        <Svg width={size} height={size} style={[styles.svg, styles.rotatedSvg]}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E8E7DF"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#97FF79"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>

        {/* Center text */}
        <View style={styles.textContainer}>
          <Text style={styles.calories}>{eaten.toLocaleString()}</Text>

          <Text style={styles.goal}>of {goal.toLocaleString()} kcal</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },

  ring: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },

  svg: {
    position: "absolute",
  },

  rotatedSvg: {
    transform: [
      {
        rotate: "-90deg",
      },
    ],
  },

  textContainer: {
    alignItems: "center",
  },

  calories: {
    fontSize: 34,
    fontWeight: "800",
    color: "#151515",
  },

  goal: {
    marginTop: 3,
    fontSize: 13,
    color: "#707070",
  },

  // Doodles
  doodles: {
    position: "absolute",
    width: 220,
    height: 200,
  },

  doodleLine: {
    position: "absolute",
    width: 18,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#97FF79",
  },

  doodle1: {
    left: 0,
    top: 65,
    transform: [
      {
        rotate: "-10deg",
      },
    ],
  },

  doodle2: {
    left: 5,
    top: 82,
    width: 12,
    transform: [
      {
        rotate: "12deg",
      },
    ],
  },

  doodle3: {
    left: 15,
    top: 48,
    width: 9,
    transform: [
      {
        rotate: "-55deg",
      },
    ],
  },

  doodle4: {
    right: 4,
    top: 45,
    transform: [
      {
        rotate: "55deg",
      },
    ],
  },

  doodle5: {
    right: 0,
    top: 65,
    width: 12,
    transform: [
      {
        rotate: "10deg",
      },
    ],
  },
});

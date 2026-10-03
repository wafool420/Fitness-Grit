import { Pressable, StyleSheet, Text, View } from "react-native";

type DiaryHeaderProps = {
  selectedDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
};

export default function DiaryHeader({
  selectedDate,
  onPreviousDay,
  onNextDay,
}: DiaryHeaderProps) {
  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Check whether selectedDate is today
  const today = new Date();

  const isToday =
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getDate() === today.getDate();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diary</Text>

      <View style={styles.dateRow}>
        <Pressable style={styles.arrowButton} onPress={onPreviousDay}>
          <Text style={styles.arrow}>‹</Text>
        </Pressable>

        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formattedDate}</Text>

          {isToday && <Text style={styles.today}>Today</Text>}
        </View>

        <Pressable style={styles.arrowButton} onPress={onNextDay}>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#151515",
  },

  dateRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },

  dateContainer: {
    alignItems: "center",
    minWidth: 110,
    minHeight: 34,
  },

  date: {
    fontSize: 14,
    fontWeight: "600",
    color: "#151515",
  },

  today: {
    marginTop: 2,
    fontSize: 11,
    color: "#707070",
  },

  arrowButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  arrow: {
    fontSize: 30,
    lineHeight: 30,
    color: "#151515",
  },
});

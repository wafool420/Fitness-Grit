import { Pressable, StyleSheet, Text, View } from "react-native";

type DiaryMealSectionProps = {
  title: string;
  calories: number;
  children: React.ReactNode;
  onAddFood: () => void;
};

export default function DiaryMealSection({
  title,
  calories,
  children,
  onAddFood,
}: DiaryMealSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.right}>
          <Text style={styles.calories}>{calories} kcal</Text>

          <Pressable style={styles.addButton} onPress={onAddFood}>
            <Text style={styles.add}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.foods}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },

  header: {
    minHeight: 38,
    paddingHorizontal: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#F1EFE7",
    borderRadius: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: "800",
    color: "#151515",
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  calories: {
    fontSize: 12,
    color: "#707070",
  },

  addButton: {
    width: 25,
    height: 25,
    borderRadius: 9,

    backgroundColor: "#97FF79",

    alignItems: "center",
    justifyContent: "center",
  },

  add: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: "600",
    color: "#151515",

    includeFontPadding: false,
    transform: [{ translateY: -2 }],
  },

  foods: {
    paddingTop: 4,
  },
});

import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

type MealRowProps = {
  name: string;
  calories: number;
  icon: string;
};

export default function MealRow({ name, calories, icon }: MealRowProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.calories}>{calories.toLocaleString()} kcal</Text>
      </View>

      <Pressable
        style={styles.addButton}
        onPress={() =>
          router.push({
            pathname: "/add-food",
            params: { meal: name },
          })
        }
      >
        <Text style={styles.add}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 64,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E9E7DF",
  },

  icon: {
    width: 48,
    fontSize: 30,
    textAlign: "center",
  },

  info: {
    flex: 1,
    marginLeft: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#151515",
  },

  calories: {
    marginTop: 3,
    fontSize: 13,
    color: "#707070",
  },

  addButton: {
    width: 34,
    height: 34,
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
});

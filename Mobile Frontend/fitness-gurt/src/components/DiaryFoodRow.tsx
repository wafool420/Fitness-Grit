import { Pressable, StyleSheet, Text, View } from "react-native";

type DiaryFoodRowProps = {
  icon: string;
  name: string;
  serving: string;
  calories: number;
  onMore: () => void;
};

export default function DiaryFoodRow({
  icon,
  name,
  serving,
  calories,
  onMore,
}: DiaryFoodRowProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>

        <Text style={styles.details}>
          {serving} · {calories} kcal
        </Text>
      </View>

      <Pressable style={styles.moreButton} onPress={onMore}>
        <Text style={styles.more}>•••</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 58,
    paddingVertical: 7,
  },

  icon: {
    width: 46,
    fontSize: 28,
    textAlign: "center",
  },

  info: {
    flex: 1,
    marginLeft: 8,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#151515",
  },

  details: {
    marginTop: 3,
    fontSize: 12,
    color: "#707070",
  },

  moreButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  more: {
    fontSize: 15,
    fontWeight: "700",
    color: "#707070",
  },
});

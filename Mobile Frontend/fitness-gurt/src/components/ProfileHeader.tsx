import { Pressable, StyleSheet, Text, View } from "react-native";

import { router } from "expo-router";

type ProfileHeaderProps = {
  name: string;
  email: string;
};

export default function ProfileHeader({ name, email }: ProfileHeaderProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "U";

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>

        <Text style={styles.email}>{email}</Text>
      </View>

      <Pressable
        style={styles.editButton}
        onPress={() => router.push("/edit-profile")}
      >
        <Text style={styles.editText}>Edit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#97FF79",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#151515",
  },

  info: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#151515",
  },

  email: {
    marginTop: 3,
    fontSize: 12,
    color: "#707070",
  },

  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,

    borderWidth: 1,
    borderColor: "#E2E0D8",
    borderRadius: 12,
  },

  editText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#151515",
  },
});

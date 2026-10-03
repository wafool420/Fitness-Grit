import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { router, useFocusEffect } from "expo-router";

import { API_BASE_URL } from "../utils/api";

import { useCallback, useState } from "react";

import { getToken } from "../utils/authStorage";

import BottomNav from "../components/BottomNav";
import ProfileHeader from "../components/ProfileHeader";
import GoalsCard from "../components/GoalsCard";
import StatsCard from "../components/StatsCard";

type UserProfile = {
  name: string;
  email: string;

  height: number | null;
  weight: number | null;
  target_weight: number | null;

  activity_level: string;
  goal: string;

  calorie_goal: number;
  protein_goal: number;
  carb_goal: number;
  fat_goal: number;
  water_goal: number;
};

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const loadProfile = async () => {
    try {
      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Could not load profile: ${response.status}`);
      }

      const data = await response.json();

      setProfile(data);
    } catch (error) {
      console.error("Could not load profile:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerSpacer} />

          <Text style={styles.title}>Profile</Text>

          <Pressable
            style={styles.settingsButton}
            onPress={() => router.push("/settings")}
          >
            <Text style={styles.settingsIcon}>⚙</Text>
          </Pressable>
        </View>

        <ProfileHeader name={profile.name} email={profile.email} />

        <GoalsCard
          calorieGoal={profile.calorie_goal}
          proteinGoal={profile.protein_goal}
          carbGoal={profile.carb_goal}
          fatGoal={profile.fat_goal}
          waterGoal={profile.water_goal}
        />

        <StatsCard
          currentWeight={profile.weight}
          goalWeight={profile.target_weight}
          height={profile.height}
        />
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF7",
  },

  loadingContainer: {
    flex: 1,

    backgroundColor: "#FFFDF7",

    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontSize: 14,
    color: "#707070",
  },

  scroll: {
    flex: 1,
  },

  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",

    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerSpacer: {
    width: 40,
    height: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#151515",
  },

  settingsButton: {
    width: 40,
    height: 40,

    alignItems: "center",
    justifyContent: "center",
  },

  settingsIcon: {
    fontSize: 23,
    color: "#151515",
  },
});

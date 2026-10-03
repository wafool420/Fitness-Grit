import { useCallback, useState } from "react";

import { ScrollView, StyleSheet, View } from "react-native";

import { API_BASE_URL } from "../utils/api";

import { getToken } from "../utils/authStorage";

import { router, useFocusEffect } from "expo-router";

import HomeHeader from "../components/HomeHeader";
import CalorieRing from "../components/CalorieRing";
import CalorieSummary from "../components/CalorieSummary";
import MealRow from "../components/MealRow";
import WaterTracker from "../components/WaterTracker";
import BottomNav from "../components/BottomNav";

type DiaryEntry = {
  id: number;

  food: number;
  food_name: string;

  food_calories: number;
  food_serving_size: number;
  food_serving_unit: string;

  food_protein: number;
  food_carbs: number;
  food_fat: number;

  meal: string;
  amount: number;

  date: string;
  created_at: string;
};

type WaterEntry = {
  id: number;
  amount: number;
  date: string;
  created_at: string;
};

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

export default function Index() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);

  const [profile, setProfile] = useState<UserProfile | null>(null);

  // =====================================================
  // TODAY'S DATE
  // =====================================================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // LOAD PROFILE
  // =====================================================

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

  // =====================================================
  // LOAD DIARY
  // =====================================================

  const loadDiary = async () => {
    try {
      const today = getTodayDate();

      const token = await getToken();

      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/diary/?date=${today}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Could not load diary: ${response.status}`);
      }

      const data = await response.json();

      setEntries(data);
    } catch (error) {
      console.error("Could not load diary:", error);
    }
  };

  // =====================================================
  // LOAD WATER
  // =====================================================

  const loadWater = async () => {
    try {
      const today = getTodayDate();

      const token = await getToken();

      if (!token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/water/?date=${today}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Could not load water: ${response.status}`);
      }

      const data = await response.json();

      setWaterEntries(data);
    } catch (error) {
      console.error("Could not load water:", error);
    }
  };

  // =====================================================
  // REFRESH TODAY
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadDiary();
      loadWater();
    }, []),
  );

  // =====================================================
  // CALORIE CALCULATIONS
  // =====================================================

  const calculateCalories = (entry: DiaryEntry) => {
    const multiplier = entry.amount / entry.food_serving_size;

    return Math.round(entry.food_calories * multiplier);
  };

  const calculateMealCalories = (meal: string) => {
    return entries
      .filter((entry) => entry.meal === meal)
      .reduce((total, entry) => total + calculateCalories(entry), 0);
  };

  const breakfastCalories = calculateMealCalories("Breakfast");

  const lunchCalories = calculateMealCalories("Lunch");

  const snacksCalories = calculateMealCalories("Snacks");

  const dinnerCalories = calculateMealCalories("Dinner");

  const totalCalories =
    breakfastCalories + lunchCalories + snacksCalories + dinnerCalories;

  // =====================================================
  // WATER CALCULATION
  // =====================================================

  const totalWaterMl = waterEntries.reduce(
    (total, entry) => total + entry.amount,
    0,
  );

  const totalWater = totalWaterMl / 1000;

  // =====================================================
  // USER GOALS
  // =====================================================

  const calorieGoal = profile?.calorie_goal ?? 2000;

  const waterGoal = profile?.water_goal ?? 2.5;

  // =====================================================
  // UI
  // =====================================================

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader name={profile?.name || "User"} />

        <CalorieRing eaten={totalCalories} goal={calorieGoal} />

        <CalorieSummary eaten={totalCalories} goal={calorieGoal} />

        <MealRow name="Breakfast" calories={breakfastCalories} icon="🍳" />

        <MealRow name="Lunch" calories={lunchCalories} icon="🍱" />

        <MealRow name="Snacks" calories={snacksCalories} icon="🍌" />

        <MealRow name="Dinner" calories={dinnerCalories} icon="🍲" />

        <WaterTracker drank={totalWater} goal={waterGoal} />
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFDF7",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFDF7",
  },

  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",

    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 40,
  },
});

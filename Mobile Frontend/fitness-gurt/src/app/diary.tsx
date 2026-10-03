import { useCallback, useState } from "react";

import { API_BASE_URL } from "../utils/api";

import { ScrollView, StyleSheet, Text, View } from "react-native";

import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import DiaryHeader from "../components/DiaryHeader";
import BottomNav from "../components/BottomNav";
import DiaryMealSection from "../components/DiaryMealSection";
import DiaryFoodRow from "../components/DiaryFoodRow";

import { getToken } from "../utils/authStorage";

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

export default function Diary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  const [loading, setLoading] = useState(true);

  const params = useLocalSearchParams();

  // =====================================================
  // INITIAL DATE
  // =====================================================

  const getInitialDate = () => {
    if (
      typeof params.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(params.date)
    ) {
      const [year, month, day] = params.date.split("-").map(Number);

      return new Date(year, month - 1, day);
    }

    return new Date();
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate);

  // =====================================================
  // FORMAT DATE FOR DJANGO
  // =====================================================

  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // LOAD DIARY
  // =====================================================

  const loadDiary = async (date: Date) => {
    try {
      setLoading(true);

      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const formattedDate = formatDateForAPI(date);

      const response = await fetch(
        `${API_BASE_URL}/diary/?date=${formattedDate}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Could not load diary: ${response.status}`);
      }

      const data = await response.json();

      setEntries(data);
    } catch (error) {
      console.error("Could not load diary:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DATE NAVIGATION
  // =====================================================

  const goToPreviousDay = () => {
    setSelectedDate((currentDate) => {
      const previousDate = new Date(currentDate);

      previousDate.setDate(previousDate.getDate() - 1);

      return previousDate;
    });
  };

  const goToNextDay = () => {
    setSelectedDate((currentDate) => {
      const nextDate = new Date(currentDate);

      nextDate.setDate(nextDate.getDate() + 1);

      return nextDate;
    });
  };

  // =====================================================
  // OPEN DIARY ENTRY
  // =====================================================

  const openDiaryEntry = (entry: DiaryEntry) => {
    router.push({
      pathname: "/diary-entry",

      params: {
        id: entry.id.toString(),

        name: entry.food_name,

        amount: entry.amount.toString(),

        servingSize: entry.food_serving_size.toString(),

        servingUnit: entry.food_serving_unit,

        calories: entry.food_calories.toString(),

        protein: entry.food_protein.toString(),

        carbs: entry.food_carbs.toString(),

        fat: entry.food_fat.toString(),

        meal: entry.meal,

        date: entry.date,
      },
    });
  };

  // =====================================================
  // REFRESH DIARY
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      loadDiary(selectedDate);
    }, [selectedDate]),
  );

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const getMealEntries = (meal: string) => {
    return entries.filter((entry) => entry.meal === meal);
  };

  const calculateCalories = (entry: DiaryEntry) => {
    const multiplier = entry.amount / entry.food_serving_size;

    return Math.round(entry.food_calories * multiplier);
  };

  const calculateMealCalories = (meal: string) => {
    return getMealEntries(meal).reduce(
      (total, entry) => total + calculateCalories(entry),

      0,
    );
  };

  // =====================================================
  // RENDER FOODS
  // =====================================================

  const renderMealFoods = (meal: string) => {
    const mealEntries = getMealEntries(meal);

    return mealEntries.map((entry) => (
      <DiaryFoodRow
        key={entry.id}
        icon="🍽️"
        name={entry.food_name}
        serving={`${entry.amount} ${entry.food_serving_unit}`}
        calories={calculateCalories(entry)}
        onMore={() => openDiaryEntry(entry)}
      />
    ));
  };

  // =====================================================
  // ADD FOOD
  // =====================================================

  const openAddFood = (meal: string) => {
    router.push({
      pathname: "/add-food",

      params: {
        meal: meal,

        date: formatDateForAPI(selectedDate),
      },
    });
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <DiaryHeader
          selectedDate={selectedDate}
          onPreviousDay={goToPreviousDay}
          onNextDay={goToNextDay}
        />

        {/* Loading */}

        {loading && <Text style={styles.loading}>Loading diary...</Text>}

        {/* Meals */}

        {!loading && (
          <>
            {/* Breakfast */}

            <DiaryMealSection
              title="Breakfast"
              calories={calculateMealCalories("Breakfast")}
              onAddFood={() => openAddFood("Breakfast")}
            >
              {renderMealFoods("Breakfast")}
            </DiaryMealSection>

            {/* Lunch */}

            <DiaryMealSection
              title="Lunch"
              calories={calculateMealCalories("Lunch")}
              onAddFood={() => openAddFood("Lunch")}
            >
              {renderMealFoods("Lunch")}
            </DiaryMealSection>

            {/* Snacks */}

            <DiaryMealSection
              title="Snacks"
              calories={calculateMealCalories("Snacks")}
              onAddFood={() => openAddFood("Snacks")}
            >
              {renderMealFoods("Snacks")}
            </DiaryMealSection>

            {/* Dinner */}

            <DiaryMealSection
              title="Dinner"
              calories={calculateMealCalories("Dinner")}
              onAddFood={() => openAddFood("Dinner")}
            >
              {renderMealFoods("Dinner")}
            </DiaryMealSection>
          </>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF7",
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

  loading: {
    marginTop: 30,

    textAlign: "center",

    fontSize: 13,
    color: "#707070",
  },
});

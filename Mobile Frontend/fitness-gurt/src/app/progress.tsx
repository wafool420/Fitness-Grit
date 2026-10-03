import { useCallback, useState } from "react";

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { API_BASE_URL } from "../utils/api";

import { router, useFocusEffect } from "expo-router";

import { getToken } from "../utils/authStorage";

import CalorieBreakdown from "../components/CalorieBreakdown";
import BottomNav from "../components/BottomNav";
import ProgressChart from "../components/ProgressChart";
import MacroBreakdown from "../components/MacroBreakdown";

type ProgressTab = "Calories" | "Macros" | "Water";

type Period = "Week" | "Month" | "Year";

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

type ChartDay = {
  day: string;
  date: string;
  calories: number;
};

type WaterEntry = {
  id: number;
  amount: number;
  date: string;
  created_at: string;
};

export default function Progress() {
  const [activeTab, setActiveTab] = useState<ProgressTab>("Calories");

  const [activePeriod, setActivePeriod] = useState<Period>("Week");

  // Today's diary entries
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  // Current week's diary entries
  const [weekEntries, setWeekEntries] = useState<DiaryEntry[]>([]);

  // Current month's diary entries
  const [monthEntries, setMonthEntries] = useState<DiaryEntry[]>([]);

  // Current year's diary entries
  const [yearEntries, setYearEntries] = useState<DiaryEntry[]>([]);

  // User profile/goals
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [weekWaterEntries, setWeekWaterEntries] = useState<WaterEntry[]>([]);

  const [monthWaterEntries, setMonthWaterEntries] = useState<WaterEntry[]>([]);

  const [yearWaterEntries, setYearWaterEntries] = useState<WaterEntry[]>([]);
  // =====================================================
  // DATE HELPERS
  // =====================================================

  const formatDate = (date: Date) => {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getTodayDate = () => {
    return formatDate(new Date());
  };

  // =====================================================
  // CURRENT WEEK
  // Monday -> Sunday
  // =====================================================

  const getCurrentWeek = () => {
    const today = new Date();

    const currentDay = today.getDay();

    // JavaScript:
    // Sunday = 0
    // Monday = 1
    // Tuesday = 2
    // ...
    // Saturday = 6

    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;

    const monday = new Date(today);

    monday.setHours(0, 0, 0, 0);

    monday.setDate(today.getDate() - daysSinceMonday);

    const days: ChartDay[] = [];

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let index = 0; index < 7; index++) {
      const date = new Date(monday);

      date.setDate(monday.getDate() + index);

      days.push({
        day: dayNames[index],

        date: formatDate(date),

        calories: 0,
      });
    }

    return days;
  };

  // =====================================================
  // CURRENT MONTH
  // =====================================================

  const getCurrentMonth = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);

    const lastDay = new Date(year, month + 1, 0);

    return {
      startDate: formatDate(firstDay),
      endDate: formatDate(lastDay),
      daysInMonth: lastDay.getDate(),
    };
  };

  // =====================================================
  // CURRENT YEAR
  // =====================================================

  const getCurrentYear = () => {
    const today = new Date();

    const year = today.getFullYear();

    const firstDay = new Date(year, 0, 1);

    const lastDay = new Date(year, 11, 31);

    return {
      year,
      startDate: formatDate(firstDay),
      endDate: formatDate(lastDay),
    };
  };

  // =====================================================
  // DAYS ELAPSED THIS WEEK
  // =====================================================

  const getDaysElapsedThisWeek = () => {
    const today = new Date();

    const currentDay = today.getDay();

    // Monday = 1
    // Tuesday = 2
    // Wednesday = 3
    // Thursday = 4
    // Friday = 5
    // Saturday = 6
    // Sunday = 7

    if (currentDay === 0) {
      return 7;
    }

    return currentDay;
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
  // LOAD TODAY'S DIARY
  // Used by Today's Macros
  // =====================================================

  const loadDiary = async () => {
    try {
      const token = await getToken();

      if (!token) {
        return;
      }

      const today = getTodayDate();

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
  // LOAD CURRENT WEEK
  // =====================================================

  const loadWeekDiary = async () => {
    try {
      const token = await getToken();

      if (!token) {
        return;
      }

      const week = getCurrentWeek();

      const startDate = week[0].date;

      const endDate = week[6].date;

      const response = await fetch(
        `${API_BASE_URL}/diary/?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Could not load week: ${response.status}`);
      }

      const data = await response.json();

      setWeekEntries(data);
    } catch (error) {
      console.error("Could not load weekly diary:", error);
    }
  };

  // =====================================================
  // LOAD CURRENT MONTH
  // =====================================================

  const loadMonthDiary = async () => {
    try {
      const token = await getToken();

      if (!token) {
        return;
      }

      const month = getCurrentMonth();

      const response = await fetch(
        `${API_BASE_URL}/diary/?start_date=${month.startDate}&end_date=${month.endDate}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Could not load month: ${response.status}`);
      }

      const data = await response.json();

      setMonthEntries(data);
    } catch (error) {
      console.error("Could not load monthly diary:", error);
    }
  };

  // =====================================================
  // LOAD CURRENT YEAR
  // =====================================================

  const loadYearDiary = async () => {
    try {
      const token = await getToken();

      if (!token) {
        return;
      }

      const year = getCurrentYear();

      const response = await fetch(
        `${API_BASE_URL}/diary/?start_date=${year.startDate}&end_date=${year.endDate}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Could not load year: ${response.status}`);
      }

      const data = await response.json();

      setYearEntries(data);
    } catch (error) {
      console.error("Could not load yearly diary:", error);
    }
  };

  // =====================================================
  // LOAD WATER BY DATE RANGE
  // =====================================================

  const loadWaterRange = async (
    startDate: string,
    endDate: string,
    setter: React.Dispatch<React.SetStateAction<WaterEntry[]>>,
  ) => {
    try {
      const token = await getToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/water/?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Could not load water: ${response.status}`);
      }

      const data = await response.json();

      setter(data);
    } catch (error) {
      console.error("Could not load water:", error);
    }
  };

  // =====================================================
  // LOAD CURRENT WEEK WATER
  // =====================================================

  const loadWeekWater = async () => {
    const week = getCurrentWeek();

    const startDate = week[0].date;
    const endDate = week[6].date;

    await loadWaterRange(startDate, endDate, setWeekWaterEntries);
  };

  // =====================================================
  // LOAD CURRENT MONTH WATER
  // =====================================================

  const loadMonthWater = async () => {
    const month = getCurrentMonth();

    await loadWaterRange(month.startDate, month.endDate, setMonthWaterEntries);
  };

  // =====================================================
  // LOAD CURRENT YEAR WATER
  // =====================================================

  const loadYearWater = async () => {
    const year = getCurrentYear();

    await loadWaterRange(year.startDate, year.endDate, setYearWaterEntries);
  };

  // =====================================================
  // REFRESH WHEN SCREEN OPENS
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      loadProfile();

      loadDiary();

      loadWeekDiary();
      loadMonthDiary();
      loadYearDiary();

      loadWeekWater();
      loadMonthWater();
      loadYearWater();
    }, []),
  );

  // =====================================================
  // CALORIE CALCULATION
  // =====================================================

  const calculateCalories = (entry: DiaryEntry) => {
    if (!entry.food_serving_size || entry.food_serving_size <= 0) {
      return 0;
    }

    const multiplier = entry.amount / entry.food_serving_size;

    return entry.food_calories * multiplier;
  };

  // =====================================================
  // COUNT TRACKED DAYS
  // =====================================================

  const countTrackedDays = (diaryEntries: DiaryEntry[]) => {
    const trackedDates = new Set(diaryEntries.map((entry) => entry.date));

    return trackedDates.size;
  };

  // =====================================================
  // BUILD WEEK CHART
  // =====================================================

  const weekData = getCurrentWeek().map((day) => {
    const dayEntries = weekEntries.filter((entry) => entry.date === day.date);

    const calories = dayEntries.reduce(
      (total, entry) => total + calculateCalories(entry),
      0,
    );

    return {
      day: day.day,

      calories: Math.round(calories),
    };
  });

  // =====================================================
  // BUILD MONTH CHART
  // =====================================================

  // =====================================================
  // BUILD MONTH CHART
  // =====================================================

  const buildMonthData = () => {
    const month = getCurrentMonth();

    const today = new Date();
    const todayDay = today.getDate();

    const groups = [
      {
        day: "1-7",
        start: 1,
        end: 7,
      },
      {
        day: "8-14",
        start: 8,
        end: 14,
      },
      {
        day: "15-21",
        start: 15,
        end: 21,
      },
      {
        day: "22-28",
        start: 22,
        end: 28,
      },
      {
        day: `29-${month.daysInMonth}`,
        start: 29,
        end: month.daysInMonth,
      },
    ];

    return groups.map((group) => {
      const groupEntries = monthEntries.filter((entry) => {
        const entryDay = Number(entry.date.split("-")[2]);

        return entryDay >= group.start && entryDay <= group.end;
      });

      const totalCalories = groupEntries.reduce(
        (total, entry) => total + calculateCalories(entry),
        0,
      );

      const trackedDays = countTrackedDays(groupEntries);

      const averageCalories =
        trackedDays > 0 ? Math.round(totalCalories / trackedDays) : 0;

      return {
        day: group.day,
        calories: averageCalories,
      };
    });
  };

  const monthData = buildMonthData();

  // =====================================================
  // BUILD YEAR CHART
  // =====================================================

  const buildYearData = () => {
    const today = new Date();

    const currentMonth = today.getMonth();

    const currentDay = today.getDate();

    const currentYear = today.getFullYear();

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return monthNames.map((monthName, monthIndex) => {
      const monthEntries = yearEntries.filter((entry) => {
        const entryDate = new Date(`${entry.date}T00:00:00`);

        return entryDate.getMonth() === monthIndex;
      });

      const totalCalories = monthEntries.reduce(
        (total, entry) => total + calculateCalories(entry),
        0,
      );

      const trackedDays = countTrackedDays(monthEntries);

      const averageCalories =
        trackedDays > 0 ? Math.round(totalCalories / trackedDays) : 0;

      return {
        day: monthName,
        calories: averageCalories,
      };
    });
  };

  const yearData = buildYearData();

  // =====================================================
  // MACRO CALCULATION
  // =====================================================

  const calculateMacro = (
    entry: DiaryEntry,

    macro: "food_protein" | "food_carbs" | "food_fat",
  ) => {
    if (!entry.food_serving_size || entry.food_serving_size <= 0) {
      return 0;
    }

    const multiplier = entry.amount / entry.food_serving_size;

    return entry[macro] * multiplier;
  };

  const totalProtein = entries.reduce(
    (total, entry) => total + calculateMacro(entry, "food_protein"),
    0,
  );

  const totalCarbs = entries.reduce(
    (total, entry) => total + calculateMacro(entry, "food_carbs"),
    0,
  );

  const totalFat = entries.reduce(
    (total, entry) => total + calculateMacro(entry, "food_fat"),
    0,
  );

  // =====================================================
  // WEEKLY MACRO CALCULATION
  // Used by Calorie Breakdown
  // =====================================================

  const weekProtein = weekEntries.reduce(
    (total, entry) => total + calculateMacro(entry, "food_protein"),
    0,
  );

  const weekCarbs = weekEntries.reduce(
    (total, entry) => total + calculateMacro(entry, "food_carbs"),
    0,
  );

  const weekFat = weekEntries.reduce(
    (total, entry) => total + calculateMacro(entry, "food_fat"),
    0,
  );

  // =====================================================
  // MONTHLY MACRO CALCULATION
  // =====================================================

  const monthProtein = monthEntries.reduce(
    (total, entry) => total + calculateMacro(entry, "food_protein"),
    0,
  );

  const monthCarbs = monthEntries.reduce(
    (total, entry) => total + calculateMacro(entry, "food_carbs"),
    0,
  );

  const monthFat = monthEntries.reduce(
    (total, entry) => total + calculateMacro(entry, "food_fat"),
    0,
  );

  // =====================================================
  // YEARLY MACRO CALCULATION
  // =====================================================

  const yearProtein = yearEntries.reduce(
    (total, entry) => total + calculateMacro(entry, "food_protein"),
    0,
  );

  const yearCarbs = yearEntries.reduce(
    (total, entry) => total + calculateMacro(entry, "food_carbs"),
    0,
  );

  const yearFat = yearEntries.reduce(
    (total, entry) => total + calculateMacro(entry, "food_fat"),
    0,
  );

  // =====================================================
  // AVERAGE DAILY MACROS
  // =====================================================

  const calculateAverageMacros = (diaryEntries: DiaryEntry[]) => {
    const trackedDays = countTrackedDays(diaryEntries);

    if (trackedDays === 0) {
      return {
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    }

    const protein = diaryEntries.reduce(
      (total, entry) => total + calculateMacro(entry, "food_protein"),
      0,
    );

    const carbs = diaryEntries.reduce(
      (total, entry) => total + calculateMacro(entry, "food_carbs"),
      0,
    );

    const fat = diaryEntries.reduce(
      (total, entry) => total + calculateMacro(entry, "food_fat"),
      0,
    );

    return {
      protein: protein / trackedDays,

      carbs: carbs / trackedDays,

      fat: fat / trackedDays,
    };
  };

  const weekMacroAverage = calculateAverageMacros(weekEntries);

  const monthMacroAverage = calculateAverageMacros(monthEntries);

  const yearMacroAverage = calculateAverageMacros(yearEntries);

  // =====================================================
  // WATER AVERAGES
  // =====================================================

  const calculateAverageWater = (waterEntries: WaterEntry[]) => {
    if (waterEntries.length === 0) {
      return 0;
    }

    const dailyTotals: Record<string, number> = {};

    waterEntries.forEach((entry) => {
      if (!dailyTotals[entry.date]) {
        dailyTotals[entry.date] = 0;
      }

      dailyTotals[entry.date] += Number(entry.amount) / 1000;
    });

    const trackedDays = Object.keys(dailyTotals).length;

    const totalWater = Object.values(dailyTotals).reduce(
      (total, amount) => total + amount,
      0,
    );

    if (trackedDays === 0) {
      return 0;
    }

    return totalWater / trackedDays;
  };

  const weekWaterAverage = calculateAverageWater(weekWaterEntries);

  const monthWaterAverage = calculateAverageWater(monthWaterEntries);

  const yearWaterAverage = calculateAverageWater(yearWaterEntries);

  // =====================================================
  // DAYS USED FOR CURRENT WEEK AVERAGE
  // =====================================================

  const daysElapsedThisWeek = getDaysElapsedThisWeek();

  const trackedDaysThisWeek = countTrackedDays(weekEntries);

  const daysElapsedThisMonth = new Date().getDate();

  const totalMonthCalories = monthEntries.reduce(
    (total, entry) => total + calculateCalories(entry),
    0,
  );

  const trackedDaysThisMonth = countTrackedDays(monthEntries);

  const monthAverage =
    trackedDaysThisMonth > 0
      ? Math.round(totalMonthCalories / trackedDaysThisMonth)
      : 0;

  // =====================================================
  // YEAR AVERAGE
  // =====================================================

  const totalYearCalories = yearEntries.reduce(
    (total, entry) => total + calculateCalories(entry),
    0,
  );

  const trackedDaysThisYear = countTrackedDays(yearEntries);

  const yearAverage =
    trackedDaysThisYear > 0
      ? Math.round(totalYearCalories / trackedDaysThisYear)
      : 0;

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
        <Text style={styles.title}>Progress</Text>

        {/* MAIN TABS */}

        <View style={styles.tabs}>
          <ProgressTabButton
            label="Calories"
            active={activeTab === "Calories"}
            onPress={() => setActiveTab("Calories")}
          />

          <ProgressTabButton
            label="Macros"
            active={activeTab === "Macros"}
            onPress={() => setActiveTab("Macros")}
          />

          <ProgressTabButton
            label="Water"
            active={activeTab === "Water"}
            onPress={() => setActiveTab("Water")}
          />
        </View>

        {/* PERIOD TABS */}

        <View style={styles.periodTabs}>
          <PeriodButton
            label="Week"
            active={activePeriod === "Week"}
            onPress={() => setActivePeriod("Week")}
          />

          <PeriodButton
            label="Month"
            active={activePeriod === "Month"}
            onPress={() => setActivePeriod("Month")}
          />

          <PeriodButton
            label="Year"
            active={activePeriod === "Year"}
            onPress={() => setActivePeriod("Year")}
          />
        </View>

        {/* CALORIES */}

        {/* CALORIES */}

        {activeTab === "Calories" && (
          <>
            {/* WEEK */}

            {activePeriod === "Week" && (
              <>
                <ProgressChart
                  data={weekData}
                  goal={profile?.calorie_goal ?? 2000}
                  daysForAverage={trackedDaysThisWeek}
                />

                <CalorieBreakdown
                  protein={weekProtein}
                  carbs={weekCarbs}
                  fat={weekFat}
                />
              </>
            )}

            {/* MONTH */}

            {activePeriod === "Month" && (
              <>
                <ProgressChart
                  data={monthData}
                  goal={profile?.calorie_goal ?? 2000}
                  average={monthAverage}
                />

                <CalorieBreakdown
                  protein={monthProtein}
                  carbs={monthCarbs}
                  fat={monthFat}
                />
              </>
            )}

            {/* YEAR */}

            {activePeriod === "Year" && (
              <>
                <ProgressChart
                  data={yearData}
                  goal={profile?.calorie_goal ?? 2000}
                  average={yearAverage}
                />

                <CalorieBreakdown
                  protein={yearProtein}
                  carbs={yearCarbs}
                  fat={yearFat}
                />
              </>
            )}
          </>
        )}
        {/* MACROS */}

        {activeTab === "Macros" && (
          <>
            {/* WEEK */}

            {activePeriod === "Week" && (
              <MacroBreakdown
                title="Weekly Macro Average"
                protein={weekMacroAverage.protein}
                proteinGoal={profile?.protein_goal ?? 0}
                carbs={weekMacroAverage.carbs}
                carbGoal={profile?.carb_goal ?? 0}
                fat={weekMacroAverage.fat}
                fatGoal={profile?.fat_goal ?? 0}
              />
            )}

            {/* MONTH */}

            {activePeriod === "Month" && (
              <MacroBreakdown
                title="Monthly Macro Average"
                protein={monthMacroAverage.protein}
                proteinGoal={profile?.protein_goal ?? 0}
                carbs={monthMacroAverage.carbs}
                carbGoal={profile?.carb_goal ?? 0}
                fat={monthMacroAverage.fat}
                fatGoal={profile?.fat_goal ?? 0}
              />
            )}

            {/* YEAR */}

            {activePeriod === "Year" && (
              <MacroBreakdown
                title="Yearly Macro Average"
                protein={yearMacroAverage.protein}
                proteinGoal={profile?.protein_goal ?? 0}
                carbs={yearMacroAverage.carbs}
                carbGoal={profile?.carb_goal ?? 0}
                fat={yearMacroAverage.fat}
                fatGoal={profile?.fat_goal ?? 0}
              />
            )}
          </>
        )}

        {/* WATER */}

        {activeTab === "Water" && (
          <>
            {/* WEEK */}

            {activePeriod === "Week" && (
              <WaterProgress
                title="Weekly Water Average"
                average={weekWaterAverage}
                goal={profile?.water_goal ?? 0}
              />
            )}

            {/* MONTH */}

            {activePeriod === "Month" && (
              <WaterProgress
                title="Monthly Water Average"
                average={monthWaterAverage}
                goal={profile?.water_goal ?? 0}
              />
            )}

            {/* YEAR */}

            {activePeriod === "Year" && (
              <WaterProgress
                title="Yearly Water Average"
                average={yearWaterAverage}
                goal={profile?.water_goal ?? 0}
              />
            )}
          </>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

// =====================================================
// WATER PROGRESS
// =====================================================

type WaterProgressProps = {
  title: string;
  average: number;
  goal: number;
};

function WaterProgress({ title, average, goal }: WaterProgressProps) {
  const percentage = goal > 0 ? (average / goal) * 100 : 0;

  const barPercentage = Math.min(percentage, 100);

  return (
    <View style={styles.waterCard}>
      <Text style={styles.waterTitle}>{title}</Text>

      <View style={styles.waterRow}>
        <Text style={styles.waterLabel}>Average Water</Text>

        <Text style={styles.waterValue}>
          {average.toFixed(2)} / {goal.toFixed(2)} L
        </Text>
      </View>

      <View style={styles.waterProgressBackground}>
        <View
          style={[
            styles.waterProgressFill,
            {
              width: `${barPercentage}%` as `${number}%`,
            },
          ]}
        />
      </View>

      <Text style={styles.waterPercentage}>{Math.round(percentage)}%</Text>

      <View style={styles.waterSummary}>
        <Text style={styles.waterSummaryLabel}>Daily Average</Text>

        <Text style={styles.waterSummaryValue}>{average.toFixed(2)} L</Text>
      </View>

      <View style={styles.waterSummary}>
        <Text style={styles.waterSummaryLabel}>Daily Goal</Text>

        <Text style={styles.waterSummaryValue}>{goal.toFixed(2)} L</Text>
      </View>
    </View>
  );
}

// =====================================================
// MAIN TAB BUTTON
// =====================================================

type ProgressTabButtonProps = {
  label: ProgressTab;
  active: boolean;
  onPress: () => void;
};

function ProgressTabButton({ label, active, onPress }: ProgressTabButtonProps) {
  return (
    <Pressable
      style={[styles.tab, active && styles.activeTab]}
      onPress={onPress}
    >
      <Text style={active ? styles.activeTabText : styles.tabText}>
        {label}
      </Text>
    </Pressable>
  );
}

// =====================================================
// PERIOD BUTTON
// =====================================================

type PeriodButtonProps = {
  label: Period;
  active: boolean;
  onPress: () => void;
};

function PeriodButton({ label, active, onPress }: PeriodButtonProps) {
  return (
    <Pressable
      style={[styles.periodTab, active && styles.activePeriod]}
      onPress={onPress}
    >
      <Text style={active ? styles.activePeriodText : styles.periodText}>
        {label}
      </Text>
    </Pressable>
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

  title: {
    fontSize: 24,
    fontWeight: "800",

    color: "#151515",

    textAlign: "center",
  },

  // MAIN TABS

  tabs: {
    flexDirection: "row",

    marginTop: 24,

    padding: 4,

    borderRadius: 16,

    backgroundColor: "#F0EFE8",
  },

  tab: {
    flex: 1,

    paddingVertical: 9,

    alignItems: "center",

    borderRadius: 12,
  },

  activeTab: {
    backgroundColor: "#97FF79",
  },

  tabText: {
    fontSize: 13,

    color: "#707070",
  },

  activeTabText: {
    fontSize: 13,
    fontWeight: "700",

    color: "#151515",
  },

  // PERIOD TABS

  periodTabs: {
    flexDirection: "row",

    alignSelf: "center",

    marginTop: 14,

    padding: 3,

    borderRadius: 14,

    backgroundColor: "#F0EFE8",
  },

  periodTab: {
    width: 82,

    paddingVertical: 7,

    alignItems: "center",

    borderRadius: 11,
  },

  activePeriod: {
    backgroundColor: "#97FF79",
  },

  periodText: {
    fontSize: 12,

    color: "#707070",
  },

  activePeriodText: {
    fontSize: 12,
    fontWeight: "700",

    color: "#151515",
  },

  // PLACEHOLDER

  placeholderCard: {
    marginTop: 24,

    padding: 20,

    borderWidth: 1,
    borderColor: "#E9E7DF",

    borderRadius: 18,
  },

  placeholderTitle: {
    fontSize: 17,
    fontWeight: "800",

    color: "#151515",
  },

  placeholderText: {
    marginTop: 6,

    fontSize: 13,
    lineHeight: 19,

    color: "#707070",
  },

  waterCard: {
    marginTop: 24,
    padding: 20,

    borderWidth: 1,
    borderColor: "#E9E7DF",

    borderRadius: 18,

    backgroundColor: "#FFFDF7",
  },

  waterTitle: {
    fontSize: 17,
    fontWeight: "800",

    color: "#151515",

    marginBottom: 22,
  },

  waterRow: {
    flexDirection: "row",

    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 10,
  },

  waterLabel: {
    fontSize: 14,
    fontWeight: "700",

    color: "#151515",
  },

  waterValue: {
    fontSize: 13,

    color: "#707070",
  },

  waterProgressBackground: {
    height: 10,

    borderRadius: 10,

    backgroundColor: "#F0EFE8",

    overflow: "hidden",
  },

  waterProgressFill: {
    height: "100%",

    borderRadius: 10,

    backgroundColor: "#97FF79",
  },

  waterPercentage: {
    marginTop: 5,
    marginBottom: 18,

    textAlign: "right",

    fontSize: 11,

    color: "#707070",
  },

  waterSummary: {
    flexDirection: "row",

    justifyContent: "space-between",

    paddingVertical: 7,
  },

  waterSummaryLabel: {
    fontSize: 13,

    color: "#707070",
  },

  waterSummaryValue: {
    fontSize: 13,
    fontWeight: "700",

    color: "#151515",
  },
});

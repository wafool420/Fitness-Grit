import { useCallback, useState } from "react";

import { getToken } from "../utils/authStorage";

import { API_BASE_URL } from "../utils/api";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

type Food = {
  id: number;
  name: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function AddFood() {
  const { meal, date } = useLocalSearchParams();

  const [recentFoods, setRecentFoods] = useState<Food[]>([]);
  const [customFoods, setCustomFoods] = useState<Food[]>([]);

  const initialMeal = typeof meal === "string" ? meal : "Breakfast";

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const selectedDate =
    typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : getTodayDate();

  const [selectedMeal, setSelectedMeal] = useState(initialMeal);

  // =====================================================
  // LOAD RECENT + CUSTOM FOODS
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      const loadFoods = async () => {
        try {
          const token = await getToken();

          if (!token) {
            router.replace("/login");
            return;
          }

          // -----------------------------------------
          // Recent Foods
          // -----------------------------------------

          const recentResponse = await fetch(`${API_BASE_URL}/foods/recent/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });

          if (!recentResponse.ok) {
            throw new Error(
              `Failed to load recent foods: ${recentResponse.status}`,
            );
          }

          const recentData = await recentResponse.json();

          setRecentFoods(recentData);

          // -----------------------------------------
          // My Foods
          // -----------------------------------------

          const customResponse = await fetch(`${API_BASE_URL}/foods/custom/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
          });

          if (!customResponse.ok) {
            throw new Error(
              `Failed to load custom foods: ${customResponse.status}`,
            );
          }

          const customData = await customResponse.json();

          setCustomFoods(customData);
        } catch (error) {
          console.error("Could not load foods:", error);
        }
      };

      loadFoods();
    }, []),
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/");
              }
            }}
            style={styles.backButton}
          >
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Add Food</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* =================================================
            MEAL TABS
        ================================================= */}

        <View style={styles.mealTabs}>
          {["Breakfast", "Lunch", "Snacks", "Dinner"].map((item) => (
            <Pressable
              key={item}
              style={[
                styles.mealTab,

                selectedMeal === item && styles.activeMeal,
              ]}
              onPress={() => setSelectedMeal(item)}
            >
              <Text
                style={[
                  styles.mealText,

                  selectedMeal === item && styles.activeMealText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* =================================================
            SEARCH
        ================================================= */}

        <Pressable
          style={styles.searchBox}
          onPress={() =>
            router.push({
              pathname: "/food-search",

              params: {
                meal: selectedMeal,
                date: selectedDate,
              },
            })
          }
        >
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search for a food..."
            placeholderTextColor="#888"
            editable={false}
            pointerEvents="none"
          />

          <Text style={styles.scanIcon}>⌗</Text>
        </Pressable>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <View style={styles.actions}>
          {/* Scan Food */}

          <Pressable
            style={[styles.actionCard, styles.scanCard]}
            onPress={() =>
              router.push({
                pathname: "/scan-food",

                params: {
                  meal: selectedMeal,
                  date: selectedDate,
                },
              })
            }
          >
            <Text style={styles.actionIcon}>▣</Text>

            <Text style={styles.actionTitle}>Scan Food</Text>

            <Text style={styles.actionTitle}>with Camera</Text>
          </Pressable>

          {/* Browse Categories */}

          <Pressable style={styles.actionCard}>
            <Text style={styles.actionIcon}>▦</Text>

            <Text style={styles.actionTitle}>Browse</Text>

            <Text style={styles.actionTitle}>Categories</Text>
          </Pressable>

          {/* Add Custom Food */}

          <Pressable
            style={[styles.actionCard, styles.customFoodCard]}
            onPress={() =>
              router.push({
                pathname: "/add-custom-food",

                params: {
                  meal: selectedMeal,
                  date: selectedDate,
                },
              })
            }
          >
            <Text style={styles.actionIcon}>＋</Text>

            <Text style={styles.actionTitle}>Add Custom</Text>

            <Text style={styles.actionTitle}>Food</Text>
          </Pressable>
        </View>

        {/* =================================================
            RECENT FOODS
        ================================================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Foods</Text>

          <Pressable>
            <Text style={styles.seeAll}>See all ›</Text>
          </Pressable>
        </View>

        {recentFoods.length === 0 ? (
          <View style={styles.emptyFoods}>
            <Text style={styles.emptyFoodsText}>No recent foods yet.</Text>
          </View>
        ) : (
          recentFoods
            .slice(0, 4)
            .map((food) => (
              <FoodRow
                key={food.id}
                food={food}
                meal={selectedMeal}
                date={selectedDate}
              />
            ))
        )}

        {/* =================================================
            MY FOODS
        ================================================= */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Foods</Text>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>{customFoods.length}</Text>
          </View>
        </View>

        {customFoods.length === 0 ? (
          <View style={styles.emptyFoods}>
            <Text style={styles.emptyFoodsText}>No custom foods yet.</Text>

            <Text style={styles.emptyFoodsHint}>
              Foods you create will appear here for quick reuse.
            </Text>
          </View>
        ) : (
          customFoods.map((food) => (
            <FoodRow
              key={food.id}
              food={food}
              meal={selectedMeal}
              date={selectedDate}
              editable
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// =====================================================
// FOOD ROW
// =====================================================

function FoodRow({
  food,
  meal,
  date,
  editable = false,
}: {
  food: Food;
  meal: string;
  date: string;
  editable?: boolean;
}) {
  // =====================================================
  // OPEN FOOD DETAILS
  // =====================================================

  const openFoodDetails = () => {
    router.push({
      pathname: "/food-details",

      params: {
        meal,
        date,

        id: food.id.toString(),
        name: food.name,

        servingSize: food.serving_size.toString(),

        servingUnit: food.serving_unit,

        calories: food.calories.toString(),

        protein: food.protein.toString(),

        carbs: food.carbs.toString(),

        fat: food.fat.toString(),

        icon: "🍽️",
      },
    });
  };

  // =====================================================
  // OPEN EDIT CUSTOM FOOD
  // =====================================================

  const openEditFood = () => {
    router.push({
      pathname: "/edit-custom-food",

      params: {
        id: food.id.toString(),

        meal,
        date,

        name: food.name,

        servingSize: food.serving_size.toString(),

        servingUnit: food.serving_unit,

        calories: food.calories.toString(),

        protein: food.protein.toString(),

        carbs: food.carbs.toString(),

        fat: food.fat.toString(),
      },
    });
  };

  return (
    <View style={styles.foodRow}>
      {/* ===============================================
          MAIN ROW AREA
      =============================================== */}

      <Pressable
        style={styles.foodMainArea}
        onPress={() => {
          if (editable) {
            openEditFood();
          } else {
            openFoodDetails();
          }
        }}
      >
        <Text style={styles.foodIcon}>🍽️</Text>

        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{food.name}</Text>

          <Text style={styles.foodDetails}>
            {food.serving_size} {food.serving_unit} · {food.calories} kcal
          </Text>
        </View>
      </Pressable>

      {/* ===============================================
          QUICK ADD BUTTON
      =============================================== */}

      <Pressable style={styles.addButton} onPress={openFoodDetails}>
        <Text style={styles.add}>+</Text>
      </Pressable>
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

  backButton: {
    width: 40,
    height: 40,

    justifyContent: "center",
  },

  back: {
    fontSize: 34,
    color: "#151515",
    lineHeight: 34,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#151515",
  },

  headerSpacer: {
    width: 40,
  },

  mealTabs: {
    flexDirection: "row",

    marginTop: 22,
    padding: 4,

    borderRadius: 15,

    backgroundColor: "#F0EFE8",
  },

  mealTab: {
    flex: 1,

    paddingVertical: 9,

    alignItems: "center",

    borderRadius: 11,
  },

  activeMeal: {
    backgroundColor: "#97FF79",
  },

  mealText: {
    fontSize: 12,
    color: "#707070",
  },

  activeMealText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#151515",
  },

  searchBox: {
    height: 50,

    marginTop: 16,

    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E9E7DF",
    borderRadius: 15,
  },

  searchIcon: {
    fontSize: 24,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,

    fontSize: 14,
    color: "#151515",
  },

  scanIcon: {
    fontSize: 21,
  },

  actions: {
    flexDirection: "row",

    gap: 8,

    marginTop: 16,
  },

  actionCard: {
    flex: 1,

    height: 115,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#E9E7DF",
    borderRadius: 16,

    backgroundColor: "#F7F6F0",

    paddingHorizontal: 4,
  },

  scanCard: {
    backgroundColor: "#EEFFE8",
    borderColor: "#D9F8CF",
  },

  customFoodCard: {
    backgroundColor: "#F7F6F0",
  },

  actionIcon: {
    fontSize: 29,
    marginBottom: 8,
  },

  actionTitle: {
    fontSize: 12,
    fontWeight: "700",

    color: "#151515",

    textAlign: "center",
  },

  sectionHeader: {
    marginTop: 26,
    marginBottom: 6,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#151515",
  },

  seeAll: {
    fontSize: 12,
    color: "#707070",
  },

  // =====================================================
  // FOOD ROW
  // =====================================================

  foodRow: {
    minHeight: 66,

    flexDirection: "row",
    alignItems: "center",

    borderBottomWidth: 1,
    borderBottomColor: "#EFEEE8",
  },

  foodMainArea: {
    flex: 1,

    minHeight: 66,

    flexDirection: "row",
    alignItems: "center",
  },

  foodIcon: {
    width: 48,

    fontSize: 30,

    textAlign: "center",
  },

  foodInfo: {
    flex: 1,

    marginLeft: 8,
  },

  foodName: {
    fontSize: 14,
    fontWeight: "700",

    color: "#151515",
  },

  foodDetails: {
    marginTop: 3,

    fontSize: 12,

    color: "#707070",
  },

  addButton: {
    width: 32,
    height: 32,

    borderRadius: 11,

    backgroundColor: "#97FF79",

    alignItems: "center",
    justifyContent: "center",
  },

  add: {
    fontSize: 21,
    lineHeight: 21,

    color: "#151515",

    includeFontPadding: false,

    transform: [
      {
        translateY: -2,
      },
    ],
  },

  countBadge: {
    minWidth: 26,
    height: 26,

    paddingHorizontal: 8,

    borderRadius: 13,

    backgroundColor: "#EEFFE8",

    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    fontSize: 11,
    fontWeight: "800",

    color: "#397A2C",
  },

  emptyFoods: {
    paddingVertical: 18,

    alignItems: "center",
  },

  emptyFoodsText: {
    fontSize: 13,
    fontWeight: "700",

    color: "#707070",
  },

  emptyFoodsHint: {
    marginTop: 4,

    fontSize: 11,

    color: "#A09E97",

    textAlign: "center",
  },
});

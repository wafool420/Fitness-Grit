import { useEffect, useState } from "react";
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

import { router, useLocalSearchParams } from "expo-router";

type USDAFood = {
  fdc_id: number;
  name: string;
  brand_name: string;
  data_type: string;

  serving_size: number;
  serving_unit: string;

  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type USDAResponse = {
  query: string;
  count: number;
  results: USDAFood[];
};

type FoodFilter = "All" | "Common" | "Branded" | "Restaurant";

export default function FoodSearch() {
  const { meal, date } = useLocalSearchParams();

  const selectedDate = typeof date === "string" ? date : "";

  const [foods, setFoods] = useState<USDAFood[]>([]);
  const [search, setSearch] = useState("");

  const [activeFilter, setActiveFilter] = useState<FoodFilter>("All");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // USDA SEARCH
  // =====================================================

  useEffect(() => {
    const query = search.trim();

    // Don't search USDA when the search box is empty.
    if (query.length === 0) {
      setFoods([]);
      setError("");
      setLoading(false);

      return;
    }

    // Small delay so we don't call USDA on every keystroke.
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();

        console.log("Food search token exists:", !!token);

        if (!token) {
          setFoods([]);
          setError("You need to log in.");
          router.replace("/login");
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/foods/search/?q=${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.text();

          console.error("Food search response:", response.status, errorData);

          throw new Error(`Food search failed: ${response.status}`);
        }

        const data: USDAResponse = await response.json();

        setFoods(data.results);
      } catch (error) {
        console.error("Could not search foods:", error);

        setFoods([]);
        setError("Could not search foods.");
      } finally {
        setLoading(false);
      }
    }, 400);

    const restaurantKeywords = [
      "mcdonald",
      "mcdonald's",
      "burger king",
      "wendy's",
      "subway",
      "starbucks",
      "kfc",
      "taco bell",
      "pizza hut",
      "domino",
      "chick-fil-a",
      "dunkin",
    ];

    const isRestaurantFood = (food: USDAFood) => {
      const searchableText = `${food.name} ${food.brand_name}`.toLowerCase();

      return restaurantKeywords.some((keyword) =>
        searchableText.includes(keyword),
      );
    };

    const isCommonFood = (food: USDAFood) => {
      return (
        food.data_type === "Foundation" ||
        food.data_type === "SR Legacy" ||
        food.data_type === "Survey (FNDDS)"
      );
    };

    const filteredFoods = foods
      .filter((food) => {
        if (activeFilter === "All") {
          return true;
        }

        if (activeFilter === "Common") {
          return isCommonFood(food);
        }

        if (activeFilter === "Branded") {
          return food.data_type === "Branded";
        }

        if (activeFilter === "Restaurant") {
          return isRestaurantFood(food);
        }

        return true;
      })
      .sort((a, b) => {
        // Only change the ordering of the All tab.
        if (activeFilter !== "All") {
          return 0;
        }

        const aCommon = isCommonFood(a);
        const bCommon = isCommonFood(b);

        // Common foods come before branded foods.
        if (aCommon && !bCommon) {
          return -1;
        }

        if (!aCommon && bCommon) {
          return 1;
        }

        // Otherwise preserve Django's original ranking.
        return 0;
      });

    return () => clearTimeout(timer);
  }, [search]);

  const restaurantKeywords = [
    "mcdonald",
    "mcdonald's",
    "burger king",
    "wendy's",
    "subway",
    "starbucks",
    "kfc",
    "taco bell",
    "pizza hut",
    "domino",
    "chick-fil-a",
    "dunkin",
  ];

  const isRestaurantFood = (food: USDAFood) => {
    const searchableText = `${food.name} ${food.brand_name}`.toLowerCase();

    return restaurantKeywords.some((keyword) =>
      searchableText.includes(keyword),
    );
  };

  const filteredFoods = foods.filter((food) => {
    if (activeFilter === "All") {
      return true;
    }

    if (activeFilter === "Common") {
      return (
        food.data_type === "Foundation" ||
        food.data_type === "SR Legacy" ||
        food.data_type === "Survey (FNDDS)"
      );
    }

    if (activeFilter === "Branded") {
      return food.data_type === "Branded";
    }

    if (activeFilter === "Restaurant") {
      return isRestaurantFood(food);
    }

    return true;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search header */}

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>⌕</Text>

            <TextInput
              style={styles.input}
              value={search}
              onChangeText={setSearch}
              placeholder="Search food..."
              placeholderTextColor="#888"
              autoFocus
              autoCorrect={false}
            />

            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Text style={styles.clear}>×</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Filters */}

        <View style={styles.filters}>
          {(["All", "Common", "Branded", "Restaurant"] as FoodFilter[]).map(
            (filter) => {
              const active = activeFilter === filter;

              return (
                <Pressable
                  key={filter}
                  style={[styles.filter, active && styles.activeFilter]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    style={active ? styles.activeFilterText : styles.filterText}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            },
          )}
        </View>

        {/* Results */}

        <View style={styles.results}>
          {/* Empty search */}

          {!loading && search.trim() === "" && (
            <Text style={styles.message}>
              Search for a food to get started.
            </Text>
          )}

          {/* Loading */}

          {loading && <Text style={styles.message}>Searching foods...</Text>}

          {/* Error */}

          {!loading && error !== "" && (
            <Text style={styles.message}>{error}</Text>
          )}

          {/* No results */}

          {!loading &&
            error === "" &&
            search.trim() !== "" &&
            filteredFoods.length === 0 && (
              <Text style={styles.message}>
                No {activeFilter.toLowerCase()} foods found.
              </Text>
            )}

          {/* USDA results */}

          {!loading &&
            error === "" &&
            filteredFoods.map((food) => (
              <Pressable
                key={food.fdc_id}
                style={styles.foodRow}
                onPress={() =>
                  router.push({
                    pathname: "/food-details",

                    params: {
                      meal: typeof meal === "string" ? meal : "Breakfast",

                      date: selectedDate,

                      // USDA identifier
                      fdcId: food.fdc_id.toString(),

                      name: food.name,

                      brandName: food.brand_name,

                      dataType: food.data_type,

                      servingSize: food.serving_size.toString(),

                      servingUnit: food.serving_unit,

                      calories: food.calories.toString(),

                      protein: food.protein.toString(),

                      carbs: food.carbs.toString(),

                      fat: food.fat.toString(),

                      icon: "🍽️",
                    },
                  })
                }
              >
                <Text style={styles.foodIcon}>🍽️</Text>

                <View style={styles.foodInfo}>
                  <Text style={styles.foodName} numberOfLines={2}>
                    {food.name}
                  </Text>

                  {food.brand_name !== "" && (
                    <Text style={styles.brandName} numberOfLines={1}>
                      {food.brand_name}
                    </Text>
                  )}

                  <Text style={styles.foodDetails}>
                    {food.serving_size} {food.serving_unit} · {food.calories}{" "}
                    kcal
                  </Text>
                </View>

                <View style={styles.addButton}>
                  <Text style={styles.add}>+</Text>
                </View>
              </Pressable>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

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
  },

  backButton: {
    width: 38,
    height: 48,
    justifyContent: "center",
  },

  back: {
    fontSize: 34,
    lineHeight: 34,
    color: "#151515",
  },

  searchBox: {
    flex: 1,
    height: 48,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 13,

    borderWidth: 1,
    borderColor: "#E9E7DF",
    borderRadius: 15,
  },

  searchIcon: {
    fontSize: 22,
    marginRight: 8,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#151515",
    outlineStyle: "none",
  } as any,

  clear: {
    fontSize: 22,
    color: "#707070",
  },

  filters: {
    flexDirection: "row",
    gap: 7,
    marginTop: 16,
  },

  filter: {
    flex: 1,

    paddingVertical: 8,
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E9E7DF",
    borderRadius: 12,
  },

  activeFilter: {
    backgroundColor: "#97FF79",
    borderColor: "#97FF79",
  },

  filterText: {
    fontSize: 11,
    color: "#555555",
  },

  activeFilterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#151515",
  },

  results: {
    marginTop: 16,
  },

  message: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 13,
    color: "#707070",
  },

  foodRow: {
    minHeight: 76,

    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 7,

    borderBottomWidth: 1,
    borderBottomColor: "#EFEEE8",
  },

  foodIcon: {
    width: 48,
    fontSize: 31,
    textAlign: "center",
  },

  foodInfo: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },

  foodName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#151515",
  },

  brandName: {
    marginTop: 2,
    fontSize: 11,
    color: "#707070",
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

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#97FF79",
  },

  add: {
    fontSize: 21,
    lineHeight: 21,
    color: "#151515",

    includeFontPadding: false,
    transform: [{ translateY: -2 }],
  },
});

import { useState } from "react";

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { API_BASE_URL } from "../utils/api";

import { router, useLocalSearchParams } from "expo-router";

import { getToken } from "../utils/authStorage";

export default function FoodDetails() {
  const params = useLocalSearchParams();

  const meal = typeof params.meal === "string" ? params.meal : "Breakfast";

  const selectedDate = typeof params.date === "string" ? params.date : "";

  const name = typeof params.name === "string" ? params.name : "Food";

  const icon = typeof params.icon === "string" ? params.icon : "🍽️";

  // Values coming from Django through Food Search
  // USDA FoodData Central ID
  const fdcId = typeof params.fdcId === "string" ? Number(params.fdcId) : 0;

  const servingUnit =
    typeof params.servingUnit === "string" ? params.servingUnit : "g";

  const servingSize =
    typeof params.servingSize === "string" ? Number(params.servingSize) : 100;

  const caloriesPerServing =
    typeof params.calories === "string" ? Number(params.calories) : 0;

  const proteinPerServing =
    typeof params.protein === "string" ? Number(params.protein) : 0;

  const carbsPerServing =
    typeof params.carbs === "string" ? Number(params.carbs) : 0;

  const fatPerServing = typeof params.fat === "string" ? Number(params.fat) : 0;

  const [serving, setServing] = useState(servingSize);

  const [adding, setAdding] = useState(false);

  // Calculate nutrition based on selected amount
  const multiplier = serving / servingSize;

  const calories = Math.round(caloriesPerServing * multiplier);

  const protein = (proteinPerServing * multiplier).toFixed(1);

  const carbs = (carbsPerServing * multiplier).toFixed(1);

  const fat = (fatPerServing * multiplier).toFixed(1);

  const decreaseServing = () => {
    setServing((current) => Math.max(50, current - 50));
  };

  const increaseServing = () => {
    setServing((current) => current + 50);
  };

  const addFood = async () => {
    if (fdcId === 0) {
      console.error("USDA Food ID is missing.");
      return;
    }

    try {
      setAdding(true);

      const token = await getToken();

      if (!token) {
        alert("You need to log in.");

        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/foods/usda/log/`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },

        body: JSON.stringify({
          fdc_id: fdcId,

          name: name,

          serving_size: servingSize,
          serving_unit: servingUnit,

          calories: caloriesPerServing,
          protein: proteinPerServing,
          carbs: carbsPerServing,
          fat: fatPerServing,

          meal: meal,
          amount: serving,

          ...(selectedDate && {
            date: selectedDate,
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Could not add USDA food:", data);

        alert("Could not add food.");
        return;
      }

      console.log("USDA food logged:", data);

      router.replace({
        pathname: "/diary",

        params: {
          date: selectedDate,
        },
      });
    } catch (error) {
      console.error("Could not connect to Django:", error);

      alert("Could not connect to the server.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Food Details</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Food */}
        <View style={styles.foodHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.foodIcon}>{icon}</Text>
          </View>

          <Text style={styles.foodName}>{name}</Text>

          <Text style={styles.calories}>{calories} kcal</Text>

          <Text style={styles.servingLabel}>per {serving} g</Text>
        </View>

        {/* Macros */}
        <View style={styles.macros}>
          <View style={styles.macro}>
            <Text style={styles.macroValue}>{protein} g</Text>

            <Text style={styles.macroLabel}>Protein</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.macro}>
            <Text style={styles.macroValue}>{carbs} g</Text>

            <Text style={styles.macroLabel}>Carbs</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.macro}>
            <Text style={styles.macroValue}>{fat} g</Text>

            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>

        {/* Serving */}
        <View style={styles.servingSection}>
          <Text style={styles.sectionTitle}>Serving</Text>

          <View style={styles.servingControls}>
            <Pressable style={styles.servingButton} onPress={decreaseServing}>
              <Text style={styles.servingButtonText}>−</Text>
            </Pressable>

            <View style={styles.servingAmount}>
              <Text style={styles.servingNumber}>{serving}</Text>

              <Text style={styles.servingUnit}>grams</Text>
            </View>

            <Pressable style={styles.servingButton} onPress={increaseServing}>
              <Text style={styles.servingButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Add Button */}
        <Pressable
          style={[styles.addFoodButton, adding && styles.disabledButton]}
          onPress={addFood}
          disabled={adding}
        >
          <Text style={styles.addFoodText}>
            {adding ? "Adding..." : `Add to ${meal}`}
          </Text>
        </Pressable>
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
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },

  back: {
    fontSize: 34,
    lineHeight: 34,
    color: "#151515",
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#151515",
  },

  headerSpacer: {
    width: 40,
  },

  foodHeader: {
    marginTop: 38,
    alignItems: "center",
  },

  iconContainer: {
    width: 100,
    height: 100,

    borderRadius: 28,

    backgroundColor: "#EEFFE8",

    alignItems: "center",
    justifyContent: "center",
  },

  foodIcon: {
    fontSize: 58,
  },

  foodName: {
    marginTop: 18,

    fontSize: 21,
    fontWeight: "800",
    color: "#151515",
  },

  calories: {
    marginTop: 12,

    fontSize: 30,
    fontWeight: "800",
    color: "#151515",
  },

  servingLabel: {
    marginTop: 2,

    fontSize: 12,
    color: "#707070",
  },

  macros: {
    marginTop: 28,
    paddingVertical: 18,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E9E7DF",
    borderRadius: 18,
  },

  macro: {
    flex: 1,
    alignItems: "center",
  },

  macroValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#151515",
  },

  macroLabel: {
    marginTop: 4,

    fontSize: 11,
    color: "#707070",
  },

  divider: {
    width: 1,
    height: 32,

    backgroundColor: "#E9E7DF",
  },

  servingSection: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#151515",
  },

  servingControls: {
    marginTop: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  servingButton: {
    width: 52,
    height: 52,

    borderRadius: 16,

    backgroundColor: "#F0EFE8",

    alignItems: "center",
    justifyContent: "center",
  },

  servingButtonText: {
    fontSize: 27,
    lineHeight: 27,
    fontWeight: "500",
    color: "#151515",
  },

  servingAmount: {
    minWidth: 150,
    height: 64,

    borderWidth: 1,
    borderColor: "#E9E7DF",
    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",
  },

  servingNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#151515",
  },

  servingUnit: {
    marginTop: 1,

    fontSize: 11,
    color: "#707070",
  },

  addFoodButton: {
    height: 52,
    marginTop: 34,

    borderRadius: 16,

    backgroundColor: "#97FF79",

    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  addFoodText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#151515",
  },
});

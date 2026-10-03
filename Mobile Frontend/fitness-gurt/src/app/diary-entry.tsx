import { useState } from "react";

import { API_BASE_URL } from "../utils/api";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";

import { getToken } from "../utils/authStorage";

export default function DiaryEntry() {
  const params = useLocalSearchParams();

  const id = typeof params.id === "string" ? params.id : "";

  const name = typeof params.name === "string" ? params.name : "Food";

  const servingUnit =
    typeof params.servingUnit === "string" ? params.servingUnit : "g";

  const servingSize =
    typeof params.servingSize === "string" ? Number(params.servingSize) : 100;

  const baseCalories =
    typeof params.calories === "string" ? Number(params.calories) : 0;

  const baseProtein =
    typeof params.protein === "string" ? Number(params.protein) : 0;

  const baseCarbs = typeof params.carbs === "string" ? Number(params.carbs) : 0;

  const baseFat = typeof params.fat === "string" ? Number(params.fat) : 0;

  const meal = typeof params.meal === "string" ? params.meal : "";

  const date = typeof params.date === "string" ? params.date : "";

  const initialAmount =
    typeof params.amount === "string" ? params.amount : servingSize.toString();

  const [amount, setAmount] = useState(initialAmount);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const numericAmount = Number(amount) || 0;

  const multiplier = servingSize > 0 ? numericAmount / servingSize : 0;

  const calories = Math.round(baseCalories * multiplier);

  const protein = baseProtein * multiplier;

  const carbs = baseCarbs * multiplier;

  const fat = baseFat * multiplier;

  // =====================================================
  // SAVE
  // =====================================================

  const saveChanges = async () => {
    if (saving) {
      return;
    }

    const newAmount = Number(amount);

    if (Number.isNaN(newAmount) || newAmount <= 0) {
      Alert.alert("Invalid Serving", "Please enter a valid serving amount.");

      return;
    }

    try {
      setSaving(true);

      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/diary/${id}/`, {
        method: "PATCH",

        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          amount: newAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Diary update failed:", data);

        Alert.alert("Could Not Save", "The diary entry could not be updated.");

        return;
      }

      router.replace({
        pathname: "/diary",

        params: {
          ...(date ? { date } : {}),
        },
      });
    } catch (error) {
      console.error("Could not update diary entry:", error);

      Alert.alert("Connection Error", "Could not connect to Fitness Gurt.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const performDelete = async () => {
    if (deleting) {
      return;
    }

    try {
      setDeleting(true);

      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/diary/${id}/`, {
        method: "DELETE",

        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      router.replace({
        pathname: "/diary",

        params: {
          ...(date ? { date } : {}),
        },
      });
    } catch (error) {
      console.error("Could not delete diary entry:", error);

      Alert.alert("Could Not Delete", "The diary entry could not be deleted.");
    } finally {
      setDeleting(false);
    }
  };

  const deleteEntry = () => {
    // Browser
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`Delete ${name} from your diary?`);

      if (confirmed) {
        performDelete();
      }

      return;
    }

    // Android / iOS
    Alert.alert("Delete Food", `Delete ${name} from your diary?`, [
      {
        text: "Cancel",
        style: "cancel",
      },

      {
        text: "Delete",
        style: "destructive",
        onPress: performDelete,
      },
    ]);
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace({
                  pathname: "/diary",
                  params: {
                    ...(date ? { date } : {}),
                  },
                });
              }
            }}
          >
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Diary Entry</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Food */}

        <View style={styles.foodHeader}>
          <View style={styles.foodIcon}>
            <Text style={styles.foodEmoji}>🍽️</Text>
          </View>

          <Text style={styles.foodName}>{name}</Text>

          {meal && (
            <View style={styles.mealBadge}>
              <Text style={styles.mealText}>{meal}</Text>
            </View>
          )}
        </View>

        {/* Serving */}

        <Text style={styles.label}>Serving</Text>

        <View style={styles.amountBox}>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <Text style={styles.unit}>{servingUnit}</Text>
        </View>

        <Text style={styles.helper}>
          Nutrition updates automatically when you change the serving.
        </Text>

        {/* Nutrition */}

        <Text style={styles.sectionTitle}>Nutrition</Text>

        <View style={styles.calorieCard}>
          <Text style={styles.calorieLabel}>Calories</Text>

          <Text style={styles.calorieValue}>{calories} kcal</Text>
        </View>

        <View style={styles.macros}>
          <MacroCard label="Protein" value={`${protein.toFixed(1)} g`} />

          <MacroCard label="Carbs" value={`${carbs.toFixed(1)} g`} />

          <MacroCard label="Fat" value={`${fat.toFixed(1)} g`} />
        </View>

        {/* Actions */}

        <Pressable
          style={[styles.saveButton, saving && styles.disabledButton]}
          disabled={saving}
          onPress={saveChanges}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.deleteButton}
          disabled={deleting}
          onPress={performDelete}
        >
          <Text style={styles.deleteText}>
            {deleting ? "Deleting..." : "Delete Entry"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function MacroCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.macroCard}>
      <Text style={styles.macroLabel}>{label}</Text>

      <Text style={styles.macroValue}>{value}</Text>
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
    marginTop: 36,

    alignItems: "center",
  },

  foodIcon: {
    width: 92,
    height: 92,

    borderRadius: 26,

    backgroundColor: "#EEFFE8",

    alignItems: "center",
    justifyContent: "center",
  },

  foodEmoji: {
    fontSize: 48,
  },

  foodName: {
    marginTop: 16,

    fontSize: 21,
    fontWeight: "800",
    color: "#151515",

    textAlign: "center",
  },

  mealBadge: {
    marginTop: 9,

    paddingHorizontal: 12,
    paddingVertical: 6,

    borderRadius: 20,

    backgroundColor: "#F0EFE8",
  },

  mealText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#707070",
  },

  label: {
    marginTop: 32,
    marginBottom: 8,

    fontSize: 13,
    fontWeight: "800",
    color: "#151515",
  },

  amountBox: {
    height: 52,

    paddingHorizontal: 15,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E1DFD7",
    borderRadius: 15,

    backgroundColor: "#FFFFFF",
  },

  amountInput: {
    flex: 1,

    fontSize: 15,
    fontWeight: "700",
    color: "#151515",

    outlineStyle: "none",
  } as any,

  unit: {
    fontSize: 13,
    fontWeight: "700",
    color: "#707070",
  },

  helper: {
    marginTop: 7,

    fontSize: 11,
    color: "#8A8880",
  },

  sectionTitle: {
    marginTop: 28,
    marginBottom: 12,

    fontSize: 17,
    fontWeight: "800",
    color: "#151515",
  },

  calorieCard: {
    minHeight: 62,

    paddingHorizontal: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderWidth: 1,
    borderColor: "#E9E7DF",
    borderRadius: 16,

    backgroundColor: "#FFFFFF",
  },

  calorieLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#707070",
  },

  calorieValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#151515",
  },

  macros: {
    flexDirection: "row",

    gap: 8,

    marginTop: 10,
  },

  macroCard: {
    flex: 1,

    paddingVertical: 14,

    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E9E7DF",
    borderRadius: 14,

    backgroundColor: "#FFFFFF",
  },

  macroLabel: {
    fontSize: 10,
    color: "#707070",
  },

  macroValue: {
    marginTop: 5,

    fontSize: 13,
    fontWeight: "800",
    color: "#151515",
  },

  saveButton: {
    height: 54,

    marginTop: 34,

    borderRadius: 16,

    backgroundColor: "#97FF79",

    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.55,
  },

  saveButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#151515",
  },

  deleteButton: {
    height: 50,

    marginTop: 8,

    alignItems: "center",
    justifyContent: "center",
  },

  deleteText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#D94A4A",
  },
});

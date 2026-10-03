import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { API_BASE_URL } from "../utils/api";

import { router, useLocalSearchParams } from "expo-router";

import * as ImagePicker from "expo-image-picker";

import { useState } from "react";

import { getToken } from "../utils/authStorage";

export default function EditCustomFood() {
  const params = useLocalSearchParams();

  const id = typeof params.id === "string" ? params.id : "";

  const date = typeof params.date === "string" ? params.date : "";

  const meal = typeof params.meal === "string" ? params.meal : "Breakfast";

  // =====================================================
  // PRE-FILLED VALUES
  // =====================================================

  const [name, setName] = useState(
    typeof params.name === "string" ? params.name : "",
  );

  const [servingSize, setServingSize] = useState(
    typeof params.servingSize === "string" ? params.servingSize : "100",
  );

  const [servingUnit, setServingUnit] = useState(
    typeof params.servingUnit === "string" ? params.servingUnit : "g",
  );

  const [calories, setCalories] = useState(
    typeof params.calories === "string" ? params.calories : "",
  );

  const [protein, setProtein] = useState(
    typeof params.protein === "string" ? params.protein : "",
  );

  const [carbs, setCarbs] = useState(
    typeof params.carbs === "string" ? params.carbs : "",
  );

  const [fat, setFat] = useState(
    typeof params.fat === "string" ? params.fat : "",
  );

  const [imageUri, setImageUri] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  // =====================================================
  // CHOOSE PHOTO
  // =====================================================

  const choosePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      setImageUri(result.assets[0].uri);
    } catch (error) {
      console.error("Could not select food photo:", error);

      Alert.alert("Photo Error", "Could not select the photo.");
    }
  };

  // =====================================================
  // VALIDATE
  // =====================================================

  const validateFood = () => {
    if (!name.trim()) {
      Alert.alert("Missing Food Name", "Please enter a name for your food.");

      return false;
    }

    if (!servingSize.trim() || Number(servingSize) <= 0) {
      Alert.alert("Invalid Serving", "Please enter a valid serving size.");

      return false;
    }

    if (!calories.trim() || Number(calories) < 0) {
      Alert.alert("Invalid Calories", "Please enter the calories.");

      return false;
    }

    return true;
  };

  // =====================================================
  // SAVE CHANGES
  // =====================================================

  const saveChanges = async () => {
    if (saving) {
      return;
    }

    if (!validateFood()) {
      return;
    }

    try {
      setSaving(true);

      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/foods/custom/${id}/`, {
        method: "PATCH",

        headers: {
          Authorization: `Token ${token}`,

          "Content-Type": "application/json",

          Accept: "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),

          serving_size: Number(servingSize),

          serving_unit: servingUnit.trim() || "g",

          calories: Number(calories),

          protein: Number(protein || 0),

          carbs: Number(carbs || 0),

          fat: Number(fat || 0),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Could not update custom food:", data);

        Alert.alert(
          "Could Not Save",
          data.error || "The food could not be updated.",
        );

        return;
      }

      console.log("Custom food updated:", data);

      router.replace({
        pathname: "/add-food",

        params: {
          meal,
          ...(date ? { date } : {}),
        },
      });
    } catch (error) {
      console.error("Could not update custom food:", error);

      Alert.alert("Connection Error", "Could not connect to Fitness Gurt.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE FOOD
  // =====================================================

  const deleteFood = async () => {
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

      const response = await fetch(`${API_BASE_URL}/foods/custom/${id}/`, {
        method: "DELETE",

        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      router.dismissTo({
        pathname: "/add-food",

        params: {
          meal,
          ...(date ? { date } : {}),
        },
      });
    } catch (error) {
      console.error("Could not delete custom food:", error);

      Alert.alert("Could Not Delete", "The custom food could not be deleted.");
    } finally {
      setDeleting(false);
    }
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

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace({
                  pathname: "/add-food",

                  params: {
                    meal,

                    ...(date ? { date } : {}),
                  },
                });
              }
            }}
          >
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Edit Food</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Photo */}

        <Pressable style={styles.photoBox} onPress={choosePhoto}>
          {imageUri ? (
            <Image
              source={{
                uri: imageUri,
              }}
              style={styles.foodPhoto}
            />
          ) : (
            <>
              <Text style={styles.foodIcon}>🍽️</Text>

              <Text style={styles.addPhotoText}>Add Food Photo</Text>

              <Text style={styles.optionalText}>Optional</Text>
            </>
          )}
        </Pressable>

        {imageUri && (
          <Pressable onPress={choosePhoto}>
            <Text style={styles.changePhoto}>Change photo</Text>
          </Pressable>
        )}

        {/* Food Name */}

        <Text style={styles.label}>Food Name *</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Food name"
          placeholderTextColor="#A09E97"
        />

        {/* Serving */}

        <Text style={styles.label}>Serving *</Text>

        <View style={styles.servingRow}>
          <TextInput
            style={[styles.input, styles.servingAmount]}
            value={servingSize}
            onChangeText={setServingSize}
            keyboardType="decimal-pad"
            placeholder="100"
            placeholderTextColor="#A09E97"
          />

          <TextInput
            style={[styles.input, styles.servingUnit]}
            value={servingUnit}
            onChangeText={setServingUnit}
            placeholder="g"
            placeholderTextColor="#A09E97"
          />
        </View>

        {/* Calories */}

        <Text style={styles.label}>Calories *</Text>

        <View style={styles.numberInput}>
          <TextInput
            style={styles.numberTextInput}
            value={calories}
            onChangeText={setCalories}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor="#A09E97"
          />

          <Text style={styles.unitText}>kcal</Text>
        </View>

        {/* Macros */}

        <Text style={styles.sectionTitle}>Macros</Text>

        <Text style={styles.helper}>Optional — leave blank if unknown.</Text>

        <View style={styles.macroRow}>
          <MacroInput label="Protein" value={protein} onChange={setProtein} />

          <MacroInput label="Carbs" value={carbs} onChange={setCarbs} />

          <MacroInput label="Fat" value={fat} onChange={setFat} />
        </View>

        {/* Save */}

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={saveChanges}
          disabled={saving || deleting}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>

        {/* Delete */}

        <Pressable
          style={styles.deleteButton}
          onPress={deleteFood}
          disabled={deleting || saving}
        >
          <Text style={styles.deleteText}>
            {deleting ? "Deleting..." : "Delete Food"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// =====================================================
// MACRO INPUT
// =====================================================

function MacroInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.macroItem}>
      <Text style={styles.macroLabel}>{label}</Text>

      <View style={styles.macroInput}>
        <TextInput
          style={styles.macroTextInput}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#A09E97"
        />

        <Text style={styles.unitText}>g</Text>
      </View>
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 26,
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
    fontSize: 21,
    fontWeight: "800",
    color: "#151515",
  },

  headerSpacer: {
    width: 40,
  },

  photoBox: {
    width: 150,
    height: 150,

    alignSelf: "center",

    borderWidth: 1,
    borderColor: "#DCDAD2",
    borderStyle: "dashed",

    borderRadius: 24,

    backgroundColor: "#F7F6F0",

    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",
  },

  foodPhoto: {
    width: "100%",
    height: "100%",
  },

  foodIcon: {
    fontSize: 48,
  },

  addPhotoText: {
    marginTop: 8,

    fontSize: 13,
    fontWeight: "800",
    color: "#151515",
  },

  optionalText: {
    marginTop: 3,

    fontSize: 10,
    color: "#8A8880",
  },

  changePhoto: {
    marginTop: 9,
    marginBottom: 18,

    textAlign: "center",

    fontSize: 12,
    fontWeight: "700",
    color: "#397A2C",
  },

  label: {
    marginTop: 18,
    marginBottom: 7,

    fontSize: 13,
    fontWeight: "800",
    color: "#151515",
  },

  input: {
    height: 50,

    paddingHorizontal: 15,

    borderWidth: 1,
    borderColor: "#E1DFD7",
    borderRadius: 14,

    backgroundColor: "#FFFFFF",

    fontSize: 14,
    color: "#151515",
  },

  servingRow: {
    flexDirection: "row",
    gap: 10,
  },

  servingAmount: {
    flex: 1,
  },

  servingUnit: {
    width: 90,
  },

  numberInput: {
    height: 50,

    paddingHorizontal: 15,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E1DFD7",
    borderRadius: 14,

    backgroundColor: "#FFFFFF",
  },

  numberTextInput: {
    flex: 1,

    fontSize: 14,
    color: "#151515",

    outlineStyle: "none",
  } as any,

  unitText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#707070",
  },

  sectionTitle: {
    marginTop: 28,

    fontSize: 17,
    fontWeight: "800",
    color: "#151515",
  },

  helper: {
    marginTop: 4,

    fontSize: 11,
    color: "#8A8880",
  },

  macroRow: {
    marginTop: 12,

    flexDirection: "row",
    gap: 8,
  },

  macroItem: {
    flex: 1,
  },

  macroLabel: {
    marginBottom: 6,

    fontSize: 11,
    fontWeight: "700",
    color: "#707070",
  },

  macroInput: {
    height: 48,

    paddingHorizontal: 11,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E1DFD7",
    borderRadius: 13,

    backgroundColor: "#FFFFFF",
  },

  macroTextInput: {
    flex: 1,

    fontSize: 13,
    color: "#151515",

    outlineStyle: "none",
  } as any,

  saveButton: {
    height: 54,

    marginTop: 34,

    borderRadius: 16,

    backgroundColor: "#97FF79",

    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonDisabled: {
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

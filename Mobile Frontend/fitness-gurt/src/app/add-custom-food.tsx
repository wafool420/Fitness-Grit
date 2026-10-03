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

export default function AddCustomFood() {
  const params = useLocalSearchParams();

  const date = typeof params.date === "string" ? params.date : "";

  const meal = typeof params.meal === "string" ? params.meal : "Breakfast";

  const [name, setName] = useState("");
  const [servingSize, setServingSize] = useState("100");
  const [servingUnit, setServingUnit] = useState("g");

  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  const [imageUri, setImageUri] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  // -----------------------------------------------------
  // CHOOSE OPTIONAL FOOD PHOTO
  // -----------------------------------------------------

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

  // -----------------------------------------------------
  // SAVE CUSTOM FOOD
  // -----------------------------------------------------

  const saveFood = async () => {
    if (saving) {
      return;
    }

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (!name.trim()) {
      Alert.alert("Missing Food Name", "Please enter a name for your food.");
      return;
    }

    if (!servingSize.trim() || Number(servingSize) <= 0) {
      Alert.alert("Invalid Serving", "Please enter a valid serving size.");
      return;
    }

    if (!calories.trim() || Number(calories) < 0) {
      Alert.alert("Invalid Calories", "Please enter the calories.");
      return;
    }

    try {
      setSaving(true);

      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      // =========================================
      // 1. CREATE PRIVATE REUSABLE FOOD
      // =========================================

      const foodResponse = await fetch(`${API_BASE_URL}/foods/custom/`, {
        method: "POST",

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

      const food = await foodResponse.json();

      if (!foodResponse.ok) {
        Alert.alert(
          "Could Not Add Food",
          food.error || "Something went wrong while creating the food.",
        );

        return;
      }

      console.log("Private food created:", food);

      // =========================================
      // 2. ADD FOOD TO DIARY
      // =========================================

      const diaryResponse = await fetch(`${API_BASE_URL}/diary/`, {
        method: "POST",

        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          food: food.id,

          meal: meal,

          // User entered nutrition for this serving,
          // so initially log exactly one serving.
          amount: Number(servingSize),

          ...(date ? { date } : {}),
        }),
      });

      const diaryEntry = await diaryResponse.json();

      if (!diaryResponse.ok) {
        console.error("Could not create diary entry:", diaryEntry);

        Alert.alert(
          "Food Created",
          "Your food was saved, but it could not be added to your diary.",
        );

        return;
      }

      console.log("Added to diary:", diaryEntry);

      // =========================================
      // 3. RETURN TO DIARY
      // =========================================

      router.replace({
        pathname: "/diary",
        params: {
          ...(date ? { date } : {}),
        },
      });
    } catch (error) {
      console.error("Could not add custom food:", error);

      Alert.alert("Connection Error", "Could not connect to Fitness Gurt.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Add Custom Food</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Photo */}

        <Pressable style={styles.photoBox} onPress={choosePhoto}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.foodPhoto} />
          ) : (
            <>
              <Text style={styles.cameraIcon}>📷</Text>

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

        {/* Food name */}

        <Text style={styles.label}>Food Name *</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Homemade Chicken Adobo"
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
          onPress={saveFood}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Adding..." : "Add to Diary"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

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

  cameraIcon: {
    fontSize: 36,
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
});

import { useEffect, useState } from "react";

import { API_BASE_URL } from "../utils/api";

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";

import { getToken } from "../utils/authStorage";

export default function EditProfile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentWeight, setCurrentWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [height, setHeight] = useState("");

  const [calorieGoal, setCalorieGoal] = useState("");
  const [proteinGoal, setProteinGoal] = useState("");
  const [carbGoal, setCarbGoal] = useState("");
  const [fatGoal, setFatGoal] = useState("");
  const [waterGoal, setWaterGoal] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

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

      setName(data.name || "");
      setEmail(data.email || "");

      setCurrentWeight(data.weight != null ? String(data.weight) : "");

      setGoalWeight(
        data.target_weight != null ? String(data.target_weight) : "",
      );

      setHeight(data.height != null ? String(data.height) : "");

      setCalorieGoal(
        data.calorie_goal != null ? String(data.calorie_goal) : "",
      );

      setProteinGoal(
        data.protein_goal != null ? String(data.protein_goal) : "",
      );

      setCarbGoal(data.carb_goal != null ? String(data.carb_goal) : "");

      setFatGoal(data.fat_goal != null ? String(data.fat_goal) : "");

      setWaterGoal(data.water_goal != null ? String(data.water_goal) : "");
    } catch (error) {
      console.error("Could not load profile:", error);

      alert("Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    try {
      setSaving(true);

      const token = await getToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile/`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },

        body: JSON.stringify({
          name: name.trim(),

          email: email.trim().toLowerCase(),

          height: height.trim() === "" ? null : Number(height),

          weight: currentWeight.trim() === "" ? null : Number(currentWeight),

          target_weight: goalWeight.trim() === "" ? null : Number(goalWeight),

          calorie_goal: Number(calorieGoal),

          protein_goal: Number(proteinGoal),

          carb_goal: Number(carbGoal),

          fat_goal: Number(fatGoal),

          water_goal: Number(waterGoal),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        console.error("Profile update failed:", errorData);

        const errorMessage =
          errorData.email?.[0] ||
          errorData.name?.[0] ||
          errorData.height?.[0] ||
          errorData.weight?.[0] ||
          errorData.target_weight?.[0] ||
          errorData.calorie_goal?.[0] ||
          errorData.protein_goal?.[0] ||
          errorData.carb_goal?.[0] ||
          errorData.fat_goal?.[0] ||
          errorData.water_goal?.[0] ||
          errorData.detail ||
          "Could not save profile.";

        throw new Error(errorMessage);
      }

      router.replace("/profile");
    } catch (error) {
      console.error("Could not save profile:", error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Could not save profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}

        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Edit Profile</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Avatar */}

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name.trim().charAt(0).toUpperCase() || "U"}
            </Text>
          </View>

          <Pressable>
            <Text style={styles.changePhoto}>Change Photo</Text>
          </Pressable>
        </View>

        {/* Personal Information */}

        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.card}>
          <InputRow label="Name" value={name} onChangeText={setName} />

          <Divider />

          <InputRow
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        {/* Body Stats */}

        <Text style={styles.sectionTitle}>Body Stats</Text>

        <View style={styles.card}>
          <InputRow
            label="Current Weight"
            value={currentWeight}
            onChangeText={setCurrentWeight}
            unit="kg"
            keyboardType="decimal-pad"
          />

          <Divider />

          <InputRow
            label="Goal Weight"
            value={goalWeight}
            onChangeText={setGoalWeight}
            unit="kg"
            keyboardType="decimal-pad"
          />

          <Divider />

          <InputRow
            label="Height"
            value={height}
            onChangeText={setHeight}
            unit="cm"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Daily Goals */}

        <Text style={styles.sectionTitle}>Daily Goals</Text>

        <View style={styles.card}>
          <InputRow
            label="Calories"
            value={calorieGoal}
            onChangeText={setCalorieGoal}
            unit="kcal"
            keyboardType="number-pad"
          />

          <Divider />

          <InputRow
            label="Protein"
            value={proteinGoal}
            onChangeText={setProteinGoal}
            unit="g"
            keyboardType="number-pad"
          />

          <Divider />

          <InputRow
            label="Carbs"
            value={carbGoal}
            onChangeText={setCarbGoal}
            unit="g"
            keyboardType="number-pad"
          />

          <Divider />

          <InputRow
            label="Fat"
            value={fatGoal}
            onChangeText={setFatGoal}
            unit="g"
            keyboardType="number-pad"
          />

          <Divider />

          <InputRow
            label="Water"
            value={waterGoal}
            onChangeText={setWaterGoal}
            unit="L"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Save */}

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={saveChanges}
          disabled={saving}
        >
          <Text style={styles.saveText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* Reusable row */

type InputRowProps = {
  label: string;

  value: string;

  onChangeText: (text: string) => void;

  unit?: string;

  keyboardType?: "default" | "email-address" | "number-pad" | "decimal-pad";

  editable?: boolean;
};

function InputRow({
  label,
  value,
  onChangeText,
  unit,
  keyboardType = "default",
  editable = true,
}: InputRowProps) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputArea}>
        <TextInput
          style={[styles.input, !editable && styles.inputDisabled]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          selectTextOnFocus={editable}
          editable={editable}
        />

        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
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

  avatarSection: {
    alignItems: "center",
    marginTop: 28,
    marginBottom: 30,
  },

  avatar: {
    width: 90,
    height: 90,

    borderRadius: 45,

    backgroundColor: "#97FF79",

    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#151515",
  },

  changePhoto: {
    marginTop: 10,

    fontSize: 13,
    fontWeight: "700",
    color: "#555555",
  },

  sectionTitle: {
    marginTop: 18,
    marginBottom: 9,

    fontSize: 16,
    fontWeight: "800",
    color: "#151515",
  },

  card: {
    paddingHorizontal: 16,

    borderWidth: 1,
    borderColor: "#E9E7DF",
    borderRadius: 18,

    backgroundColor: "#FFFDF7",
  },

  inputRow: {
    minHeight: 62,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    flex: 1,

    fontSize: 13,
    fontWeight: "600",
    color: "#151515",
  },

  inputArea: {
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    minWidth: 90,
    maxWidth: 160,

    paddingVertical: 8,
    paddingHorizontal: 10,

    borderRadius: 10,

    backgroundColor: "#F7F6F0",

    fontSize: 13,
    fontWeight: "600",
    color: "#151515",

    textAlign: "right",
  },

  inputDisabled: {
    color: "#707070",
    backgroundColor: "#F1F0EB",
  },

  unit: {
    width: 36,
    marginLeft: 7,

    fontSize: 12,
    color: "#707070",
  },

  divider: {
    height: 1,
    backgroundColor: "#EFEEE8",
  },

  saveButton: {
    height: 52,

    marginTop: 28,

    borderRadius: 16,

    backgroundColor: "#97FF79",

    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#151515",
  },
});

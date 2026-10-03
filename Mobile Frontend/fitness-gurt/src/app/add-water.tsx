import { useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { API_BASE_URL } from "../utils/api";

import { getToken } from "../utils/authStorage";

import { router } from "expo-router";

const quickAmounts = [250, 500, 750, 1000];

export default function AddWater() {
  const [amount, setAmount] = useState(250);
  const [adding, setAdding] = useState(false);

  const decreaseAmount = () => {
    setAmount((current) => Math.max(50, current - 50));
  };

  const increaseAmount = () => {
    setAmount((current) => current + 50);
  };

  const addWater = async () => {
    try {
      setAdding(true);

      const token = await getToken();

      if (!token) {
        alert("You need to log in.");
        router.replace("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/water/`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },

        body: JSON.stringify({
          amount: amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Could not add water:", data);

        return;
      }

      console.log("Water logged:", data);

      router.replace("/");
    } catch (error) {
      console.error("Could not connect to Django:", error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Add Water</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Main Water Area */}
        <View style={styles.main}>
          <View style={styles.waterIconContainer}>
            <Text style={styles.waterIcon}>💧</Text>
          </View>

          <Text style={styles.question}>How much did you drink?</Text>

          <Text style={styles.subtitle}>Every sip counts!</Text>

          {/* Amount Control */}
          <View style={styles.amountControls}>
            <Pressable style={styles.amountButton} onPress={decreaseAmount}>
              <Text style={styles.amountButtonText}>−</Text>
            </Pressable>

            <View style={styles.amountDisplay}>
              <Text style={styles.amount}>{amount}</Text>

              <Text style={styles.unit}>mL</Text>
            </View>

            <Pressable style={styles.amountButton} onPress={increaseAmount}>
              <Text style={styles.amountButtonText}>+</Text>
            </Pressable>
          </View>

          {/* Quick Amounts */}
          <Text style={styles.quickTitle}>Quick Add</Text>

          <View style={styles.quickAmounts}>
            {quickAmounts.map((value) => (
              <Pressable
                key={value}
                style={[
                  styles.quickButton,
                  amount === value && styles.quickButtonActive,
                ]}
                onPress={() => setAmount(value)}
              >
                <Text
                  style={[
                    styles.quickText,
                    amount === value && styles.quickTextActive,
                  ]}
                >
                  {value === 1000 ? "1 L" : `${value} mL`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Add Button */}
        <Pressable
          style={[styles.addButton, adding && styles.disabledButton]}
          onPress={addWater}
          disabled={adding}
        >
          <Text style={styles.addButtonText}>
            {adding ? "Adding..." : `Add ${amount} mL`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF7",
  },

  content: {
    flex: 1,

    width: "100%",
    maxWidth: 430,
    alignSelf: "center",

    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 34,
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

  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  waterIconContainer: {
    width: 105,
    height: 105,

    borderRadius: 32,

    backgroundColor: "#E8F5FF",

    alignItems: "center",
    justifyContent: "center",
  },

  waterIcon: {
    fontSize: 60,
  },

  question: {
    marginTop: 22,

    fontSize: 20,
    fontWeight: "800",
    color: "#151515",

    textAlign: "center",
  },

  subtitle: {
    marginTop: 6,

    fontSize: 13,
    color: "#707070",
  },

  amountControls: {
    width: "100%",

    marginTop: 34,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  amountButton: {
    width: 54,
    height: 54,

    borderRadius: 17,

    backgroundColor: "#F0EFE8",

    alignItems: "center",
    justifyContent: "center",
  },

  amountButtonText: {
    fontSize: 28,
    lineHeight: 28,
    color: "#151515",
  },

  amountDisplay: {
    minWidth: 170,
    height: 80,

    borderWidth: 1,
    borderColor: "#E9E7DF",
    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",
  },

  amount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#151515",
  },

  unit: {
    marginTop: 1,

    fontSize: 12,
    color: "#707070",
  },

  quickTitle: {
    alignSelf: "flex-start",

    marginTop: 34,
    marginBottom: 10,

    fontSize: 15,
    fontWeight: "800",
    color: "#151515",
  },

  quickAmounts: {
    width: "100%",

    flexDirection: "row",
    gap: 8,
  },

  quickButton: {
    flex: 1,

    paddingVertical: 11,

    borderWidth: 1,
    borderColor: "#E9E7DF",
    borderRadius: 13,

    alignItems: "center",
  },

  quickButtonActive: {
    backgroundColor: "#E8F5FF",
    borderColor: "#B9DFFF",
  },

  quickText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#707070",
  },

  quickTextActive: {
    color: "#151515",
    fontWeight: "800",
  },

  addButton: {
    height: 52,

    borderRadius: 16,

    backgroundColor: "#97FF79",

    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#151515",
  },

  disabledButton: {
    opacity: 0.6,
  },
});

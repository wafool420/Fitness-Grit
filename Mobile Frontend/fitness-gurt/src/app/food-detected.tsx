import { Pressable, StyleSheet, Text, View } from "react-native";

import { router, useLocalSearchParams } from "expo-router";

export default function FoodDetected() {
  const params = useLocalSearchParams();

  const meal = typeof params.meal === "string" ? params.meal : "Breakfast";

  const name =
    typeof params.name === "string" ? params.name : "Grilled Chicken Breast";

  const icon = typeof params.icon === "string" ? params.icon : "🍗";

  const continueToDetails = () => {
    router.push({
      pathname: "/food-details",
      params: {
        meal,
        name,
        icon,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Food Detected</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Detection Result */}
        <View style={styles.resultArea}>
          <View style={styles.successBadge}>
            <Text style={styles.check}>✓</Text>
          </View>

          <Text style={styles.detectedText}>Food detected!</Text>

          <View style={styles.foodCard}>
            <View style={styles.foodIconContainer}>
              <Text style={styles.foodIcon}>{icon}</Text>
            </View>

            <Text style={styles.foodName}>{name}</Text>

            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>94% match</Text>
            </View>

            <Text style={styles.description}>
              We think this looks like {name}.
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Pressable style={styles.continueButton} onPress={continueToDetails}>
            <Text style={styles.continueText}>Continue</Text>
          </Pressable>

          <Pressable
            style={styles.scanAgainButton}
            onPress={() => router.back()}
          >
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </Pressable>
        </View>
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

  resultArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  successBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,

    backgroundColor: "#97FF79",

    alignItems: "center",
    justifyContent: "center",
  },

  check: {
    fontSize: 26,
    fontWeight: "800",
    color: "#151515",
  },

  detectedText: {
    marginTop: 12,

    fontSize: 17,
    fontWeight: "800",
    color: "#151515",
  },

  foodCard: {
    width: "100%",
    marginTop: 24,
    paddingVertical: 30,
    paddingHorizontal: 20,

    borderWidth: 1,
    borderColor: "#E9E7DF",
    borderRadius: 22,

    alignItems: "center",
  },

  foodIconContainer: {
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

    fontSize: 20,
    fontWeight: "800",
    color: "#151515",

    textAlign: "center",
  },

  confidenceBadge: {
    marginTop: 10,

    paddingHorizontal: 12,
    paddingVertical: 6,

    borderRadius: 20,

    backgroundColor: "#EEFFE8",
  },

  confidenceText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#397A2C",
  },

  description: {
    marginTop: 12,

    fontSize: 12,
    color: "#707070",

    textAlign: "center",
  },

  buttons: {
    gap: 10,
  },

  continueButton: {
    height: 52,

    borderRadius: 16,

    backgroundColor: "#97FF79",

    alignItems: "center",
    justifyContent: "center",
  },

  continueText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#151515",
  },

  scanAgainButton: {
    height: 48,

    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",
  },

  scanAgainText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#707070",
  },
});

import { useState } from "react";

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

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const createAccount = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Could not create account.");

        return;
      }

      console.log("Account created:", data);

      alert("Account created!");

      router.replace("/login");
    } catch (error) {
      console.error("Registration error:", error);

      alert("Could not connect to the server.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Create Account</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>🥑</Text>
          </View>

          <Text style={styles.title}>Let's get started!</Text>

          <Text style={styles.subtitle}>
            Create your account and start tracking.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#9A9A9A"
          />

          <Text style={styles.label}>Email</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#9A9A9A"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              placeholderTextColor="#9A9A9A"
              secureTextEntry={!showPassword}
            />

            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eye}>{showPassword ? "◉" : "◎"}</Text>
            </Pressable>
          </View>

          <Text style={styles.passwordHint}>Use at least 8 characters</Text>

          <Text style={styles.label}>Confirm Password</Text>

          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Enter password again"
            placeholderTextColor="#9A9A9A"
            secureTextEntry={!showPassword}
          />

          <Pressable style={styles.createButton} onPress={createAccount}>
            <Text style={styles.createText}>Create Account</Text>
          </Pressable>

          <View style={styles.loginRow}>
            <Text style={styles.loginQuestion}>Already have an account?</Text>

            <Pressable onPress={() => router.replace("/login")}>
              <Text style={styles.loginLink}>Log in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF7",
  },

  content: {
    flexGrow: 1,

    width: "100%",
    maxWidth: 430,
    alignSelf: "center",

    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 35,
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

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#151515",
  },

  headerSpacer: {
    width: 40,
  },

  hero: {
    alignItems: "center",
    marginTop: 30,
  },

  logo: {
    width: 72,
    height: 72,

    borderRadius: 23,

    backgroundColor: "#97FF79",

    alignItems: "center",
    justifyContent: "center",

    transform: [{ rotate: "3deg" }],
  },

  logoEmoji: {
    fontSize: 39,
  },

  title: {
    marginTop: 17,

    fontSize: 23,
    fontWeight: "900",
    color: "#151515",
  },

  subtitle: {
    marginTop: 5,

    fontSize: 12,
    color: "#707070",
  },

  form: {
    marginTop: 30,
  },

  label: {
    marginTop: 14,
    marginBottom: 7,

    fontSize: 12,
    fontWeight: "700",
    color: "#151515",
  },

  input: {
    height: 50,

    paddingHorizontal: 15,

    borderWidth: 1,
    borderColor: "#E5E3DB",
    borderRadius: 15,

    backgroundColor: "#FFFFFF",

    fontSize: 14,
    color: "#151515",
  },

  passwordContainer: {
    height: 50,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E5E3DB",
    borderRadius: 15,

    backgroundColor: "#FFFFFF",
  },

  passwordInput: {
    flex: 1,
    height: "100%",

    paddingLeft: 15,

    fontSize: 14,
    color: "#151515",
  },

  eyeButton: {
    width: 50,
    height: "100%",

    alignItems: "center",
    justifyContent: "center",
  },

  eye: {
    fontSize: 19,
    color: "#707070",
  },

  passwordHint: {
    marginTop: 6,

    fontSize: 10,
    color: "#8A8A8A",
  },

  createButton: {
    height: 54,

    marginTop: 28,

    borderRadius: 16,

    backgroundColor: "#97FF79",

    alignItems: "center",
    justifyContent: "center",
  },

  createText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#151515",
  },

  loginRow: {
    marginTop: 21,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 5,
  },

  loginQuestion: {
    fontSize: 12,
    color: "#707070",
  },

  loginLink: {
    fontSize: 12,
    fontWeight: "800",
    color: "#151515",
  },
});

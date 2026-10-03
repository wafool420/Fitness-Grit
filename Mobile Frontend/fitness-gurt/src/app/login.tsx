import { useState } from "react";

import { API_BASE_URL } from "../utils/api";

import { saveToken } from "../utils/authStorage";

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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const login = async () => {
    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Could not log in.");
        return;
      }

      console.log("Logged in:", data);

      await saveToken(data.token);

      router.replace("/");
    } catch (error) {
      console.error("Login error:", error);

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
        {/* Logo */}
        <View style={styles.topSection}>
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>✊</Text>
          </View>

          <Text style={styles.appName}>Fitness Grit</Text>

          <Text style={styles.tagline}>Track it. Eat well. Keep going.</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <Text style={styles.title}>Welcome back!</Text>

          <Text style={styles.subtitle}>Log in to continue your journey.</Text>

          {/* Email */}
          <Text style={styles.label}>Email</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#9A9A9A"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#9A9A9A"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword((current) => !current)}
            >
              <Text style={styles.eye}>{showPassword ? "◉" : "◎"}</Text>
            </Pressable>
          </View>

          {/* Forgot Password */}
          <Pressable style={styles.forgotButton}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          {/* Login */}
          <Pressable style={styles.loginButton} onPress={login}>
            <Text style={styles.loginText}>Log In</Text>
          </Pressable>

          {/* Register */}
          <View style={styles.registerRow}>
            <Text style={styles.registerQuestion}>New to Fitness Grit?</Text>

            <Pressable onPress={() => router.push("/register")}>
              <Text style={styles.registerLink}>Create account</Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Small steps still move you forward 🌱</Text>
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
    paddingTop: 70,
    paddingBottom: 30,
  },

  topSection: {
    alignItems: "center",
  },

  logo: {
    width: 82,
    height: 82,

    borderRadius: 26,

    backgroundColor: "#97FF79",

    alignItems: "center",
    justifyContent: "center",

    transform: [
      {
        rotate: "-3deg",
      },
    ],
  },

  logoEmoji: {
    fontSize: 45,
  },

  appName: {
    marginTop: 16,

    fontSize: 29,
    fontWeight: "900",

    color: "#151515",
  },

  tagline: {
    marginTop: 5,

    fontSize: 13,

    color: "#707070",
  },

  form: {
    width: "100%",

    marginTop: 48,
  },

  title: {
    fontSize: 23,
    fontWeight: "900",

    color: "#151515",
  },

  subtitle: {
    marginTop: 5,
    marginBottom: 26,

    fontSize: 13,

    color: "#707070",
  },

  label: {
    marginTop: 13,
    marginBottom: 7,

    fontSize: 12,
    fontWeight: "700",

    color: "#151515",
  },

  // Email
  input: {
    width: "100%",
    height: 52,

    paddingHorizontal: 15,

    borderWidth: 1,
    borderColor: "#E5E3DB",
    borderRadius: 15,

    backgroundColor: "#FFFFFF",

    fontSize: 14,

    color: "#151515",
  },

  // Password
  passwordContainer: {
    width: "100%",
    height: 52,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E5E3DB",
    borderRadius: 15,

    backgroundColor: "#FFFFFF",

    overflow: "hidden",
  },

  passwordInput: {
    flex: 1,
    height: "100%",

    paddingLeft: 15,
    paddingRight: 5,

    borderWidth: 0,

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

  forgotButton: {
    alignSelf: "flex-end",

    marginTop: 11,
  },

  forgotText: {
    fontSize: 12,
    fontWeight: "700",

    color: "#555555",
  },

  loginButton: {
    width: "100%",
    height: 54,

    marginTop: 25,

    borderRadius: 16,

    backgroundColor: "#97FF79",

    alignItems: "center",
    justifyContent: "center",
  },

  loginText: {
    fontSize: 15,
    fontWeight: "900",

    color: "#151515",
  },

  registerRow: {
    marginTop: 22,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    gap: 5,
  },

  registerQuestion: {
    fontSize: 12,

    color: "#707070",
  },

  registerLink: {
    fontSize: 12,
    fontWeight: "800",

    color: "#151515",
  },

  footer: {
    marginTop: "auto",

    paddingTop: 45,

    textAlign: "center",

    fontSize: 11,

    color: "#8B8B8B",
  },
});

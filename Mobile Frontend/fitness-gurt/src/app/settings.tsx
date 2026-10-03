import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";
import { deleteToken } from "../utils/authStorage";

export default function Settings() {
  const logout = async () => {
    try {
      await deleteToken();

      router.replace("/login");
    } catch (error) {
      console.error("Could not log out:", error);
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
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/profile");
              }
            }}
          >
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Settings</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.card}>
          <SettingToggle
            icon="🔔"
            title="Notifications"
            subtitle="Allow Fitness Gurt notifications"
            value={false}
            wip
          />

          <Divider />

          <SettingToggle
            icon="🍽️"
            title="Meal Reminders"
            subtitle="Remind me to log my meals"
            value={false}
            wip
          />

          <Divider />

          <SettingToggle
            icon="💧"
            title="Water Reminders"
            subtitle="Remind me to drink water"
            value={false}
            wip
          />
        </View>

        {/* Appearance */}
        <Text style={styles.sectionTitle}>Appearance</Text>

        <View style={styles.card}>
          <SettingToggle
            icon="☾"
            title="Dark Mode"
            subtitle="Use the dark appearance"
            value={false}
            wip
          />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.card}>
          <SettingToggle
            icon="⚖️"
            title="Metric Units"
            subtitle="kg, cm and liters"
            value={true}
            wip
          />
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.card}>
          <SettingButton
            icon="👤"
            title="Account"
            subtitle="Email, password and account details"
            wip
          />

          <Divider />

          <SettingButton
            icon="🔒"
            title="Privacy"
            subtitle="Manage your privacy settings"
            wip
          />
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.card}>
          <SettingButton
            icon="ⓘ"
            title="About Fitness Gurt"
            subtitle="Version 1.0.0"
            wip
          />
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// =====================================================
// SETTING TOGGLE
// =====================================================

type SettingToggleProps = {
  icon: string;
  title: string;
  subtitle: string;
  value: boolean;
  wip?: boolean;
};

function SettingToggle({
  icon,
  title,
  subtitle,
  value,
  wip = false,
}: SettingToggleProps) {
  return (
    <View style={[styles.settingRow, wip && styles.wipRow]}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.settingInfo}>
        <View style={styles.settingTitleRow}>
          <Text style={styles.settingTitle}>{title}</Text>

          {wip && <WipBadge />}
        </View>

        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>

      <Switch
        value={value}
        disabled={wip}
        trackColor={{
          false: "#DDDBD4",
          true: "#97FF79",
        }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

// =====================================================
// SETTING BUTTON
// =====================================================

type SettingButtonProps = {
  icon: string;
  title: string;
  subtitle: string;
  wip?: boolean;
};

function SettingButton({
  icon,
  title,
  subtitle,
  wip = false,
}: SettingButtonProps) {
  return (
    <Pressable style={[styles.settingRow, wip && styles.wipRow]} disabled={wip}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.settingInfo}>
        <View style={styles.settingTitleRow}>
          <Text style={styles.settingTitle}>{title}</Text>

          {wip && <WipBadge />}
        </View>

        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>

      {!wip && <Text style={styles.arrow}>›</Text>}
    </Pressable>
  );
}

// =====================================================
// WIP BADGE
// =====================================================

function WipBadge() {
  return (
    <View style={styles.wipBadge}>
      <Text style={styles.wipText}>WIP</Text>
    </View>
  );
}

// =====================================================
// DIVIDER
// =====================================================

function Divider() {
  return <View style={styles.divider} />;
}

// =====================================================
// STYLES
// =====================================================

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

  sectionTitle: {
    marginTop: 26,
    marginBottom: 9,

    fontSize: 15,
    fontWeight: "800",
    color: "#151515",
  },

  card: {
    paddingHorizontal: 15,

    borderWidth: 1,
    borderColor: "#E9E7DF",
    borderRadius: 18,

    backgroundColor: "#FFFDF7",
  },

  settingRow: {
    minHeight: 72,

    flexDirection: "row",
    alignItems: "center",
  },

  wipRow: {
    opacity: 0.65,
  },

  iconBox: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: "#F4F3ED",

    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 19,
  },

  settingInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  settingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  settingTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#151515",
  },

  settingSubtitle: {
    marginTop: 3,

    fontSize: 11,
    lineHeight: 15,
    color: "#707070",
  },

  // WIP Badge
  wipBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,

    borderRadius: 8,

    backgroundColor: "#EEFFE8",
  },

  wipText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#397A2C",
  },

  arrow: {
    fontSize: 26,
    color: "#A3A3A3",
  },

  divider: {
    height: 1,
    marginLeft: 52,
    backgroundColor: "#EFEEE8",
  },

  logoutButton: {
    height: 50,

    marginTop: 28,

    borderWidth: 1,
    borderColor: "#FFD4D4",
    borderRadius: 16,

    backgroundColor: "#FFF5F5",

    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#D94A4A",
  },
});

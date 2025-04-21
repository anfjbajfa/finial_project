import { useAuth } from "@/stores/auth";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import RoleSelect from "@/components/Auth/RoleSelect";
import LoginForm from "@/components/Auth/LoginForm";
import RegisterForm from "@/components/Auth/RegisterForm";
import { Ionicons } from "@expo/vector-icons";
import DormApplication from "@/components/DormMatch";
import ApplicationView from "@/components/ApplicationView";

export default function ApplicationScreen() {
  const { isLoggedIn, role, logout, first_name } = useAuth();
  const [authStage, setAuthStage] = useState<"select" | "login" | "register">(
    "select"
  );
  const [selectedRole, setSelectedRole] = useState<"student" | "admin" | null>(
    null
  );

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.authContainer}>
          {authStage !== "select" && (
            <TouchableOpacity
              onPress={() => setAuthStage("select")}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          )}
          {authStage === "select" && (
            <RoleSelect
              onSelectRole={(role) => {
                setSelectedRole(role);
                setAuthStage("login");
              }}
            />
          )}

          {authStage === "login" && selectedRole && (
            <LoginForm
              role={selectedRole}
              onRegister={() => setAuthStage("register")}
            />
          )}

          {authStage === "register" && (
            <RegisterForm onBack={() => setAuthStage("login")} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>
          🎉 Welcome, {role === "admin" ? "Administrator" : first_name}!
        </Text>
        {role === "student" && <DormApplication />}
        {role === "admin" && <ApplicationView />}
        <View style={styles.logoutWrapper}>
          <Button title="Logout" onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    padding: 24,
    paddingBottom: 80, // 给底部留空间
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  backButton: {
    position: "absolute",
    top: 28,
    left: 24,
    zIndex: 10,
  },
  logoutWrapper: {
    marginTop: 0,
    alignItems: "center",
  },
});

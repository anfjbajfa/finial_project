import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Button,
} from "react-native";
import { useAuth } from "@/stores/auth";
import ip from "@/constants/IP";
import AdminApplicationManagement from "./AdminApplicationManagement";

/**
 * <ApplicationView />
 * ────────────────────────────────────────────────────────────────────────────
 * • Admin  → List all applications
 * • Student→ Only show your own application
 */

type Application = {
  application_id: number;
  student_id: number;
  student_name?: string;
  hall_name: string;
  room_type: string;
  status: string;
  apply_time: string;
  email?: string;
  university?: string;
  home_address?: string;
  ssn?: string;
  nationality?: string;
  reason?: string;
  update_time?: string;
};

type Props = {
  onSelect?: (app: Application) => void;
};

export default function ApplicationView({ onSelect }: Props) {
  const { role, token, studentId, refreshFlag } = useAuth();
  const [applications, setApplications] = useState<Application[] | null>(null);

  // fetch applications according to the role
  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint =
          role === "admin"
            ? `http://${ip}:3000/authorized/admin/getapplications`
            : `http://${ip}:3000/authorized/student/getapplications/${studentId}`;

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          Alert.alert("Error", await res.text());
          setApplications([]);
        } else {
          const data = await res.json();
          setApplications(data || []);
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Server connection failed");
        setApplications([]);
      } finally {
      }
    };

    fetchData();
  }, [role, token, studentId, refreshFlag]);

  function handleDelete() {
    Alert.alert("Confirm Delete", "Once deleted, it cannot be recovered", [
      {
        text: "Cancel",
      },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            const res = await fetch(
              `http://${ip}:3000/authorized/student/delete`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  student_id: studentId,
                }),
              }
            );

            if (!res.ok) {
              Alert.alert("Error", await res.text());
              return;
            }

            Alert.alert("Application Deleted!");

            setApplications([]);
            useAuth.getState().triggerRefresh();
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "Server connection failed");
          }
        },
      },
    ]);
  }

  if (!applications || applications.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No applications found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ maxHeight: 250 }}>
      {role === "student" &&
        applications.map((app) => (
          <View key={app.application_id}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => onSelect?.(app)}
            >
              <Text style={styles.hall}>{app.hall_name}</Text>
              <Text>Room: {app.room_type}</Text>

              <Text>Status: {app.status}</Text>
              {app.status === "reject" && (
                <Text>Rejection_reason: {app.reason}</Text>
              )}

              <Text style={styles.time}>
                apply_time:{new Date(app.apply_time).toLocaleString()}
              </Text>
              <Text style={styles.time}>
                update_time:{new Date(app.update_time).toLocaleString()}
              </Text>
            </TouchableOpacity>
            <Button title="Delete" onPress={handleDelete} />
          </View>
        ))}

      {/* admin view */}
      {role === "admin" &&
        applications.map((app) => (
          <View key={app.application_id} style={styles.card}>
            <AdminApplicationManagement app={app} />
          </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", paddingVertical: 10 },
  card: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  hall: { fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  time: { color: "#666", fontSize: 12, marginTop: 4 },
});

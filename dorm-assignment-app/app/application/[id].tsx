import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
  TextInput,
} from "react-native";
import { useState } from "react";
import { useAuth } from "@/stores/auth";
import ip from "@/constants/IP";
export default function ApplicationDetail() {
  const {
    application_id,
    student_name,
    hall_name,
    room_type,
    status,
    email,
    university,
    home_address,
    ssn,
    nationality,
    reason,
    update_time,
  } = useLocalSearchParams();
  const router = useRouter();
  const [rejectReason, setRejectReason] = useState("");
  const [showReasonBox, setShowReasonBox] = useState(false);
  const { token } = useAuth();

  const fields = [
    { label: "Student ID", value: application_id },
    { label: "Studnet Name", value: student_name },
    { label: "University", value: university },
    { label: "Nationality", value: nationality },
    { label: "Email", value: email },
    { label: "Dorm", value: hall_name },
    { label: "Room Type", value: room_type },
    { label: "Status", value: status },
    { label: "Home Address", value: home_address },
    { label: "SSN", value: ssn },
    { label: "Reason", value: reason },
    { label: "Update_time", value: update_time },
  ];

  function acceptHandler() {
    Alert.alert("Are you sure to accept this application?", "", [
      {
        text: "Cancel",
      },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            const res = await fetch(
              `http://${ip}:80/authorized/admin/acceptApplication`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  application_id: application_id,
                }),
              }
            );

            if (!res.ok) {
              Alert.alert("Error", await res.text());
              return;
            }

            Alert.alert("Operation Done!");
            useAuth.getState().triggerRefresh();

            router.back();
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "Server connection failed");
          }
        },
      },
    ]);
  }

  function getStatusStyle(status: string | string[] | undefined) {
    const s = typeof status === "string" ? status.toLowerCase() : "";
    switch (s) {
      case "accept":
        return styles.accepted;
      case "reject":
        return styles.rejected;
      case "pending":
      default:
        return styles.pending;
    }
  }

  function getStatusIcon(status: string | string[] | undefined) {
    const s = typeof status === "string" ? status.toLowerCase() : "";
    switch (s) {
      case "accept":
        return "✅";
      case "reject":
        return "❌";
      case "pending":
      default:
        return "⏳";
    }
  }

  function openReasonBox() {
    setRejectReason("");
    setShowReasonBox(true);
  }

  function rejectHandler(inputReason: string) {
    Alert.alert("Are you sure to reject this application?", "", [
      {
        text: "Cancel",
      },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            const res = await fetch(
              `http://${ip}:80/authorized/admin/rejectApplication`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  application_id: application_id,
                  reason: inputReason,
                }),
              }
            );

            if (!res.ok) {
              Alert.alert("Error", await res.text());
              return;
            }

            Alert.alert("Operation Done!");
            useAuth.getState().triggerRefresh();
            setShowReasonBox(false);
            router.back();
          } catch (err) {
            console.error(err);
            Alert.alert("Error", "Server connection failed");
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {fields.map((item) => {
          if (
            item.label === "Reason" &&
            (!item.value || item.value === "null")
          ) {
            return null;
          }

          return (
            <View key={item.label} style={styles.item}>
              <Text style={styles.label}>{item.label}</Text>
              {item.label === "Status" ? (
                <Text style={[styles.badge, getStatusStyle(item.value)]}>
                  {getStatusIcon(item.value)} {item.value}
                </Text>
              ) : (
                <Text style={styles.value}>{item.value || "N/A"}</Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={{ marginBottom: 50 }}>
        <Button title="Accept" onPress={acceptHandler}></Button>
        <Button title="Reject" onPress={openReasonBox}></Button>
      </View>

      {showReasonBox && (
        <View style={styles.promptOverlay}>
          <View style={styles.promptBox}>
            <Text style={styles.label}>Enter rejection reason:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. incomplete info..."
              value={rejectReason}
              onChangeText={setRejectReason}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              <Button title="Cancel" onPress={() => setShowReasonBox(false)} />
              <View style={{ width: 10 }} />
              <Button
                title="Confirm"
                onPress={() => {
                  if (!rejectReason.trim()) {
                    Alert.alert(
                      "Reason Required",
                      "Please enter a rejection reason."
                    );
                    return;
                  }
                  rejectHandler(rejectReason);
                }}
              />
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  item: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },

  badge: {
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    overflow: "hidden",
  },

  pending: {
    backgroundColor: "#fef3c7", // light amber
    color: "#b45309", // amber text
  },

  accepted: {
    backgroundColor: "#d1fae5", // light green
    color: "#047857", // green text
  },

  rejected: {
    backgroundColor: "#fee2e2", // light red
    color: "#b91c1c", // red text
  },

  promptOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 10,
  },
  promptBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "100%",
    maxWidth: 400,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 44,
    backgroundColor: "#fff",
    marginTop: 10,
  },
});

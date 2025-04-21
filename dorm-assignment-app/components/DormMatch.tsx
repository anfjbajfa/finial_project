import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import SelectInput from "@/components/SelectInput";
import ip from "../constants/IP";
import roomTypes from "@/constants/Room_type";
import department from "@/constants/department";
import { useAuth } from "@/stores/auth";
import ApplicationView from "@/components/ApplicationView";

// ────────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────────
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.8; // bottom‑sheet covers 80 % of the screen

export default function DormApplication() {
  const { token, studentId } = useAuth();
  const triggerRefresh = useAuth((s) => s.triggerRefresh);

  // ────────────────────────────────────────────────────────────────────────────
  // State
  // ────────────────────────────────────────────────────────────────────────────
  const [dormRankList, setDormRankList] = useState([]); // raw list from server
  const [selectedDorm, setSelectedDorm] = useState(null); // current detail item
  const [panelVisible, setPanelVisible] = useState(false);

  // unique list (hall_id + room_type)
  const uniqueDorms = useMemo(() => {
    const seen = new Set();
    return dormRankList.filter((d) => {
      const k = `${d.hall_id}-${d.room_type}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [dormRankList]);

  // bottom‑sheet animation (translateY)
  const panelY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  // form state
  const [form, setForm] = useState({
    student_id: studentId,
    department: "",
    max_budget: "",
    room_type: "",
    gender_inclusive: "",
    weight_department: "",
    weight_budget: "",
    weight_room_type: "",
    weight_gender: "",
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────────────────────────────────────
  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePress = async () => {
    const required = [
      "department",
      "max_budget",
      "room_type",
      "gender_inclusive",
      "weight_department",
      "weight_budget",
      "weight_room_type",
      "weight_gender",
    ];
    const missing = required.filter((k) => !form[k]);
    if (missing.length) {
      Alert.alert("Missing Fields", `Please fill: ${missing.join(", ")}`);
      return;
    }

    const weightSum = [
      parseFloat(form.weight_department),
      parseFloat(form.weight_budget),
      parseFloat(form.weight_room_type),
      parseFloat(form.weight_gender),
    ].reduce((a, b) => a + b, 0);

    if (Math.abs(weightSum - 1) > 0.01) {
      Alert.alert("Invalid Weights", "All weights must sum to 1.0");
      return;
    }

    try {
      const res = await fetch(`http://${ip}:3000/authorized/student/getRank`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          student_id: form.student_id,
          department: form.department,
          max_budget: parseFloat(form.max_budget),
          room_type: form.room_type,
          gender_inclusive: form.gender_inclusive === "Yes",
          weights: JSON.stringify({
            department: parseFloat(form.weight_department),
            max_budget: parseFloat(form.weight_budget),
            room_type: parseFloat(form.weight_room_type),
            gender_inclusive: parseFloat(form.weight_gender),
          }),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        Alert.alert("Error", text || "Submission failed.");
        return;
      }

      const data = await res.json();
      setSelectedDorm(null);
      setDormRankList(data.rank);
      triggerRefresh();

      setPanelVisible(true);
      Animated.timing(panelY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Error",
        "Server connection failed or you submit application twice"
      );
    }
  };

  const closePanel = () => {
    Animated.timing(panelY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setPanelVisible(false);
      setSelectedDorm(null);
      setDormRankList([]);
    });
  };

  const submitApplication = async () => {
    if (!selectedDorm) {
      return;
    }

    // confirmation popup
    Alert.alert(
      "Confirm Application",
      "Each student can only submit one application. Do you want to proceed?",
      [
        {
          text: "Cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const res = await fetch(
                `http://${ip}:3000/authorized/student/apply`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    student_id: studentId,
                    hall_id: selectedDorm.hall_id,
                    room_type: selectedDorm.room_type,
                  }),
                }
              );

              if (!res.ok) {
                Alert.alert("Error", await res.text());
                return;
              }

              Alert.alert(
                "Application submitted!",
                "Your request has been recorded."
              );

              triggerRefresh();

              closePanel();
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Server connection failed");
            }
          },
        },
      ]
    );
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      {/* ────────────── Form ────────────── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Dormitory Match</Text>

        {/* Department + weight */}
        <View style={styles.rowWrapper}>
          <View style={{ flex: 3 }}>
            <SelectInput
              label="Department *"
              placeholder="Your department"
              value={form.department}
              options={department}
              onChange={(v) => handleChange("department", v)}
            />
          </View>
          <View style={styles.weightWrapper}>
            <Text style={styles.label}>Weight *</Text>
            <TextInput
              placeholder="0.25"
              keyboardType="numeric"
              value={form.weight_department}
              onChangeText={(v) => handleChange("weight_department", v)}
              style={styles.input}
            />
          </View>
        </View>

        {/* Budget + weight */}
        <View style={styles.rowWrapper}>
          <View style={{ flex: 3 }}>
            <Text style={styles.label}>Max Budget *</Text>
            <TextInput
              placeholder="Max budget ($)"
              keyboardType="numeric"
              value={form.max_budget}
              onChangeText={(v) => handleChange("max_budget", v)}
              style={styles.input}
            />
          </View>
          <View style={styles.weightWrapper}>
            <Text style={styles.label}>Weight *</Text>
            <TextInput
              placeholder="0.25"
              keyboardType="numeric"
              value={form.weight_budget}
              onChangeText={(v) => handleChange("weight_budget", v)}
              style={styles.input}
            />
          </View>
        </View>

        {/* Room Type + weight */}
        <View style={styles.rowWrapper}>
          <View style={{ flex: 3 }}>
            <SelectInput
              label="Room Type *"
              placeholder="Select room type..."
              value={form.room_type}
              options={roomTypes}
              onChange={(v) => handleChange("room_type", v)}
            />
          </View>
          <View style={styles.weightWrapper}>
            <Text style={styles.label}>Weight *</Text>
            <TextInput
              placeholder="0.25"
              keyboardType="numeric"
              value={form.weight_room_type}
              onChangeText={(v) => handleChange("weight_room_type", v)}
              style={styles.input}
            />
          </View>
        </View>

        {/* Gender Inclusive + weight */}
        <View style={styles.rowWrapper}>
          <View style={{ flex: 3 }}>
            <SelectInput
              label="Gender Inclusive *"
              placeholder="Yes or No"
              value={form.gender_inclusive}
              options={["Yes", "No"]}
              onChange={(v) => handleChange("gender_inclusive", v)}
            />
          </View>
          <View style={styles.weightWrapper}>
            <Text style={styles.label}>Weight *</Text>
            <TextInput
              placeholder="0.25"
              keyboardType="numeric"
              value={form.weight_gender}
              onChangeText={(v) => handleChange("weight_gender", v)}
              style={styles.input}
            />
          </View>
        </View>

        <Button title="Get Rank & Apply" onPress={handlePress} />
        {/* <Button title="Logout" onPress={logout} /> */}

        <Text style={[styles.title, { marginTop: 30 }]}>Your Application</Text>
        <Text style={{ marginBottom: 10 }}>
          * Every student can only have one application.If you want to change or
          getting rejected by admin, please delete and re-apply
        </Text>
        <ApplicationView></ApplicationView>
      </ScrollView>

      {/* ────────────── Bottom‑sheet ────────────── */}
      {panelVisible && (
        <Animated.View
          style={[styles.bottomPanel, { transform: [{ translateY: panelY }] }]}
        >
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>
              {selectedDorm
                ? selectedDorm.name
                : "Ranking List (Highest → Lowest)"}
            </Text>
            <TouchableOpacity onPress={closePanel}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Detail view */}
          {selectedDorm ? (
            <>
              <ScrollView style={styles.panelContent}>
                <Text>
                  <Text style={styles.detailKey}>Room Type: </Text>
                  <Text style={styles.detailValue}>
                    {selectedDorm.room_type}
                  </Text>
                </Text>
                <Text>
                  <Text style={styles.detailKey}>Price per year: </Text>
                  <Text style={styles.detailValue}>
                    {selectedDorm.price_year}
                  </Text>
                </Text>
                <Text>
                  <Text style={styles.detailKey}>Gender Inclusive: </Text>
                  <Text style={styles.detailValue}>
                    {selectedDorm.gender_inclusive ? "Yes" : "No"}
                  </Text>
                </Text>
                <Text>
                  <Text style={styles.detailKey}>Distance: </Text>
                  <Text style={styles.detailValue}>
                    {(selectedDorm.distance_meters / 1000).toFixed(2)} km
                  </Text>
                </Text>
                <Text>
                  <Text style={styles.detailKey}>Score: </Text>
                  <Text style={styles.detailValue}>
                    {selectedDorm.match_score.toFixed(3)}
                  </Text>
                </Text>
              </ScrollView>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setSelectedDorm(null)}
                >
                  <Text style={styles.actionText}>← Back to list</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={submitApplication}
                >
                  <Text style={styles.actionText}>Apply this dorm</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <ScrollView style={styles.panelContent}>
              {uniqueDorms.map((dorm, index) => (
                <TouchableOpacity
                  key={`${dorm.hall_id}-${dorm.room_type}`}
                  style={styles.dormItem}
                  onPress={() => setSelectedDorm(dorm)}
                >
                  <Text style={styles.dormName}>
                    {index + 1}. {dorm.name}
                  </Text>
                  <Text>Room Type: {dorm.room_type}</Text>
                  <Text>Score: {dorm.match_score.toFixed(3)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      )}
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 120, // give space for the sheet handle
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  rowWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  weightWrapper: {
    flex: 1,
    marginLeft: 10,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 44,
    backgroundColor: "#fff",
  },
  // bottom‑sheet
  bottomPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_HEIGHT,
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },
  panelTitle: { fontSize: 18, fontWeight: "bold" },
  closeButton: { fontSize: 20, padding: 5 },

  panelContent: { paddingVertical: 8 },

  dormItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  dormName: {
    fontSize: 16,
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: SCREEN_HEIGHT * 0.2,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#467fd0",
    borderRadius: 6,
  },
  actionText: { color: "#fff", fontWeight: "600" },

  detailKey: {
    fontWeight: "bold",
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
  },
});

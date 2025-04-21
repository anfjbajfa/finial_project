import React, { useEffect, useState } from "react";
import { Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

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
  reason?:string;
  update_time?:string;
};

export default function AdminApplicationManagement({
  app,
}: {
  app: Application;
}) {
  const router = useRouter();
  function handleClick() {
    router.push({
      pathname: "/application/[id]",
      params: {
        id: String(app.application_id), // must be string
        ...app, // the app application
      },
    });
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handleClick}>
      <Text>Application ID: {app.application_id}</Text>
      <Text>Student Name: {app.student_name}</Text>
      <Text>Dorm: {app.hall_name}</Text>
      <Text>Status: {app.status}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    padding: 10,
    backgroundColor: "#f1f1f1",
    borderRadius: 6,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

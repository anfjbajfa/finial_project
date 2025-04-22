// components/Auth/LoginForm.tsx
import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/stores/auth';
import ip from "../../constants/IP"

export default function LoginForm({
  role,
  onRegister,
}: {
  role: 'student' | 'admin';
  onRegister?: () => void;
}) {
  const { login, role: currentRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async() => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      const res = await fetch(`http://${ip}:80/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.ok&&data.token) {
        // if login successful
        login(role,data.token,data.first_name,data.id); // pass token information
        Alert.alert('Success', 'Logged in successfully');
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Network Error', 'Unable to connect to server');
    }
  };

  return (
    <View>
    <Text style={styles.title}>Login as {role}</Text>

    <TextInput
      placeholder="Email"
      style={styles.input}
      value={email}
      onChangeText={setEmail}
      autoCapitalize="none"
      keyboardType="email-address"
    />
    <TextInput
      placeholder="Password"
      secureTextEntry
      style={styles.input}
      value={password}
      onChangeText={setPassword}
    />
    <Button title="Login" onPress={handleLogin} />

    {role === 'student' && onRegister && (
      <TouchableOpacity onPress={onRegister}>
        <Text style={styles.link}>No account? Register here</Text>
      </TouchableOpacity>
    )}
  </View>
);
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007AFF',
    fontSize: 16,
  },
});

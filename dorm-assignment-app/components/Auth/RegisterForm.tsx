import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { countries } from '@/constants/Countries';
import ip from "@/constants/IP"
import SelectInput from "@/components/SelectInput"


const universities = ['University of Wisconsin‑Madison', 'other'];
/* register form */
export default function RegisterForm({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    age: '',
    gender: '',
    university: '',
    ssn: '',
    nationality: '',
    home_address: '',
    ssn_pic: '',
    role: 'student',
  });

  const handleChange = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  /* choose pic*/
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });
    if (!res.canceled) handleChange('ssn_pic', res.assets[0].uri);
  };

  /* registeration submit */
  const handleRegister = async () => {
    const required = [
      'email',
      'password',
      'first_name',
      'last_name',
      'age',
      'gender',
      'university',
      'ssn',
      'nationality',
      'home_address',
      'role',
    ];
    const missing = required.filter(k => !form[k as keyof typeof form]);
    if (missing.length) {
      Alert.alert('Missing Fields', `Please fill: ${missing.join(', ')}`);
      return;
    }

    try {
      const res = await fetch(`http://${ip}:3000/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, age: parseInt(form.age, 10) }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Registration complete!');
        onBack();
      } else {
        Alert.alert('Error', data.error || 'Register failed.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Server connection failed');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Student Registration</Text>

      {/* text input*/}
      {[
        ['first_name', 'First Name *'],
        ['last_name', 'Last Name *'],
        ['age', 'Age *'],
        ['ssn', 'SSN *'],
        ['email', 'Email *'],
        ['password', 'Password *'],
        ['home_address', 'Home Address *'],

      ].map(([key, label]) => (
        <View key={key} style={styles.fieldWrapper}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            placeholder={label}
            secureTextEntry={key === 'password'}
            keyboardType={key === 'age' ? 'numeric' : 'default'}
            style={styles.input}
            value={form[key as keyof typeof form]}
            onChangeText={v => handleChange(key, v)}
          />
        </View>
      ))}

      {/* selectInput*/}
      <SelectInput
        label="Gender *"
        placeholder="Select gender..."
        value={form.gender}
        options={['Male', 'Female', 'Other']}
        onChange={v => handleChange('gender', v)}
        style={styles.selectInput}
      />

      <SelectInput
        label="University *"
        placeholder="Select university..."
        value={form.university}
        options={universities}
        onChange={v => handleChange('university', v)}
        style={styles.selectInput}
      />

      <SelectInput
        label="Nationality *"
        placeholder="Select nationality..."
        value={form.nationality}
        options={countries}
        onChange={v => handleChange('nationality', v)}
        style={styles.selectInput}
      />

      
<View style={styles.fieldWrapper}>
  <Text style={styles.label}>SSN Picture (Optional)</Text>
  
  {form.ssn_pic ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
      <Image source={{ uri: form.ssn_pic }} style={styles.preview} />
      <TouchableOpacity
        onPress={() => handleChange('ssn_pic', '')}
        style={styles.deleteBtn}
      >
        <Text style={styles.deleteTxt}>Delete</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
      <Text style={styles.uploadTxt}>Upload SSN Image</Text>
    </TouchableOpacity>
  )}
</View>

      <Button title="Register" onPress={handleRegister} />
      <Button title="Back to Login" onPress={onBack} color="#777" />
    </ScrollView>
  );
}

/* ---------- style ---------- */
const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 70, marginTop:20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldWrapper: { marginBottom: 20 },
  label: { fontWeight: 'bold', marginBottom: 4 },
  /* TextInput & SelectInput */
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 44,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },


  uploadBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 6,
  },
  uploadTxt: { color: '#fff', textAlign: 'center' },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },

  /* dragdown panel*/
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000030',
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: { fontSize: 16 },


  deleteBtn: {
    marginLeft: 10,
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteTxt: {
    color: '#fff',
    fontWeight: 'bold',
  },

  selectInput:{marginBottom:20}
});

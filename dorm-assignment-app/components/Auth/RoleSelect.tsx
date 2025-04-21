// components/Auth/RoleSelect.tsx
import { View, Text, Button, StyleSheet } from 'react-native';

export default function RoleSelect({ onSelectRole }: { onSelectRole: (r: 'student' | 'admin') => void }) {
  return (
    <View>
      <Text style={styles.title}>Please select your role</Text>
      <Button title="👨‍🎓 I am a Student" onPress={() => onSelectRole('student')} />
      <View style={{ height: 16 }} />
      <Button title="👨‍💼 I am an Administrator" onPress={() => onSelectRole('admin')} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
});

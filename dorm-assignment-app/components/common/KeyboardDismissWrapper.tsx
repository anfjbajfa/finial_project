import React from 'react';
import {
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  ViewStyle,
  StyleProp,
} from 'react-native';

export default function KeyboardDismissWrapper({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView
        contentContainerStyle={[{ flexGrow: 1}, style]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

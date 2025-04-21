import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Modal,
  Pressable,
  LayoutRectangle,
  Dimensions,
  TouchableOpacity,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

/* ---------- draggable & searchable select ---------- */
type SelectInputProps = {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  style?: StyleProp<ViewStyle>;
};

export default function SelectInput({
  label,
  placeholder,
  value,
  options,
  onChange,
  style,
}: SelectInputProps) {
  const [visible, setVisible] = useState(false);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);
  const [query, setQuery] = useState("");
  const [dismissCount, setDismissCount] = useState(0);
  const wrapperRef = useRef<View>(null);
  const { height: screenH } = Dimensions.get("window");

  const open = () => {
    // reset our two‑tap counter
    setDismissCount(0);
    wrapperRef.current?.measureInWindow((x, y, w, h) => {
      setAnchor({ x, y, width: w, height: h });
      setVisible(true);
    });
  };

  const filteredOptions = useMemo(
    () =>
      options.filter((opt) => opt.toLowerCase().includes(query.toLowerCase())),
    [query, options]
  );

  const dropdownStyle = () => {
    if (!anchor) return {};
    const maxListH = Math.min(250, screenH * 0.5);
    const belowY = anchor.y + anchor.height;
    const fitsBelow = belowY + maxListH <= screenH;
    return {
      position: "absolute" as const,
      top: fitsBelow ? belowY : undefined,
      bottom: fitsBelow ? undefined : screenH - anchor.y + 2,
      left: anchor.x,
      width: anchor.width,
      maxHeight: maxListH,
      backgroundColor: "#fff",
      borderRadius: 6,
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 4,
      paddingVertical: 8,
    };
  };

  return (
    <View style={[styles.fieldWrapper, style]}>
      <Text style={styles.label}>{label}</Text>

      {/* input appearance */}
      <TouchableOpacity
        ref={wrapperRef}
        style={styles.input}
        onPress={open}
        activeOpacity={0.7}
      >
        <Text style={{ color: value ? "#000" : "#888" }}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      {/* dropdown panel */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setVisible(false);
          setQuery("");
        }}
      >
        {/* overlay: handle first vs second tap */}
        <Pressable
          style={styles.overlay}
          onPress={() => {
            if (dismissCount === 0) {
              // first tap: only dismiss keyboard
              Keyboard.dismiss();
              setDismissCount(1);
            } else {
              // second tap: close dropdown
              setVisible(false);
              setQuery("");
              setDismissCount(0);
            }
          }}
        />

        {anchor && (
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={dropdownStyle()}>
                <TextInput
                  placeholder="Search..."
                  value={query}
                  onChangeText={setQuery}
                  style={styles.searchInput}
                  autoFocus
                />
                <ScrollView keyboardShouldPersistTaps="handled">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={styles.option}
                        onPress={() => {
                          onChange(opt);
                          setVisible(false);
                          setQuery("");
                          setDismissCount(0);
                        }}
                      >
                        <Text style={styles.optionText}>{opt}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noMatch}>No results</Text>
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrapper: {},
  label: { fontWeight: "bold", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 44,
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00000030",
  },

  searchInput: {
    height: 40,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginBottom: 4,
    borderRadius: 4,
  },

  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: { fontSize: 16 },
  noMatch: {
    textAlign: "center",
    color: "#888",
    paddingVertical: 20,
  },
});

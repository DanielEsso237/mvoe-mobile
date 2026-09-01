import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "bulu", label: "Bulu" },
  { code: "en", label: "English" },
];

interface Props {
  onSelect?: (code: string) => void;
}

export default function LanguageSelector({ onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (code: string) => {
    setSelected(code);
    onSelect?.(code);
  };

  return (
    <View style={styles.container}>
      {LANGUAGES.map((lang) => {
        const isActive = selected === lang.code;
        return (
          <TouchableOpacity
            key={lang.code}
            onPress={() => handleSelect(lang.code)}
            activeOpacity={0.8}
            style={[styles.card, isActive && styles.activeCard]}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {lang.label}
            </Text>
            <Ionicons
              name={isActive ? "radio-button-on" : "radio-button-off"}
              size={22}
              color={isActive ? Colors.primary : Colors.textMuted}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.cardBg,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  activeCard: {
    backgroundColor: Colors.activeBg,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
  },
  activeLabel: {
    fontWeight: "bold",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/colors";

export default function ComingSoon({ label }: { label: string }) {
  return (
    <View style={styles.container}>
      <Ionicons name="construct-outline" size={32} color={Colors.textMuted} />
      <Text style={styles.text}>{label} — bientôt disponible.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  text: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
  },
});

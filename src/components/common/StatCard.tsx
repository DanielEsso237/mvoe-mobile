import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/colors";

interface Props {
  label: string;
  value: number | string;
  progress?: number; // 0 to 1
}

export default function StatCard({ label, value, progress }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {typeof progress === "number" && (
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(progress * 100)}%` },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.text,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginTop: 14,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primaryDark,
    borderRadius: 2,
  },
});

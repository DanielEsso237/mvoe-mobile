import { Colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  value: string;
  label: string;
  description?: string;
  valueColor?: string;
}

export default function StatCardText({
  value,
  label,
  description,
  valueColor = Colors.text,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  value: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

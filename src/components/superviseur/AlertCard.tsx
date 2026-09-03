import { Colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

interface AlertItem {
  value: number;
  text: string;
  color: string;
}

interface Props {
  items: AlertItem[];
}

export default function AlertCard({ items }: Props) {
  return (
    <View style={styles.card}>
      {items.map((item, index) => (
        <View
          key={index}
          style={[styles.row, index < items.length - 1 && styles.rowBorder]}
        >
          <Text style={[styles.value, { color: item.color }]}>
            {item.value}
          </Text>
          <Text style={styles.text}>{item.text}</Text>
        </View>
      ))}
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
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  rowBorder: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
    minWidth: 24,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

import { useNetworkStatus } from "@/hooks/use-network-status";
import { StyleSheet, Text, View } from "react-native";

export default function NetworkPill() {
  const isOnline = useNetworkStatus();

  const label = isOnline === null ? "Réseau" : isOnline ? "En ligne" : "Hors ligne";
  const dotColor = isOnline === null ? "#9CA3AF" : isOnline ? "#10B981" : "#EF4444";

  return (
    <View style={styles.pill}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

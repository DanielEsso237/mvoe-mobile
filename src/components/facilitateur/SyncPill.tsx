import { useSyncQueue } from "@/hooks/use-sync-queue";
import { StyleSheet, Text, View } from "react-native";

export default function SyncPill() {
  const file = useSyncQueue();
  const enAttente = file.filter((e) => e.statut === "en_attente").length;

  if (enAttente === 0) return null;

  return (
    <View style={styles.pill}>
      <Text style={styles.text}>
        {enAttente} non synchronisé{enAttente > 1 ? "s" : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: "#FEF3C7",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400E",
  },
});

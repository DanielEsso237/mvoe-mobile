import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  title: string;
  showBack?: boolean;
}

export default function ParentHeader({ title, showBack = true }: Props) {
  const router = useRouter();
  const { parent, setParentSession } = useAuth();

  const handleSortir = () => {
    setParentSession(null).then(() => router.replace("/parent"));
  };

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity
          onPress={() => router.push("/parent/accueil")}
          style={styles.iconBtn}
          hitSlop={10}
        >
          <Ionicons name="home-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
      <Text style={styles.title}>{title}</Text>
      {parent?.programme ? (
        <TouchableOpacity onPress={handleSortir} hitSlop={10}>
          <Text style={styles.sortirText}>Sortir</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    gap: 12,
  },
  spacer: {
    width: 36,
    height: 36,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  sortirText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});

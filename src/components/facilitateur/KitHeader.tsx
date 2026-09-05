import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import FacilitateurAccountMenu from "./FacilitateurAccountMenu";
import NetworkPill from "./NetworkPill";
import SyncPill from "./SyncPill";

interface Props {
  title: string;
  onMenuPress: () => void;
}

export default function KitHeader({ title, onMenuPress }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn} hitSlop={10}>
          <Ionicons name="menu" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <FacilitateurAccountMenu />
      </View>
      <View style={styles.pillsRow}>
        <NetworkPill />
        <SyncPill />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  pillsRow: {
    flexDirection: "row",
    gap: 8,
  },
});

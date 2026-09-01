import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/colors";

interface Props {
  title: string;
  onMenuPress: () => void;
  avatarLetter?: string;
}

export default function DashboardHeader({
  title,
  onMenuPress,
  avatarLetter = "D",
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <TouchableOpacity
          onPress={onMenuPress}
          hitSlop={10}
          style={styles.menuButton}
        >
          <Ionicons name="menu-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.right}>
        <TouchableOpacity hitSlop={10} style={styles.iconButton}>
          <Ionicons
            name="sunny-outline"
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity hitSlop={10} style={styles.iconButton}>
          <Ionicons
            name="notifications-outline"
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  menuButton: {
    padding: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  avatarText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
});

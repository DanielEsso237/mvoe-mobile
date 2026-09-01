import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { MenuKey, SUPERVISEUR_MENU } from "@/constants/menu";

interface Props {
  visible: boolean;
  onClose: () => void;
  activeKey: MenuKey;
  regionName?: string;
}

const SIDEBAR_WIDTH = Math.min(320, Dimensions.get("window").width * 0.82);

export default function Sidebar({
  visible,
  onClose,
  activeKey,
  regionName = "EBOLOWA II",
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -SIDEBAR_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateX, backdropOpacity]);

  const handleNavigate = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            {
              width: SIDEBAR_WIDTH,
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 12,
              transform: [{ translateX }],
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.logoRow}>
              <View style={styles.logoBox}>
                <Text style={styles.logoIcon}>☰</Text>
              </View>
              <Text style={styles.brand}>Mvoé</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={10}
              style={styles.collapseButton}
            >
              <Ionicons
                name="chevron-back"
                size={16}
                color={Colors.textMuted}
              />
              <Ionicons
                name="chevron-back"
                size={16}
                color={Colors.textMuted}
                style={styles.collapseOverlap}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.regionRow}>
              <Text style={styles.regionDash}>—</Text>
              <Text style={styles.regionLabel}>{regionName}</Text>
            </View>

            <View style={styles.menuList}>
              {SUPERVISEUR_MENU.map((item) => {
                const isActive = item.key === activeKey;
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => handleNavigate(item.route)}
                    activeOpacity={0.7}
                    style={[styles.menuItem, isActive && styles.menuItemActive]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={isActive ? Colors.text : Colors.textMuted}
                      style={styles.menuIcon}
                    />
                    <Text
                      style={[
                        styles.menuLabel,
                        isActive && styles.menuLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.footerNote}>
            <Text style={styles.footerText}>
              Aucun compte ne se crée ici sans qu&apos;un niveau supérieur
              l&apos;enregistre.
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 15, 25, 0.35)",
  },
  panel: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logoIcon: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  brand: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  collapseButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  collapseOverlap: {
    marginLeft: -10,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  regionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F5F6FA",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  regionDash: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  regionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: 0.3,
  },
  menuList: {
    marginTop: 8,
    gap: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
  },
  menuItemActive: {
    backgroundColor: "#EEF0F3",
  },
  menuIcon: {
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  menuLabelActive: {
    color: Colors.text,
  },
  footerNote: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textMuted,
  },
});

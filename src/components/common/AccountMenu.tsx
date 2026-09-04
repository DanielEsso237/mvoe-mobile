import { Colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  avatarLetter?: string;
  delegationLabel?: string;
  parametresRoute?: string;
  loginRoute?: string;
}

export default function AccountMenu({
  avatarLetter = "D",
  delegationLabel = "Ebolowa II",
  parametresRoute = "/superviseur/parametres",
  loginRoute = "/superviseur",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const goToParametres = () => {
    close();
    router.push(parametresRoute as any);
  };

  const logout = () => {
    close();
    // TODO: effacer le token / la session stockée ici quand l'authentification
    // réelle sera branchée. Pour l'instant on redirige simplement vers le
    // login superviseur.
    router.replace(loginRoute as any);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        hitSlop={10}
        style={styles.avatar}
        activeOpacity={0.8}
      >
        <Text style={styles.avatarText}>{avatarLetter}</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={styles.backdrop} onPress={close}>
          <View style={styles.menu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuHeaderTitle} numberOfLines={1}>
                Délégation d&apos;arrondissem...
              </Text>
              <Text style={styles.menuHeaderSubtitle}>{delegationLabel}</Text>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={goToParametres}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Paramètres</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={logout}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemTextDanger}>Fermer la session</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    position: "absolute",
    top: 96,
    right: 16,
    width: 280,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  menuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuHeaderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  menuHeaderSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  menuItemTextDanger: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
  },
});
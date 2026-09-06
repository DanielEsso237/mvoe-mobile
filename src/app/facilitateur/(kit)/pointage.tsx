import KitHeader from "@/components/facilitateur/KitHeader";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  definirRepereLocal,
  getPaquet,
  getPresencesDeLaSeance,
  pointerPresence,
} from "@/services/facilitateur";
import type { ParentInscrit, PresenceStatut } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useFocusEffect } from "expo-router/react-navigation";
import { useNavigation } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CYCLE: PresenceStatut[] = ["a_pointer", "present", "absent", "rattrape_binome"];

function nextStatut(current: PresenceStatut): PresenceStatut {
  const index = CYCLE.indexOf(current);
  return CYCLE[(index + 1) % CYCLE.length];
}

function pastilleStyle(statut: PresenceStatut) {
  switch (statut) {
    case "present":
      return { backgroundColor: "#10B981", label: "Présent", icon: "checkmark" as const };
    case "absent":
      return { backgroundColor: "#EF4444", label: "Absent", icon: "close" as const };
    case "rattrape_binome":
      return { backgroundColor: "#6366F1", label: "Rattrapé (binôme)", icon: "link" as const };
    case "a_pointer":
    default:
      return { backgroundColor: "#E5E7EB", label: "À pointer", icon: "ellipse-outline" as const };
  }
}

export default function PointageScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { facilitateur } = useAuth();
  const facilitateurId = facilitateur?.compte.id ?? "";
  const [seanceId, setSeanceId] = useState<string | null | undefined>(undefined);
  const [parents, setParents] = useState<ParentInscrit[]>([]);
  const [presences, setPresences] = useState<Record<string, PresenceStatut>>({});
  const [repereOuvert, setRepereOuvert] = useState<string | null>(null);
  const [repereTexte, setRepereTexte] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (!facilitateurId) return;
      getPaquet(facilitateurId).then(async (paquet) => {
        if (!paquet?.seanceEnCours) {
          setSeanceId(null);
          return;
        }
        setParents(paquet.parents);
        setSeanceId(paquet.seanceEnCours.id);
        setPresences(await getPresencesDeLaSeance(paquet.seanceEnCours.id));
      });
    }, [facilitateurId])
  );

  if (seanceId === undefined) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!seanceId) {
    return (
      <View style={styles.root}>
        <KitHeader title="Pointage" onMenuPress={() => navigation.openDrawer()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Démarrez d&apos;abord une séance depuis « Séance ».
          </Text>
        </View>
      </View>
    );
  }

  const statutDe = (parentId: string): PresenceStatut => presences[parentId] ?? "a_pointer";
  const pointes = parents.filter((p) => statutDe(p.id) !== "a_pointer").length;

  const handleCycle = async (parent: ParentInscrit) => {
    const suivant = nextStatut(statutDe(parent.id));
    setPresences((prev) => ({ ...prev, [parent.id]: suivant }));
    await pointerPresence(seanceId, parent.id, suivant);
  };

  const ouvrirRepere = (parent: ParentInscrit) => {
    setRepereOuvert(parent.id);
    setRepereTexte(parent.repereLocal ?? "");
  };

  const enregistrerRepere = async () => {
    if (!repereOuvert) return;
    await definirRepereLocal(repereOuvert, repereTexte);
    setParents((prev) =>
      prev.map((p) => (p.id === repereOuvert ? { ...p, repereLocal: repereTexte } : p))
    );
    setRepereOuvert(null);
  };

  return (
    <View style={styles.root}>
      <KitHeader title="Pointage" onMenuPress={() => navigation.openDrawer()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.progress}>
          {pointes} sur {parents.length} pointés
        </Text>

        <View style={styles.grid}>
          {parents.map((parent) => {
            const style = pastilleStyle(statutDe(parent.id));
            return (
              <View key={parent.id} style={styles.parentCell}>
                <TouchableOpacity
                  style={[styles.pastille, { backgroundColor: style.backgroundColor }]}
                  activeOpacity={0.8}
                  onPress={() => handleCycle(parent)}
                >
                  <Ionicons name={style.icon} size={22} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.codeParent}>{parent.codeParent}</Text>
                <Text style={styles.statutLabel}>{style.label}</Text>
                <TouchableOpacity onPress={() => ouvrirRepere(parent)} hitSlop={8}>
                  <Text style={styles.repereLink} numberOfLines={1}>
                    {parent.repereLocal ? parent.repereLocal : "+ repère"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {repereOuvert && (
          <View style={styles.repereCard}>
            <Text style={styles.repereCardTitle}>Mon repère (privé, sur cet appareil)</Text>
            <TextInput
              style={styles.repereInput}
              placeholder="ex : Odile, marché"
              placeholderTextColor={Colors.placeholder}
              value={repereTexte}
              onChangeText={setRepereTexte}
              autoFocus
            />
            <View style={styles.repereActions}>
              <TouchableOpacity onPress={() => setRepereOuvert(null)}>
                <Text style={styles.repereCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.repereSave} onPress={enregistrerRepere}>
                <Text style={styles.repereSaveText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.note}>
          Les repères ne servent qu&apos;à vous, sur cet appareil. Ils ne
          partent jamais avec la synchronisation.
        </Text>

        <Text style={styles.footer}>
          © 2026 Mvoé — Programme national de parentalité positive, MINPROFF.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  emptyState: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  progress: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  parentCell: {
    width: "22%",
    alignItems: "center",
    gap: 4,
  },
  pastille: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  codeParent: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 4,
  },
  statutLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: "center",
  },
  repereLink: {
    fontSize: 10,
    color: Colors.primary,
    textAlign: "center",
  },
  repereCard: {
    marginTop: 20,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    gap: 10,
  },
  repereCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  repereInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  repereActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  repereCancel: {
    fontSize: 14,
    color: Colors.textSecondary,
    paddingVertical: 8,
  },
  repereSave: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  repereSaveText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 13,
  },
  note: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 20,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 16,
  },
});

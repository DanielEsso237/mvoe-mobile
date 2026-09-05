import KitHeader from "@/components/facilitateur/KitHeader";
import { Colors } from "@/constants/colors";
import { getFormation, marquerSectionLue } from "@/services/facilitateur";
import type { ModuleFormation } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FormationScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [modules, setModules] = useState<ModuleFormation[] | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [sectionIndex, setSectionIndex] = useState(0);

  useEffect(() => {
    getFormation().then(setModules);
  }, []);

  if (!modules) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const selected = modules.find((m) => m.code === selectedCode);

  const handleOuvrir = (code: string) => {
    setSelectedCode(code);
    setSectionIndex(0);
  };

  const handleSectionVue = async (moduleCode: string, sectionId: string) => {
    const updated = await marquerSectionLue(moduleCode, sectionId);
    if (updated) {
      setModules((prev) =>
        prev ? prev.map((m) => (m.code === moduleCode ? updated : m)) : prev
      );
    }
  };

  if (selected) {
    const section = selected.sections[sectionIndex];
    return (
      <View style={styles.root}>
        <KitHeader title="Ma formation" onMenuPress={() => navigation.openDrawer()} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <TouchableOpacity onPress={() => setSelectedCode(null)}>
            <Text style={styles.backLink}>← {selected.titre}</Text>
          </TouchableOpacity>

          <View style={styles.tocCard}>
            {selected.sections.map((s, index) => (
              <TouchableOpacity
                key={s.id}
                style={styles.tocRow}
                onPress={() => {
                  setSectionIndex(index);
                  if (!s.lue) handleSectionVue(selected.code, s.id);
                }}
              >
                <Ionicons
                  name={s.lue ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={s.lue ? "#10B981" : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.tocText,
                    index === sectionIndex && styles.tocTextActive,
                  ]}
                >
                  {s.titre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitre}>{section.titre}</Text>
            <Text style={styles.sectionDuree}>{section.dureeMinutes} min</Text>
            <Text style={styles.sectionCorps}>{section.corps}</Text>

            <View style={styles.navRow}>
              <TouchableOpacity
                style={[styles.navButton, sectionIndex === 0 && styles.navButtonDisabled]}
                disabled={sectionIndex === 0}
                onPress={() => setSectionIndex((i) => Math.max(0, i - 1))}
              >
                <Text style={styles.navButtonText}>Précédente</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  styles.navButtonPrimary,
                  sectionIndex === selected.sections.length - 1 && styles.navButtonDisabled,
                ]}
                disabled={sectionIndex === selected.sections.length - 1}
                onPress={() => {
                  const nextIndex = sectionIndex + 1;
                  setSectionIndex(nextIndex);
                  const next = selected.sections[nextIndex];
                  if (next && !next.lue) handleSectionVue(selected.code, next.id);
                }}
              >
                <Text style={styles.navButtonTextPrimary}>Suivante</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <KitHeader title="Ma formation" onMenuPress={() => navigation.openDrawer()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {modules.map((m) => (
          <TouchableOpacity
            key={m.code}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => handleOuvrir(m.code)}
          >
            <View style={styles.moduleHeader}>
              <Text style={styles.moduleTitre}>{m.titre}</Text>
              {m.termine && (
                <View style={styles.termineBadge}>
                  <Text style={styles.termineBadgeText}>Terminé</Text>
                </View>
              )}
            </View>
            <Text style={styles.moduleMeta}>
              {m.type} · {m.sections.length} sections · {m.dureeMinutes} min
            </Text>
            <Text style={styles.moduleObjectif}>{m.objectif}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${m.progression * 100}%` },
                ]}
              />
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.footer}>
          © 2026 Mvoé — Programme national de parentalité positive, MINPROFF.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F3F4F6" },
  loadingRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  backLink: { fontSize: 16, fontWeight: "700", color: Colors.primary, marginBottom: 8 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moduleTitre: { fontSize: 17, fontWeight: "800", color: Colors.text, flex: 1 },
  termineBadge: {
    backgroundColor: "#D1FAE5",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  termineBadgeText: { fontSize: 12, fontWeight: "700", color: "#047857" },
  moduleMeta: { fontSize: 13, color: Colors.textMuted },
  moduleObjectif: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  progressTrack: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 4,
  },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  tocCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  tocRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tocText: { fontSize: 14, color: Colors.textSecondary, flex: 1 },
  tocTextActive: { color: Colors.primary, fontWeight: "700" },
  sectionTitre: { fontSize: 18, fontWeight: "800", color: Colors.text },
  sectionDuree: { fontSize: 12, color: Colors.textMuted },
  sectionCorps: { fontSize: 15, color: Colors.text, lineHeight: 23, marginTop: 6 },
  navRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  navButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  navButtonPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  navButtonDisabled: { opacity: 0.4 },
  navButtonText: { fontSize: 14, fontWeight: "700", color: Colors.textSecondary },
  navButtonTextPrimary: { fontSize: 14, fontWeight: "700", color: Colors.white },
  footer: { textAlign: "center", fontSize: 12, color: Colors.textMuted, lineHeight: 18, marginTop: 8 },
});

import KitHeader from "@/components/facilitateur/KitHeader";
import { Colors } from "@/constants/colors";
import { getSignalements, soumettreSignalement } from "@/services/facilitateur";
import type { SignalementFacilitateur, SignalementGraviteFacilitateur } from "@/types";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TYPES = [
  "Négligence",
  "Maltraitance",
  "Violence basée sur le genre",
  "Travail des enfants",
  "Autre",
];

const GRAVITES: { value: SignalementGraviteFacilitateur; label: string }[] = [
  { value: "faible", label: "Faible" },
  { value: "moderee", label: "Modérée" },
  { value: "grave", label: "Grave" },
];

const STATUT_LABEL: Record<string, string> = {
  soumis: "Soumis",
  examine: "Examiné",
  oriente: "Orienté",
  clos: "Clos",
};

export default function SignalerScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const [mesSignalements, setMesSignalements] = useState<SignalementFacilitateur[] | null>(
    null
  );
  const [type, setType] = useState<string | null>(null);
  const [gravite, setGravite] = useState<SignalementGraviteFacilitateur | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [confirme, setConfirme] = useState(false);

  useEffect(() => {
    getSignalements().then(setMesSignalements);
  }, []);

  const isValid = !!type && !!gravite;

  const handleSubmit = async () => {
    if (!isValid) return;
    setEnvoi(true);
    await soumettreSignalement({ type: type!, gravite: gravite! });
    setEnvoi(false);
    setConfirme(true);
  };

  if (confirme) {
    return (
      <View style={styles.root}>
        <KitHeader title="Signaler" onMenuPress={() => navigation.openDrawer()} />
        <View style={styles.emptyState}>
          <Text style={styles.confirmTitle}>Signalement envoyé.</Text>
          <Text style={styles.confirmText}>
            Il rejoint la file de votre superviseur. Aucune autorité
            n&apos;est prévenue automatiquement.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/facilitateur/accueil")}
          >
            <Text style={styles.backButtonText}>Retour à mon kit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <KitHeader title="Signaler" onMenuPress={() => navigation.openDrawer()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            N&apos;écrivez aucun nom : ni celui d&apos;un enfant, ni d&apos;un
            parent, ni d&apos;un foyer.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>TYPE</Text>
          <View style={styles.chipRow}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, type === t && styles.chipActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>GRAVITÉ</Text>
          <View style={styles.chipRow}>
            {GRAVITES.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[styles.chip, gravite === g.value && styles.chipActive]}
                onPress={() => setGravite(g.value)}
              >
                <Text
                  style={[styles.chipText, gravite === g.value && styles.chipTextActive]}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, (!isValid || envoi) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isValid || envoi}
          >
            <Text style={styles.submitButtonText}>
              {envoi ? "Envoi…" : "Envoyer le signalement"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Mes signalements</Text>
        {mesSignalements === null ? (
          <ActivityIndicator color={Colors.primary} />
        ) : mesSignalements.length === 0 ? (
          <Text style={styles.emptyText}>Aucun signalement envoyé pour l&apos;instant.</Text>
        ) : (
          <View style={styles.tableCard}>
            {mesSignalements.map((s, index) => (
              <View
                key={s.id}
                style={[
                  styles.tableRow,
                  index < mesSignalements.length - 1 && styles.tableRowBorder,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowType}>{s.type}</Text>
                  <Text style={styles.rowMeta}>
                    {s.soumisLe} · {STATUT_LABEL[s.statut]}
                  </Text>
                </View>
                {s.statut !== "clos" && (
                  <Text style={styles.rowJours}>{s.joursAttente} j</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          © 2026 Mvoé — Programme national de parentalité positive, MINPROFF.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F3F4F6" },
  emptyState: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center", gap: 12 },
  confirmTitle: { fontSize: 22, fontWeight: "800", color: Colors.text },
  confirmText: { fontSize: 14, color: Colors.textSecondary, textAlign: "center", lineHeight: 21 },
  backButton: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  backButtonText: { color: Colors.white, fontWeight: "700" },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  warningCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 14,
  },
  warningText: { fontSize: 13, color: "#B91C1C", lineHeight: 19, fontWeight: "600" },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.6,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: "#EEF2FF" },
  chipText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: { backgroundColor: "#A5AEFC" },
  submitButtonText: { color: Colors.white, fontSize: 15, fontWeight: "700" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.text, marginTop: 8 },
  emptyText: { fontSize: 13, color: Colors.textMuted },
  tableCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tableRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  rowType: { fontSize: 14, fontWeight: "700", color: Colors.text },
  rowMeta: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  rowJours: { fontSize: 13, fontWeight: "700", color: "#DC2626" },
  footer: { textAlign: "center", fontSize: 12, color: Colors.textMuted, lineHeight: 18, marginTop: 8 },
});

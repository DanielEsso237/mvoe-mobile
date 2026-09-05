import KitHeader from "@/components/facilitateur/KitHeader";
import { Colors } from "@/constants/colors";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { getTableauDeBord } from "@/services/facilitateur";
import type { TableauDeBordFacilitateur } from "@/types";
import { Ionicons } from "@expo/vector-icons";
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

export default function TableauDeBordScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const isOnline = useNetworkStatus();
  const [data, setData] = useState<TableauDeBordFacilitateur | null>(null);

  useEffect(() => {
    if (isOnline !== false) {
      getTableauDeBord().then(setData);
    }
  }, [isOnline]);

  if (isOnline === false) {
    return (
      <View style={styles.root}>
        <KitHeader title="Mon activité" onMenuPress={() => navigation.openDrawer()} />
        <View style={styles.emptyState}>
          <Ionicons name="cloud-offline-outline" size={32} color={Colors.textMuted} />
          <Text style={styles.emptyStateText}>
            Ces chiffres viennent du serveur : ils ne sont pas visibles
            hors-ligne.
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

  if (!data) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <KitHeader title="Mon activité" onMenuPress={() => navigation.openDrawer()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          <Stat label="Cohortes" value={data.cohortes} />
          <Stat label="Parents inscrits" value={data.parentsInscrits} />
          <Stat label="Séances tenues" value={data.seancesTenues} />
          <Stat label="Écarts relevés" value={data.ecartsReleves} color="#F59E0B" />
          <Stat label="Dose moyenne" value={data.doseMoyenne} />
          <Stat label="Délai moyen (j)" value={data.delaiMoyenRemontee} />
        </View>

        <Text style={styles.sectionTitle}>Le terrain</Text>
        <View style={styles.grid}>
          <Stat label="Activités" value={data.activites} />
          <Stat label="Personnes touchées" value={data.personnesTouchees} />
          <Stat label="Foyers suivis" value={data.foyersSuivis} />
          <Stat label="Groupes de soutien actifs" value={data.groupesSoutienActifs} />
        </View>

        <View style={styles.alertCard}>
          <Text style={styles.alertText}>
            {data.participantsHandicap} participants en situation de handicap,
            sur {data.personnesTouchees} personnes touchées.
          </Text>
          <Text style={[styles.alertText, styles.alertTextDanger]}>
            {data.signalementsAttente} signalement(s) en attente de
            traitement.
          </Text>
        </View>

        <Text style={styles.footer}>
          © 2026 Mvoé — Programme national de parentalité positive, MINPROFF.
        </Text>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  emptyState: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyStateText: { fontSize: 14, color: Colors.textMuted, textAlign: "center", lineHeight: 21 },
  backButton: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  backButtonText: { color: Colors.white, fontWeight: "700" },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "47%",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
  },
  statValue: { fontSize: 26, fontWeight: "800", color: Colors.text },
  statLabel: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.text, marginTop: 8 },
  alertCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    gap: 10,
  },
  alertText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  alertTextDanger: { color: "#DC2626", fontWeight: "600" },
  footer: { textAlign: "center", fontSize: 12, color: Colors.textMuted, lineHeight: 18, marginTop: 8 },
});

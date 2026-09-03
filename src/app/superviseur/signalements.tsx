import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Gravite = "faible" | "moyenne" | "elevee";

interface Signalement {
  id: string;
  situation: string;
  date: string;
  gravite: Gravite;
  traite: boolean;
}

// TODO: brancher sur le serveur — données de démonstration en attendant.
const MOCK_DATA: {
  aTraiter: number;
  dontGraves: number;
  recusEnTout: number;
  delaiMoyenJours: number;
  signalements: Signalement[];
} = {
  aTraiter: 3,
  dontGraves: 1,
  recusEnTout: 7,
  delaiMoyenJours: 8,
  signalements: [
    {
      id: "1",
      situation: "Violence basée sur le genre",
      date: "28/08/2026",
      gravite: "moyenne",
      traite: false,
    },
    {
      id: "2",
      situation: "Maltraitance",
      date: "22/08/2026",
      gravite: "elevee",
      traite: false,
    },
    {
      id: "3",
      situation: "Violence basée sur le genre",
      date: "15/07/2026",
      gravite: "moyenne",
      traite: false,
    },
    {
      id: "4",
      situation: "Négligence",
      date: "02/07/2026",
      gravite: "faible",
      traite: true,
    },
    {
      id: "5",
      situation: "Maltraitance",
      date: "18/06/2026",
      gravite: "moyenne",
      traite: true,
    },
    {
      id: "6",
      situation: "Violence basée sur le genre",
      date: "04/06/2026",
      gravite: "faible",
      traite: true,
    },
    {
      id: "7",
      situation: "Négligence",
      date: "22/05/2026",
      gravite: "moyenne",
      traite: true,
    },
  ],
};

function getGraviteStyle(gravite: Gravite) {
  switch (gravite) {
    case "elevee":
      return { bg: "#EF4444", color: Colors.white, label: "Élevée" };
    case "moyenne":
      return { bg: "#6B7280", color: Colors.white, label: "Moyenne" };
    case "faible":
    default:
      return { bg: "#D1FAE5", color: "#047857", label: "Faible" };
  }
}

type TabKey = "attente" | "historique";

export default function SignalementsScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("attente");

  const filteredSignalements = useMemo(() => {
    if (activeTab === "attente") {
      return MOCK_DATA.signalements.filter((s) => !s.traite);
    }
    return MOCK_DATA.signalements;
  }, [activeTab]);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.menuBtn}
          hitSlop={10}
        >
          <Ionicons name="menu" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mvoé</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity hitSlop={10} style={styles.iconBtn}>
            <Ionicons
              name="sunny-outline"
              size={20}
              color="rgba(255,255,255,0.8)"
            />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>D</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <Text
            style={styles.breadcrumbLink}
            onPress={() => router.push("/superviseur/dashboard")}
          >
            Tableau de bord
          </Text>
          <Text style={styles.breadcrumbSep}> / </Text>
          <Text style={styles.breadcrumbCurrent}>Signalements</Text>
        </View>

        {/* Titre */}
        <Text style={styles.pageTitle}>Signalements</Text>
        <Text style={styles.pageSubtitle}>
          Aucune autorité n&apos;est prévenue automatiquement. Ces situations
          vous sont remontées pour que vous en décidiez. Aucune ligne ne porte
          l&apos;identité d&apos;un enfant, d&apos;un parent ou d&apos;un foyer.
        </Text>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statTopRow}>
              <View style={[styles.statIcon, { backgroundColor: "#FEF2F2" }]}>
                <Ionicons name="alert-circle" size={22} color="#EF4444" />
              </View>
              <Text style={[styles.statValue, { color: "#DC2626" }]}>
                {MOCK_DATA.aTraiter}
              </Text>
            </View>
            <Text style={styles.statLabel}>À traiter</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statTopRow}>
              <View style={[styles.statIcon, { backgroundColor: "#FFFBEB" }]}>
                <Ionicons name="warning" size={22} color="#F59E0B" />
              </View>
              <Text style={[styles.statValue, { color: "#DC2626" }]}>
                {MOCK_DATA.dontGraves}
              </Text>
            </View>
            <Text style={styles.statLabel}>Dont graves</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statTopRow}>
              <View style={[styles.statIcon, { backgroundColor: "#EEF2FF" }]}>
                <Ionicons name="reader-outline" size={22} color="#6366F1" />
              </View>
              <Text style={[styles.statValue, { color: Colors.text }]}>
                {MOCK_DATA.recusEnTout}
              </Text>
            </View>
            <Text style={styles.statLabel}>Reçus en tout</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statTopRow}>
              <View style={[styles.statIcon, { backgroundColor: "#ECFDF5" }]}>
                <Ionicons name="time-outline" size={22} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: Colors.text }]}>
                {MOCK_DATA.delaiMoyenJours}
              </Text>
            </View>
            <Text style={styles.statLabel}>Délai moyen</Text>
            <Text style={styles.statSubLabel}>
              jours entre la remontée et la décision
            </Text>
          </View>
        </View>

        {/* La file */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>La file</Text>

          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "attente" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("attente")}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "attente" && styles.tabButtonTextActive,
                ]}
              >
                Ce qui attend
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "historique" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("historique")}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "historique" && styles.tabButtonTextActive,
                ]}
              >
                Tout l&apos;historique
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>
                Situation
              </Text>
              <Text style={styles.tableHeaderCellGravite}>Gravité</Text>
            </View>

            {filteredSignalements.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={28}
                  color={Colors.textMuted}
                />
                <Text style={styles.emptyStateText}>
                  Rien à traiter pour l&apos;instant.
                </Text>
              </View>
            ) : (
              filteredSignalements.map((s, index) => {
                const graviteStyle = getGraviteStyle(s.gravite);
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.tableRow,
                      index < filteredSignalements.length - 1 &&
                        styles.tableRowBorder,
                    ]}
                    activeOpacity={0.7}
                    onPress={() =>
                      Alert.alert(
                        s.situation,
                        `Reçu le ${s.date}. Détail du signalement à venir.`,
                      )
                    }
                  >
                    <View style={styles.situationColumn}>
                      <Text style={styles.situationText}>{s.situation}</Text>
                      <Text style={styles.dateText}>{s.date}</Text>
                    </View>
                    <View
                      style={[
                        styles.graviteBadge,
                        { backgroundColor: graviteStyle.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.graviteBadgeText,
                          { color: graviteStyle.color },
                        ]}
                      >
                        {graviteStyle.label}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={Colors.textMuted}
                      style={styles.chevron}
                    />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        {/* Footer */}
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
  header: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
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
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  breadcrumbLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  breadcrumbSep: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  breadcrumbCurrent: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    width: "48%",
  },
  statTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 30,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  statSubLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 14,
  },
  tabsRow: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
  },
  tabButtonTextActive: {
    color: Colors.white,
  },
  tableCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableHeaderCell: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  tableHeaderCellGravite: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    width: 90,
    textAlign: "right",
    marginRight: 26,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  situationColumn: {
    flex: 1,
  },
  situationText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  graviteBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    minWidth: 68,
    alignItems: "center",
  },
  graviteBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  chevron: {
    marginLeft: 8,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyStateText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});

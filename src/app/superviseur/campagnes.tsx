import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Statut = "declenchee" | "programmee" | "terminee";

interface ProgressCounter {
  done: number;
  total: number;
}

interface Campagne {
  id: string;
  titre: string;
  statut: Statut;
  dateDebut: string;
  dateFin: string;
  description: string;
  modules: string[];
  langues: string[];
  regions: string[];
  progress: {
    regions: ProgressCounter;
    departements: ProgressCounter;
    arrondissements: ProgressCounter;
    facilitateurs: ProgressCounter;
  };
  echelonsOuverts: number;
  echelonsTotal: number;
}

// TODO: brancher sur le serveur — données de démonstration en attendant.
const MOCK_CAMPAGNES: Campagne[] = [
  {
    id: "1",
    titre: "Écoute et révélation",
    statut: "declenchee",
    dateDebut: "28/08/2026",
    dateFin: "30/10/2026",
    description: "Diffuser la fiche de conduite à tenir face à une révélation.",
    modules: ["Animer une séance de cohorte"],
    langues: ["Français", "Bulu"],
    regions: ["Sud"],
    progress: {
      regions: { done: 0, total: 1 },
      departements: { done: 0, total: 4 },
      arrondissements: { done: 0, total: 29 },
      facilitateurs: { done: 0, total: 50 },
    },
    echelonsOuverts: 0,
    echelonsTotal: 84,
  },
  {
    id: "2",
    titre: "Rentrée scolaire — discipline positive",
    statut: "declenchee",
    dateDebut: "22/06/2026",
    dateFin: "20/09/2026",
    description:
      "Reprendre les alternatives à la punition physique avant la rentrée, période où les tensions dans les foyers augmentent.",
    modules: [
      "Animer une séance de cohorte",
      "Discipliner sans frapper : les trois gestes",
    ],
    langues: ["Français", "Bulu", "English"],
    regions: ["Sud"],
    progress: {
      regions: { done: 1, total: 1 },
      departements: { done: 2, total: 4 },
      arrondissements: { done: 9, total: 29 },
      facilitateurs: { done: 11, total: 50 },
    },
    echelonsOuverts: 23,
    echelonsTotal: 84,
  },
];

function getStatutStyle(statut: Statut) {
  switch (statut) {
    case "declenchee":
      return { bg: "#10B981", label: "Déclenchée" };
    case "terminee":
      return { bg: "#9CA3AF", label: "Terminée" };
    case "programmee":
    default:
      return { bg: "#F59E0B", label: "Programmée" };
  }
}

function ProgressStat({
  label,
  counter,
}: {
  label: string;
  counter: ProgressCounter;
}) {
  const pct = counter.total > 0 ? Math.min(counter.done / counter.total, 1) : 0;

  return (
    <View style={styles.progressStat}>
      <View style={styles.progressStatHeader}>
        <Text style={styles.progressStatLabel}>{label}</Text>
        <Text style={styles.progressStatValue}>
          {counter.done}/{counter.total}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        {pct > 0 && (
          <LinearGradient
            colors={["#4361EE", "#7C3AED"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${pct * 100}%` }]}
          />
        )}
      </View>
    </View>
  );
}

export default function CampagnesScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const [acquittees, setAcquittees] = useState<Record<string, boolean>>({});

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
          <Text style={styles.breadcrumbCurrent}>Campagnes</Text>
        </View>

        {/* Titre */}
        <Text style={styles.pageTitle}>Campagnes</Text>
        <Text style={styles.pageSubtitle}>
          Une campagne pousse des modules, dans des langues, sur des
          territoires. Elle ne remplace pas les séances : elle les accompagne.
        </Text>

        {MOCK_CAMPAGNES.map((campagne) => {
          const statutStyle = getStatutStyle(campagne.statut);
          const isAcquittee = !!acquittees[campagne.id];

          return (
            <View key={campagne.id} style={styles.card}>
              <View style={styles.titleRow}>
                <Text style={styles.campagneTitle}>{campagne.titre}</Text>
                <View
                  style={[
                    styles.statutBadge,
                    { backgroundColor: statutStyle.bg },
                  ]}
                >
                  <Text style={styles.statutBadgeText}>
                    {statutStyle.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.dateRange}>
                {campagne.dateDebut} au {campagne.dateFin}
              </Text>

              <Text style={styles.description}>{campagne.description}</Text>

              <Text style={styles.sectionLabel}>Modules</Text>
              <View style={styles.pillRow}>
                {campagne.modules.map((module) => (
                  <View key={module} style={[styles.pill, styles.pillModule]}>
                    <Text style={[styles.pillText, styles.pillTextModule]}>
                      {module}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Langues</Text>
              <View style={styles.pillRow}>
                {campagne.langues.map((langue) => (
                  <View key={langue} style={[styles.pill, styles.pillLangue]}>
                    <Text style={[styles.pillText, styles.pillTextLangue]}>
                      {langue}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Régions</Text>
              <View style={styles.pillRow}>
                {campagne.regions.map((region) => (
                  <View key={region} style={[styles.pill, styles.pillRegion]}>
                    <Text style={[styles.pillText, styles.pillTextRegion]}>
                      {region}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionLabel}>Qui a pris connaissance</Text>

              <View style={styles.progressGrid}>
                <ProgressStat
                  label="Régions"
                  counter={campagne.progress.regions}
                />
                <ProgressStat
                  label="Départements"
                  counter={campagne.progress.departements}
                />
                <ProgressStat
                  label="Arrondissements"
                  counter={campagne.progress.arrondissements}
                />
                <ProgressStat
                  label="Facilitateurs"
                  counter={campagne.progress.facilitateurs}
                />
              </View>

              <Text style={styles.echelonsText}>
                {campagne.echelonsOuverts} échelons sur {campagne.echelonsTotal}{" "}
                ont ouvert la campagne. Ce n&apos;est pas un taux
                d&apos;exécution du programme : c&apos;est le nombre de gens qui
                savent qu&apos;elle existe.
              </Text>

              <TouchableOpacity
                style={[
                  styles.acquitteButton,
                  isAcquittee && styles.acquitteButtonDone,
                ]}
                activeOpacity={0.85}
                disabled={isAcquittee}
                onPress={() =>
                  setAcquittees((prev) => ({ ...prev, [campagne.id]: true }))
                }
              >
                {isAcquittee && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={Colors.textSecondary}
                    style={styles.acquitteIcon}
                  />
                )}
                <Text
                  style={[
                    styles.acquitteButtonText,
                    isAcquittee && styles.acquitteButtonTextDone,
                  ]}
                >
                  {isAcquittee
                    ? "Connaissance prise"
                    : "J'ai pris connaissance"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

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
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
  },
  campagneTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    lineHeight: 26,
  },
  statutBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statutBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.white,
  },
  dateRange: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 14,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  pill: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  pillModule: {
    borderColor: Colors.primary,
  },
  pillTextModule: {
    color: Colors.primary,
  },
  pillLangue: {
    borderColor: "#3B82F6",
  },
  pillTextLangue: {
    color: "#3B82F6",
  },
  pillRegion: {
    borderColor: "#7C3AED",
  },
  pillTextRegion: {
    color: "#7C3AED",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 18,
  },
  progressGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  progressStat: {
    width: "47%",
  },
  progressStatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressStatLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  progressStatValue: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  echelonsText: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: 18,
  },
  acquitteButton: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  acquitteButtonDone: {
    backgroundColor: "#E5E7EB",
  },
  acquitteIcon: {
    marginRight: 6,
  },
  acquitteButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  acquitteButtonTextDone: {
    color: Colors.textSecondary,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});

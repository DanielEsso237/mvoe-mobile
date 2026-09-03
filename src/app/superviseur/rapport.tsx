import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation, useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// TODO: remplacer par un appel API — pour l'instant un seul jeu de données
// mocké est disponible (Ebolowa II, 3e trimestre 2026), quel que soit le
// filtre sélectionné. Le bouton "Afficher" est prêt à déclencher le fetch.
const YEAR_OPTIONS = ["2024", "2025", "2026", "2027"];
const TRIMESTRE_OPTIONS = [
  "1er trimestre",
  "2e trimestre",
  "3e trimestre",
  "4e trimestre",
];

const REPORT = {
  delegation: "Ebolowa II",
  trimestreLabel: "3e trimestre 2026",
  periode: "du 01/07/2026 au 30/09/2026",
  delegationLabel: "Délégation d'arrondissement — Ebolowa II",
  dateEtablissement: "document établi le 03 septembre 2026",
  stats: {
    seancesTenues: 5,
    cohortesActives: 2,
    doseMoyenne: "2,2",
    ecartsReleves: 2,
  },
  doseMoyenneExplication:
    "La dose moyenne est le nombre de séances réellement reçues par parent inscrit. Un parent rattrapé par son binôme a reçu la séance : il compte.",
  dispositifTexte:
    "3 facilitateurs actifs sur 3 formés. 1 a animé au moins une séance sur le trimestre.",
  delaiMoyenRemontee: "3,2 jours",
  cohortes: [
    {
      nom: "Ebolowa II — groupe du mardi",
      arrondissement: "Ebolowa II",
      effectif: 20,
      plafond: 20,
      seances: 3,
    },
    {
      nom: "Ebolowa II — groupe du lundi",
      arrondissement: "Ebolowa II",
      effectif: 20,
      plafond: 20,
      seances: 2,
    },
  ],
  ecartTexte:
    "Chaque séance porte deux sources indépendantes : ce que le facilitateur a déclaré après la séance, et ce que l'outil a enregistré pendant. L'écart est la différence entre les deux. Aucun formulaire papier ne peut le produire, faute d'une seconde source à confronter.",
  ecarts: [
    {
      facilitateur: "Ndzana Étienne",
      arrondissement: "Ebolowa II",
      seances: 5,
      sequencesDeclarees: 23,
      declareesJamaisOuvertes: 1,
      ouvertesDeclareesNonFaites: 1,
      delaiMoyen: "3,2 j",
    },
  ],
  ecartConclusion:
    "Un écart n'est pas une faute. Il indique un endroit du déroulé qui résiste, et se lit avec le facilitateur, pas contre lui.",
  footerNote:
    "Document généré par Mvoé. Il ne contient aucune donnée nominative de parent ni d'enfant : seuls des agrégats sont remontés.",
};

export default function RapportScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();

  const [year, setYear] = useState("2026");
  const [trimestre, setTrimestre] = useState("3e trimestre");
  const [yearOpen, setYearOpen] = useState(false);
  const [trimestreOpen, setTrimestreOpen] = useState(false);

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
          <Text style={styles.breadcrumbCurrent}>Rapport</Text>
        </View>

        <Text style={styles.pageTitle}>Rapport</Text>
        <Text style={styles.pageSubtitle}>{REPORT.delegation}</Text>

        {/* Filtres */}
        <View style={styles.filtersRow}>
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>ANNÉE</Text>
            <TouchableOpacity
              style={styles.filterInput}
              activeOpacity={0.8}
              onPress={() => {
                setYearOpen((v) => !v);
                setTrimestreOpen(false);
              }}
            >
              <Text style={styles.filterValue}>{year}</Text>
              <Ionicons
                name={yearOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
            {yearOpen && (
              <View style={styles.dropdownMenu}>
                {YEAR_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setYear(opt);
                      setYearOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        year === opt && styles.dropdownItemTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                    {year === opt && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>TRIMESTRE</Text>
            <TouchableOpacity
              style={styles.filterInput}
              activeOpacity={0.8}
              onPress={() => {
                setTrimestreOpen((v) => !v);
                setYearOpen(false);
              }}
            >
              <Text style={styles.filterValue}>{trimestre}</Text>
              <Ionicons
                name={trimestreOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
            {trimestreOpen && (
              <View style={styles.dropdownMenu}>
                {TRIMESTRE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setTrimestre(opt);
                      setTrimestreOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        trimestre === opt && styles.dropdownItemTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                    {trimestre === opt && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Afficher</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85}>
            <Ionicons name="download-outline" size={16} color={Colors.white} />
            <Text style={styles.primaryBtnText}>Exporter en PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Document du rapport */}
        <View style={styles.reportCard}>
          <Text style={styles.eyebrow}>
            PROGRAMME NATIONAL DE PARENTALITÉ POSITIVE
          </Text>
          <Text style={styles.reportTitle}>Rapport trimestriel</Text>
          <Text style={styles.reportMeta}>
            {REPORT.trimestreLabel} — {REPORT.periode}
          </Text>
          <Text style={styles.reportMeta}>
            Portée :{" "}
            <Text style={styles.reportMetaBold}>{REPORT.delegation}</Text>
          </Text>
          <Text style={styles.reportMetaMuted}>
            {REPORT.delegationLabel} · {REPORT.dateEtablissement}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Ce que dit le trimestre</Text>
          <View style={styles.statsGrid}>
            <StatBlock
              label="SÉANCES TENUES"
              value={REPORT.stats.seancesTenues}
            />
            <StatBlock
              label="COHORTES ACTIVES"
              value={REPORT.stats.cohortesActives}
            />
            <StatBlock label="DOSE MOYENNE" value={REPORT.stats.doseMoyenne} />
            <StatBlock
              label="ÉCARTS RELEVÉS"
              value={REPORT.stats.ecartsReleves}
            />
          </View>
          <Text style={styles.explanation}>
            {REPORT.doseMoyenneExplication}
          </Text>

          <Text style={styles.sectionTitle}>Le dispositif</Text>
          <Text style={styles.bodyText}>{REPORT.dispositifTexte}</Text>
          <Text style={styles.bodyText}>
            Délai moyen de remontée : {REPORT.delaiMoyenRemontee}.
          </Text>

          <Text style={styles.sectionTitle}>Cohortes</Text>
          <View style={styles.tableCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <Text style={[styles.tableHeaderCell, styles.colCohorte]}>
                    Cohorte
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.colArr]}>
                    Arrondissement
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.colNum]}>
                    Effectif
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.colNum]}>
                    Plafond
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.colNum]}>
                    Séances
                  </Text>
                </View>
                {REPORT.cohortes.map((c, i) => (
                  <View
                    key={i}
                    style={[
                      styles.tableRow,
                      i < REPORT.cohortes.length - 1 && styles.tableRowBorder,
                    ]}
                  >
                    <Text style={[styles.tableCellBold, styles.colCohorte]}>
                      {c.nom}
                    </Text>
                    <Text style={[styles.tableCell, styles.colArr]}>
                      {c.arrondissement}
                    </Text>
                    <Text style={[styles.tableCell, styles.colNum]}>
                      {c.effectif}
                    </Text>
                    <Text style={[styles.tableCell, styles.colNum]}>
                      {c.plafond}
                    </Text>
                    <Text style={[styles.tableCell, styles.colNum]}>
                      {c.seances}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <Text style={styles.sectionTitle}>
            Écart entre le déclaré et l&apos;observé
          </Text>
          <Text style={styles.bodyText}>{REPORT.ecartTexte}</Text>

          <View style={styles.tableCard}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <Text
                    style={[styles.tableHeaderCell, styles.colFacilitateur]}
                  >
                    Facilitateur
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.colNum]}>
                    Séances
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.colNumWide]}>
                    Séquences{"\n"}déclarées
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.colNumWide]}>
                    Déclarées jamais{"\n"}ouvertes
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.colNumWide]}>
                    Ouvertes déclarées{"\n"}non faites
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.colNumWide]}>
                    Délai moyen
                  </Text>
                </View>
                {REPORT.ecarts.map((e, i) => (
                  <View
                    key={i}
                    style={[
                      styles.tableRow,
                      i < REPORT.ecarts.length - 1 && styles.tableRowBorder,
                    ]}
                  >
                    <View style={styles.colFacilitateur}>
                      <Text style={styles.tableCellBold}>{e.facilitateur}</Text>
                      <Text style={styles.tableCellMuted}>
                        {e.arrondissement}
                      </Text>
                    </View>
                    <Text style={[styles.tableCell, styles.colNum]}>
                      {e.seances}
                    </Text>
                    <Text style={[styles.tableCell, styles.colNumWide]}>
                      {e.sequencesDeclarees}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.colNumWide,
                        styles.amberCell,
                      ]}
                    >
                      {e.declareesJamaisOuvertes}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.colNumWide,
                        styles.amberCell,
                      ]}
                    >
                      {e.ouvertesDeclareesNonFaites}
                    </Text>
                    <Text style={[styles.tableCell, styles.colNumWide]}>
                      {e.delaiMoyen}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <Text style={styles.explanation}>{REPORT.ecartConclusion}</Text>

          <View style={styles.divider} />
          <Text style={styles.reportMetaMuted}>{REPORT.footerNote}</Text>
        </View>

        <Text style={styles.footer}>
          © 2026 Mvoé — Programme national de parentalité positive, MINPROFF.
        </Text>
      </ScrollView>
    </View>
  );
}

function StatBlock({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
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
    marginBottom: 20,
  },

  // Filters
  filtersRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    zIndex: 20,
  },
  filterField: {
    flex: 1,
    position: "relative",
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  filterInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  filterValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "600",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 30,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.text,
  },
  dropdownItemTextActive: {
    color: Colors.primary,
    fontWeight: "600",
  },

  // Action buttons
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  primaryBtn: {
    flex: 1.4,
    flexDirection: "row",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 14,
  },

  // Report document
  reportCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 18,
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 10,
  },
  reportMeta: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 2,
  },
  reportMetaBold: {
    fontWeight: "700",
    color: Colors.text,
  },
  reportMetaMuted: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 18,
    marginBottom: 12,
  },

  // Stats grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statBlock: {
    width: "48%",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textAlign: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
  },
  explanation: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
    marginTop: 12,
  },
  bodyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 6,
  },

  // Tables
  tableCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 4,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableHeaderRow: {
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
    lineHeight: 15,
  },
  tableCell: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tableCellBold: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
    lineHeight: 18,
  },
  tableCellMuted: {
    fontSize: 12,
    color: Colors.textMuted,
    paddingHorizontal: 12,
  },
  amberCell: {
    color: "#F59E0B",
    fontWeight: "700",
  },

  // Fixed column widths so header and rows stay aligned during horizontal scroll
  colCohorte: { width: 190 },
  colArr: { width: 130 },
  colNum: { width: 90, textAlign: "center" },
  colNumWide: { width: 120, textAlign: "center" },
  colFacilitateur: { width: 160, paddingVertical: 10 },

  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});

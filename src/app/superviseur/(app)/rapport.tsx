import AccountMenu from "@/components/common/AccountMenu";
import { Colors } from "@/constants/colors";
import { getRapport } from "@/services/superviseur";
import type { Rapport } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const YEAR_OPTIONS = ["2024", "2025", "2026", "2027"];
const TRIMESTRE_OPTIONS: { label: string; value: 1 | 2 | 3 | 4 }[] = [
  { label: "1er trimestre", value: 1 },
  { label: "2e trimestre", value: 2 },
  { label: "3e trimestre", value: 3 },
  { label: "4e trimestre", value: 4 },
];

function buildReportHtml(report: Rapport) {
  const cohortesRows = report.cohortes
    .map(
      (c) =>
        `<tr><td>${c.libelle}</td><td>${c.arrondissementNom}</td><td>${c.effectif}</td><td>${c.ratioMax}</td><td>${c.seances}</td></tr>`
    )
    .join("");
  const ecartsRows = report.ecarts
    .map(
      (e) =>
        `<tr><td>${e.facilitateurNom}</td><td>${e.seances}</td><td>${e.sequencesRealisees}</td><td>${e.declareesJamaisOuvertes}</td><td>${e.ouvertesDeclareesNonFaites}</td><td>${e.delaiMoyenRemontee} j</td></tr>`
    )
    .join("");

  return `
    <html>
      <head><meta charset="utf-8" /></head>
      <body style="font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 24px; color: #1A1A2E;">
        <p style="font-size:11px; letter-spacing:1px; color:#9CA3AF; text-transform:uppercase;">Programme national de parentalité positive</p>
        <h1 style="margin: 4px 0;">Rapport trimestriel</h1>
        <p>${report.trimestre === 1 ? "1er" : `${report.trimestre}e`} trimestre ${report.annee} — Portée : <strong>${report.portee.libelle}</strong></p>
        <p style="color:#6B7280; font-size:13px;">Établi le ${report.etabliLe}</p>
        <hr />
        <h2>Ce que dit le trimestre</h2>
        <ul>
          <li>Séances tenues : ${report.seancesTenues}</li>
          <li>Cohortes actives : ${report.cohortesActives}</li>
          <li>Dose moyenne : ${report.doseMoyenne}</li>
          <li>Écarts relevés : ${report.ecartsTotal}</li>
        </ul>
        <h2>Cohortes</h2>
        <table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse; width: 100%;">
          <tr><th>Cohorte</th><th>Arrondissement</th><th>Effectif</th><th>Plafond</th><th>Séances</th></tr>
          ${cohortesRows}
        </table>
        <h2>Écart entre le déclaré et l'observé</h2>
        <table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse; width: 100%;">
          <tr><th>Facilitateur</th><th>Séances</th><th>Séquences déclarées</th><th>Jamais ouvertes</th><th>Non faites</th><th>Délai moyen</th></tr>
          ${ecartsRows}
        </table>
        <p style="color:#9CA3AF; font-size:12px; margin-top:24px;">Document généré par Mvoé. Il ne contient aucune donnée nominative de parent ni d'enfant : seuls des agrégats sont remontés.</p>
      </body>
    </html>
  `;
}

export default function RapportScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();

  const [year, setYear] = useState("2026");
  const [trimestre, setTrimestre] = useState<1 | 2 | 3 | 4>(3);
  const [yearOpen, setYearOpen] = useState(false);
  const [trimestreOpen, setTrimestreOpen] = useState(false);
  const [report, setReport] = useState<Rapport | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const fetchReport = (y: string, t: 1 | 2 | 3 | 4) => {
    setLoading(true);
    getRapport(Number(y), t)
      .then(setReport)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport(year, trimestre);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async () => {
    if (!report) return;
    setExportError(null);
    setExporting(true);
    try {
      const html = buildReportHtml(report);
      if (Platform.OS === "web") {
        await Print.printAsync({ html });
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
        }
      }
    } catch {
      setExportError("L'export a échoué. Réessayez.");
    } finally {
      setExporting(false);
    }
  };

  const trimestreLabel =
    TRIMESTRE_OPTIONS.find((t) => t.value === trimestre)?.label ?? "";

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
          <AccountMenu />
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
        <Text style={styles.pageSubtitle}>{report?.portee.libelle}</Text>

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
              <Text style={styles.filterValue}>{trimestreLabel}</Text>
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
                    key={opt.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setTrimestre(opt.value);
                      setTrimestreOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        trimestre === opt.value && styles.dropdownItemTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {trimestre === opt.value && (
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
          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.85}
            onPress={() => fetchReport(year, trimestre)}
          >
            <Text style={styles.secondaryBtnText}>
              {loading ? "Chargement…" : "Afficher"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, exporting && styles.primaryBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleExport}
            disabled={exporting || !report}
          >
            <Ionicons name="download-outline" size={16} color={Colors.white} />
            <Text style={styles.primaryBtnText}>
              {exporting ? "Export…" : "Exporter en PDF"}
            </Text>
          </TouchableOpacity>
        </View>
        {exportError && <Text style={styles.errorText}>{exportError}</Text>}

        {loading || !report ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : (
          <View style={styles.reportCard}>
            <Text style={styles.eyebrow}>
              PROGRAMME NATIONAL DE PARENTALITÉ POSITIVE
            </Text>
            <Text style={styles.reportTitle}>Rapport trimestriel</Text>
            <Text style={styles.reportMeta}>
              {trimestreLabel} {report.annee}
            </Text>
            <Text style={styles.reportMeta}>
              Portée :{" "}
              <Text style={styles.reportMetaBold}>{report.portee.libelle}</Text>
            </Text>
            <Text style={styles.reportMetaMuted}>
              document établi le {report.etabliLe}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Ce que dit le trimestre</Text>
            <View style={styles.statsGrid}>
              <StatBlock label="SÉANCES TENUES" value={report.seancesTenues} />
              <StatBlock
                label="COHORTES ACTIVES"
                value={report.cohortesActives}
              />
              <StatBlock label="DOSE MOYENNE" value={report.doseMoyenne} />
              <StatBlock label="ÉCARTS RELEVÉS" value={report.ecartsTotal} />
            </View>
            <Text style={styles.explanation}>
              La dose moyenne est le nombre de séances réellement reçues par
              parent inscrit. Un parent rattrapé par son binôme a reçu la
              séance : il compte.
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
                  {report.cohortes.map((c, i) => (
                    <View
                      key={i}
                      style={[
                        styles.tableRow,
                        i < report.cohortes.length - 1 && styles.tableRowBorder,
                      ]}
                    >
                      <Text style={[styles.tableCellBold, styles.colCohorte]}>
                        {c.libelle}
                      </Text>
                      <Text style={[styles.tableCell, styles.colArr]}>
                        {c.arrondissementNom}
                      </Text>
                      <Text style={[styles.tableCell, styles.colNum]}>
                        {c.effectif}
                      </Text>
                      <Text style={[styles.tableCell, styles.colNum]}>
                        {c.ratioMax}
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
            <Text style={styles.bodyText}>
              Chaque séance porte deux sources indépendantes : ce que le
              facilitateur a déclaré après la séance, et ce que l&apos;outil a
              enregistré pendant. L&apos;écart est la différence entre les deux.
            </Text>

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
                  {report.ecarts.map((e, i) => (
                    <View
                      key={i}
                      style={[
                        styles.tableRow,
                        i < report.ecarts.length - 1 && styles.tableRowBorder,
                      ]}
                    >
                      <View style={styles.colFacilitateur}>
                        <Text style={styles.tableCellBold}>
                          {e.facilitateurNom}
                        </Text>
                      </View>
                      <Text style={[styles.tableCell, styles.colNum]}>
                        {e.seances}
                      </Text>
                      <Text style={[styles.tableCell, styles.colNumWide]}>
                        {e.sequencesRealisees}
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
                        {e.delaiMoyenRemontee} j
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            <Text style={styles.explanation}>
              Un écart n&apos;est pas une faute. Il indique un endroit du
              déroulé qui résiste, et se lit avec le facilitateur, pas contre
              lui.
            </Text>

            <View style={styles.divider} />
            <Text style={styles.reportMetaMuted}>
              Document généré par Mvoé. Il ne contient aucune donnée nominative
              de parent ni d&apos;enfant : seuls des agrégats sont remontés.
            </Text>
          </View>
        )}

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
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
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
  primaryBtnDisabled: {
    backgroundColor: "#A5AEFC",
  },
  primaryBtnText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    marginBottom: 12,
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: "center",
  },
  reportCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 18,
    marginTop: 12,
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
  amberCell: {
    color: "#F59E0B",
    fontWeight: "700",
  },
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

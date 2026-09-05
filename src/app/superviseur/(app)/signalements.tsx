import AccountMenu from "@/components/common/AccountMenu";
import { Colors } from "@/constants/colors";
import { getSignalements, updateSignalement } from "@/services/superviseur";
import type { Signalement, SignalementGravite, SignalementStatut } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function getGraviteStyle(gravite: SignalementGravite) {
  switch (gravite) {
    case "grave":
      return { bg: "#EF4444", color: Colors.white, label: "Grave" };
    case "moderee":
      return { bg: "#6B7280", color: Colors.white, label: "Modérée" };
    case "faible":
    default:
      return { bg: "#D1FAE5", color: "#047857", label: "Faible" };
  }
}

const STATUT_LABEL: Record<SignalementStatut, string> = {
  soumis: "Soumis",
  examine: "Examiné",
  oriente: "Orienté",
  clos: "Clos",
};

type TabKey = "attente" | "historique";

export default function SignalementsScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const [signalements, setSignalements] = useState<Signalement[] | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("attente");
  const [selected, setSelected] = useState<Signalement | null>(null);
  const [nouveauStatut, setNouveauStatut] = useState<SignalementStatut>("examine");
  const [suiteDonnee, setSuiteDonnee] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const load = () => getSignalements().then(setSignalements);

  useEffect(() => {
    load();
  }, []);

  const filteredSignalements = useMemo(() => {
    if (!signalements) return [];
    if (activeTab === "attente") {
      return signalements.filter((s) => s.statut !== "clos");
    }
    return signalements;
  }, [signalements, activeTab]);

  const stats = useMemo(() => {
    const list = signalements ?? [];
    const aTraiter = list.filter((s) => s.statut !== "clos").length;
    const dontGraves = list.filter(
      (s) => s.statut !== "clos" && s.gravite === "grave"
    ).length;
    const recusEnTout = list.length;
    const delaiMoyenJours = list.length
      ? Math.round(
          list.reduce((sum, s) => sum + s.joursAttente, 0) / list.length
        )
      : 0;
    return { aTraiter, dontGraves, recusEnTout, delaiMoyenJours };
  }, [signalements]);

  const openModal = (s: Signalement) => {
    setSelected(s);
    setNouveauStatut(s.statut === "soumis" ? "examine" : s.statut);
    setSuiteDonnee(s.suiteDonnee ?? "");
    setModalError(null);
  };

  const closeModal = () => setSelected(null);

  const handleValider = async () => {
    if (!selected) return;
    setModalError(null);
    setSaving(true);
    try {
      await updateSignalement(selected.id, {
        statut: nouveauStatut,
        suiteDonnee: suiteDonnee.trim() || undefined,
      });
      closeModal();
      load();
    } catch (error) {
      setModalError(
        error instanceof Error ? error.message : "La mise à jour a échoué."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!signalements) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

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
                {stats.aTraiter}
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
                {stats.dontGraves}
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
                {stats.recusEnTout}
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
                {stats.delaiMoyenJours}
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
                    onPress={() => openModal(s)}
                  >
                    <View style={styles.situationColumn}>
                      <Text style={styles.situationText}>{s.situation}</Text>
                      <Text style={styles.dateText}>
                        {s.soumisLe} · {STATUT_LABEL[s.statut]}
                        {s.statut !== "clos" ? ` · ${s.joursAttente} j` : ""}
                      </Text>
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

      {/* Modale de traitement */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{selected?.situation}</Text>
              <Text style={styles.modalMeta}>
                Reçu le {selected?.soumisLe} · {selected?.arrondissementNom} ·
                remonté par {selected?.facilitateurNom}
              </Text>

              <Text style={styles.modalSectionLabel}>NOUVEAU STATUT</Text>
              <View style={styles.statutRow}>
                {(["examine", "oriente", "clos"] as SignalementStatut[]).map(
                  (statut) => (
                    <TouchableOpacity
                      key={statut}
                      style={[
                        styles.statutOption,
                        nouveauStatut === statut && styles.statutOptionActive,
                      ]}
                      onPress={() => setNouveauStatut(statut)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.statutOptionText,
                          nouveauStatut === statut &&
                            styles.statutOptionTextActive,
                        ]}
                      >
                        {STATUT_LABEL[statut]}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <Text style={styles.modalSectionLabel}>
                SUITE DONNÉE{" "}
                {(nouveauStatut === "oriente" || nouveauStatut === "clos") && (
                  <Text style={styles.requiredTag}>— obligatoire</Text>
                )}
              </Text>
              <TextInput
                style={styles.suiteInput}
                multiline
                numberOfLines={4}
                placeholder="Ce que vous avez fait de ce signalement…"
                placeholderTextColor={Colors.placeholder}
                value={suiteDonnee}
                onChangeText={setSuiteDonnee}
              />
              <Text style={styles.modalHint}>
                Le facilitateur qui a remonté ce signalement lira ce texte :
                un signalement sans retour est un signalement qu&apos;il ne
                refera pas.
              </Text>

              <View style={styles.noNotifBanner}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.noNotifText}>
                  Aucune autorité n&apos;est prévenue automatiquement par ce
                  changement de statut.
                </Text>
              </View>

              {modalError && <Text style={styles.errorText}>{modalError}</Text>}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.validerButton, saving && styles.validerButtonDisabled]}
                  onPress={handleValider}
                  activeOpacity={0.85}
                  disabled={saving}
                >
                  <Text style={styles.validerButtonText}>
                    {saving ? "Enregistrement…" : "Valider"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,15,25,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 6,
  },
  modalMeta: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
    marginBottom: 20,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  requiredTag: {
    color: "#DC2626",
  },
  statutRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  statutOption: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  statutOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: "#EEF2FF",
  },
  statutOptionText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  statutOptionTextActive: {
    color: Colors.primary,
  },
  suiteInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    textAlignVertical: "top",
    minHeight: 90,
    marginBottom: 8,
  },
  modalHint: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  noNotifBanner: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  noNotifText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  validerButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  validerButtonDisabled: {
    backgroundColor: "#A5AEFC",
  },
  validerButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
});

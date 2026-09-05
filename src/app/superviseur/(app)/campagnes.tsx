import AccountMenu from "@/components/common/AccountMenu";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { MOCK_LANGUES, MOCK_REGIONS } from "@/mocks/common";
import { ApiError } from "@/services/client";
import {
  accuserCampagne,
  createCampagne,
  getCampagnes,
} from "@/services/superviseur";
import type { Campagne, CampagneStatut } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

const MODULE_OPTIONS = [
  "Animer une séance de cohorte",
  "Discipliner sans frapper : les trois gestes",
  "M2 — Discipline positive",
  "M4 — Communication non violente",
];

function getStatutStyle(statut: CampagneStatut) {
  switch (statut) {
    case "en_cours":
      return { bg: "#10B981", label: "En cours" };
    case "terminee":
      return { bg: "#9CA3AF", label: "Terminée" };
    case "planifiee":
    default:
      return { bg: "#F59E0B", label: "Planifiée" };
  }
}

function ProgressStat({
  label,
  recues,
  affectees,
}: {
  label: string;
  recues: number;
  affectees: number;
}) {
  const pct = affectees > 0 ? Math.min(recues / affectees, 1) : 0;

  return (
    <View style={styles.progressStat}>
      <View style={styles.progressStatHeader}>
        <Text style={styles.progressStatLabel}>{label}</Text>
        <Text style={styles.progressStatValue}>
          {recues}/{affectees}
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

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function CampagnesScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const { superviseur } = useAuth();
  const peutCreer = superviseur?.compte.portee.niveau === "national";

  const [campagnes, setCampagnes] = useState<Campagne[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [titre, setTitre] = useState("");
  const [objet, setObjet] = useState("");
  const [modules, setModules] = useState<string[]>([]);
  const [langues, setLangues] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const load = () => getCampagnes().then(setCampagnes);

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setTitre("");
    setObjet("");
    setModules([]);
    setLangues([]);
    setRegions([]);
    setDateDebut("");
    setDateFin("");
    setFormError(null);
  };

  const handleAcquitter = (id: string) => {
    accuserCampagne(id).then(load);
  };

  const handleCreer = async () => {
    if (!titre.trim() || modules.length === 0 || langues.length === 0 || regions.length === 0 || !dateDebut || !dateFin) {
      setFormError("Titre, modules, langues, régions et dates sont requis.");
      return;
    }
    setFormError(null);
    setCreating(true);
    try {
      await createCampagne({
        titre,
        objet: objet.trim() || undefined,
        modules,
        langues,
        regions,
        dateDebut,
        dateFin,
      });
      setModalVisible(false);
      resetForm();
      load();
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "La création a échoué."
      );
    } finally {
      setCreating(false);
    }
  };

  if (!campagnes) {
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
          <Text style={styles.breadcrumbCurrent}>Campagnes</Text>
        </View>

        {/* Titre */}
        <Text style={styles.pageTitle}>Campagnes</Text>
        <Text style={styles.pageSubtitle}>
          Une campagne pousse des modules, dans des langues, sur des
          territoires. Elle ne remplace pas les séances : elle les accompagne.
        </Text>

        {peutCreer ? (
          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.85}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={18} color={Colors.white} />
            <Text style={styles.createButtonText}>Nouvelle campagne</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Seul le niveau national crée une campagne. Votre compte peut la
              lire et en accuser réception.
            </Text>
          </View>
        )}

        {campagnes.map((campagne) => {
          const statutStyle = getStatutStyle(campagne.statut);

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

              {campagne.objet && (
                <Text style={styles.description}>{campagne.objet}</Text>
              )}

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
                {campagne.affectations.map((a) => (
                  <ProgressStat
                    key={a.portee}
                    label={a.portee}
                    recues={a.recues}
                    affectees={a.affectees}
                  />
                ))}
              </View>

              <Text style={styles.echelonsText}>
                Ce n&apos;est pas un taux d&apos;exécution du programme :
                c&apos;est le nombre d&apos;échelons qui savent qu&apos;elle
                existe.
              </Text>

              <TouchableOpacity
                style={[
                  styles.acquitteButton,
                  campagne.jaiPrisConnaissance && styles.acquitteButtonDone,
                ]}
                activeOpacity={0.85}
                disabled={campagne.jaiPrisConnaissance}
                onPress={() => handleAcquitter(campagne.id)}
              >
                {campagne.jaiPrisConnaissance && (
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
                    campagne.jaiPrisConnaissance &&
                      styles.acquitteButtonTextDone,
                  ]}
                >
                  {campagne.jaiPrisConnaissance
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

      {/* Modale de création */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Nouvelle campagne</Text>

              <Text style={styles.modalLabel}>Titre</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Écoute et révélation"
                placeholderTextColor={Colors.placeholder}
                value={titre}
                onChangeText={setTitre}
              />

              <Text style={styles.modalLabel}>
                Objet <Text style={styles.optionalTag}>— facultatif</Text>
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ce que cette campagne cherche à faire savoir"
                placeholderTextColor={Colors.placeholder}
                value={objet}
                onChangeText={setObjet}
              />

              <Text style={styles.modalLabel}>Modules</Text>
              <View style={styles.chipRow}>
                {MODULE_OPTIONS.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.chip, modules.includes(m) && styles.chipActive]}
                    onPress={() => setModules((prev) => toggle(prev, m))}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        modules.includes(m) && styles.chipTextActive,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Langues</Text>
              <View style={styles.chipRow}>
                {MOCK_LANGUES.map((l) => (
                  <TouchableOpacity
                    key={l.code}
                    style={[
                      styles.chip,
                      langues.includes(l.libelle) && styles.chipActive,
                    ]}
                    onPress={() => setLangues((prev) => toggle(prev, l.libelle))}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        langues.includes(l.libelle) && styles.chipTextActive,
                      ]}
                    >
                      {l.libelle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Régions</Text>
              <View style={styles.chipRow}>
                {MOCK_REGIONS.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.chip,
                      regions.includes(r.nom) && styles.chipActive,
                    ]}
                    onPress={() => setRegions((prev) => toggle(prev, r.nom))}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        regions.includes(r.nom) && styles.chipTextActive,
                      ]}
                    >
                      {r.nom}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Text style={styles.modalLabel}>Date de début</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="JJ/MM/AAAA"
                    placeholderTextColor={Colors.placeholder}
                    value={dateDebut}
                    onChangeText={setDateDebut}
                  />
                </View>
                <View style={styles.dateField}>
                  <Text style={styles.modalLabel}>Date de fin</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="JJ/MM/AAAA"
                    placeholderTextColor={Colors.placeholder}
                    value={dateFin}
                    onChangeText={setDateFin}
                  />
                </View>
              </View>

              {formError && <Text style={styles.errorText}>{formError}</Text>}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, creating && styles.confirmButtonDisabled]}
                  onPress={handleCreer}
                  disabled={creating}
                >
                  <Text style={styles.confirmButtonText}>
                    {creating ? "Création…" : "Déclencher la campagne"}
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
    marginBottom: 16,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 16,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
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
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 18,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  optionalTag: {
    fontWeight: "400",
    color: Colors.textMuted,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: "#EEF2FF",
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  chipTextActive: {
    color: Colors.primary,
  },
  dateRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateField: {
    flex: 1,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
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
  confirmButton: {
    flex: 1.4,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#A5AEFC",
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
  },
});

import AccountMenu from "@/components/common/AccountMenu";
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

const MOCK_DATA = {
  delegation: "Ebolowa II",
  arrondissements: 1,
  formes: 3,
  actifs: 3,
  inactifs: 0,
  jamaisActifs: 0,
  facilitateurs: [
    {
      nom: "Ateba Marie-Claire",
      telephone: "677 01 04 72",
      profession: "Enseignant",
      arrondissement: "Ebolowa II",
      commune: "Mvila",
      statut: "actif",
    },
    {
      nom: "Ndzana Léonie",
      telephone: "676 31 41 87",
      profession: "ONG",
      arrondissement: "Ebolowa II",
      commune: "Mvila",
      statut: "actif",
    },
    {
      nom: "Ndzana Étienne",
      telephone: "699 41 27 08",
      profession: "Agent public",
      arrondissement: "Ebolowa II",
      commune: "Mvila",
      statut: "actif",
    },
  ],
};

const ARRONDISSEMENT_OPTIONS = ["Tous ceux de ma portée", "Ebolowa II"];

export default function RegistreScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const [selectedArrondissement, setSelectedArrondissement] = useState(
    ARRONDISSEMENT_OPTIONS[0],
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredFacilitateurs =
    selectedArrondissement === "Tous ceux de ma portée"
      ? MOCK_DATA.facilitateurs
      : MOCK_DATA.facilitateurs.filter(
          (f) => f.arrondissement === selectedArrondissement,
        );

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
          <AccountMenu delegationLabel={MOCK_DATA.delegation} />
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
          <Text style={styles.breadcrumbCurrent}>Registre</Text>
        </View>

        {/* Title */}
        <Text style={styles.pageTitle}>Registre des facilitateurs</Text>
        <Text style={styles.pageSubtitle}>
          {MOCK_DATA.delegation} · {MOCK_DATA.arrondissements} arrondissement
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push("/superviseur/enregistrer")}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color={Colors.white} />
          <Text style={styles.ctaButtonText}>Enregistrer un facilitateur</Text>
        </TouchableOpacity>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Formés */}
          <View style={styles.statCard}>
            <View style={styles.statTopRow}>
              <View style={[styles.statIcon, { backgroundColor: "#EEF2FF" }]}>
                <Ionicons name="person-outline" size={22} color="#6366F1" />
              </View>
              <Text style={[styles.statValue, { color: Colors.text }]}>
                {MOCK_DATA.formes}
              </Text>
            </View>
            <Text style={styles.statLabel}>Formés</Text>
          </View>

          {/* Actifs */}
          <View style={styles.statCard}>
            <View style={styles.statTopRow}>
              <View style={[styles.statIcon, { backgroundColor: "#ECFDF5" }]}>
                <Ionicons name="checkmark" size={22} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: "#10B981" }]}>
                {MOCK_DATA.actifs}
              </Text>
            </View>
            <Text style={styles.statLabel}>Actifs</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(MOCK_DATA.actifs / MOCK_DATA.formes) * 100}%`,
                    backgroundColor: "#10B981",
                  },
                ]}
              />
            </View>
          </View>

          {/* Inactifs */}
          <View style={styles.statCard}>
            <View style={styles.statTopRow}>
              <View style={[styles.statIcon, { backgroundColor: "#FFFBEB" }]}>
                <Ionicons name="time-outline" size={22} color="#F59E0B" />
              </View>
              <Text style={[styles.statValue, { color: "#F59E0B" }]}>
                {MOCK_DATA.inactifs}
              </Text>
            </View>
            <Text style={styles.statLabel}>Inactifs</Text>
          </View>

          {/* Jamais actifs */}
          <View style={styles.statCard}>
            <View style={styles.statTopRow}>
              <View style={[styles.statIcon, { backgroundColor: "#FEF2F2" }]}>
                <Ionicons name="close" size={22} color="#EF4444" />
              </View>
              <Text style={[styles.statValue, { color: "#EF4444" }]}>
                {MOCK_DATA.jamaisActifs}
              </Text>
            </View>
            <Text style={styles.statLabel}>Jamais actifs</Text>
            <Text style={styles.statSubLabel}>compris dans les inactifs</Text>
          </View>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Est considéré comme inactif un facilitateur sans séance remontée
            depuis plus de 60 jours. Ce seuil se règle dans la configuration,
            pas dans le code.
          </Text>
        </View>

        {/* Filter section */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>ARRONDISSEMENT</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setDropdownOpen(!dropdownOpen)}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownText}>{selectedArrondissement}</Text>
            <Ionicons
              name={dropdownOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
          {dropdownOpen && (
            <View style={styles.dropdownMenu}>
              {ARRONDISSEMENT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownItem,
                    selectedArrondissement === option &&
                      styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedArrondissement(option);
                    setDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedArrondissement === option &&
                        styles.dropdownItemTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                  {selectedArrondissement === option && (
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

        {/* Facilitateurs table */}
        <View style={styles.tableCard}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>
              Facilitateur
            </Text>
            <Text
              style={[
                styles.tableHeaderCell,
                { width: 110, textAlign: "right" },
              ]}
            >
              Arrondisse…
            </Text>
          </View>

          {/* Table rows */}
          {filteredFacilitateurs.map((f, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index < filteredFacilitateurs.length - 1 &&
                  styles.tableRowBorder,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.facilitateurName}>{f.nom}</Text>
                <Text style={styles.facilitateurPhone}>{f.telephone}</Text>
                <Text style={styles.facilitateurProfession}>
                  {f.profession}
                </Text>
              </View>
              <View style={{ width: 110, alignItems: "flex-end" }}>
                <Text style={styles.facilitateurArrondissement}>
                  {f.arrondissement}
                </Text>
                <Text style={styles.facilitateurCommune}>{f.commune}</Text>
              </View>
            </View>
          ))}
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
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
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
    marginBottom: 2,
  },
  statSubLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  progressTrack: {
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
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
    lineHeight: 22,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "500",
  },
  dropdownMenu: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    marginTop: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemActive: {
    backgroundColor: "#F0F4FF",
  },
  dropdownItemText: {
    fontSize: 15,
    color: Colors.text,
  },
  dropdownItemTextActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
  tableCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
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
  tableRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  facilitateurName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  facilitateurPhone: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 1,
  },
  facilitateurProfession: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  facilitateurArrondissement: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "right",
    marginBottom: 2,
  },
  facilitateurCommune: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});

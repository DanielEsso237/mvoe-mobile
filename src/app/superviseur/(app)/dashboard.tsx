import AccountMenu from "@/components/common/AccountMenu";
import AlertCard from "@/components/superviseur/AlertCard";
import StatCard from "@/components/superviseur/StatCard";
import StatCardSimple from "@/components/superviseur/StatCardSimple";
import StatCardText from "@/components/superviseur/StatCardText";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getTableauDeBord } from "@/services/superviseur";
import type { TableauDeBordIndicateurs } from "@/types";
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

const NIVEAU_LABEL: Record<string, string> = {
  national: "Niveau national",
  region: "Délégation régionale",
  departement: "Délégation départementale",
  arrondissement: "Délégation d'arrondissement",
};

export default function DashboardScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const { superviseur } = useAuth();
  const [data, setData] = useState<TableauDeBordIndicateurs | null>(null);

  useEffect(() => {
    getTableauDeBord().then(setData);
  }, []);

  if (!data) {
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
        >
          <Ionicons name="menu" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mvoé</Text>
        <View style={styles.headerRight}>
          <AccountMenu />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Fil d'ariane */}
        <View style={styles.filRow}>
          {data.fil.map((etape, index) => (
            <View key={etape.entiteId ?? "national"} style={styles.filItemRow}>
              <Text
                style={[
                  styles.filItem,
                  index === data.fil.length - 1 && styles.filItemCurrent,
                ]}
              >
                {etape.libelle}
              </Text>
              {index < data.fil.length - 1 && (
                <Text style={styles.filSep}> / </Text>
              )}
            </View>
          ))}
        </View>

        {/* Titre délégation */}
        <View style={styles.titleSection}>
          <Text style={styles.delegationName}>{superviseur?.compte.portee.libelle}</Text>
          <Text style={styles.delegationType}>
            {NIVEAU_LABEL[superviseur?.compte.portee.niveau ?? "arrondissement"]}
          </Text>
          <TouchableOpacity
            style={styles.registreBtn}
            onPress={() => router.push("/superviseur/registre")}
          >
            <Text style={styles.registreBtnText}>Ouvrir le registre</Text>
          </TouchableOpacity>
        </View>

        {/* Stats principales */}
        <StatCard
          iconName="people-outline"
          iconBg="#EEF2FF"
          iconColor="#6366F1"
          value={data.facilitateursActifs}
          label="Facilitateurs actifs"
          sublabel={`sur ${data.facilitateursFormes} formés`}
          progress={data.facilitateursActifs / data.facilitateursFormes}
          progressColor={Colors.primary}
        />

        <StatCardSimple
          iconName="list-outline"
          iconBg="#ECFDF5"
          iconColor="#10B981"
          value={data.cohortes}
          label="Cohortes"
        />

        <StatCardSimple
          iconName="person-outline"
          iconBg="#EFF6FF"
          iconColor="#3B82F6"
          value={data.parentsInscrits}
          label="Parents inscrits"
        />

        <StatCardSimple
          iconName="calendar-outline"
          iconBg="#F5F3FF"
          iconColor="#8B5CF6"
          value={data.seancesTenues}
          label="Séances tenues"
        />

        <StatCardText
          value={`${data.seancesParParent}`}
          label="séances reçues par parent inscrit"
          description="Un parent rattrapé par son binôme a reçu la séance : il compte."
        />

        <StatCardText
          value={`${data.ecarts}`}
          label="écarts entre le déclaré et l'observé"
          description="Un écart n'est pas une faute : il montre un endroit du déroulé qui résiste."
          valueColor="#F59E0B"
        />

        <StatCardText
          value={`${data.joursRemontee}`}
          label="jours entre la séance et sa remontée"
          description="C'est la chaîne d'information elle-même qui se mesure ici."
        />

        {/* Section Le terrain */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Le terrain</Text>
          <Text style={styles.sectionSubtitle}>
            Causeries, ateliers, porte-à-porte, visites, réunions de groupe.
          </Text>
        </View>

        <StatCardSimple
          iconName="star-outline"
          iconBg="#FFFBEB"
          iconColor="#F59E0B"
          value={data.activites}
          label="Activités"
        />

        <StatCard
          iconName="people-outline"
          iconBg="#EFF6FF"
          iconColor="#3B82F6"
          value={data.personnesTouchees}
          label="Personnes touchées"
          sublabel={`${data.femmes} femmes · ${data.hommes} hommes`}
          progress={data.femmes / data.personnesTouchees}
          progressColor="#6366F1"
        />

        <StatCard
          iconName="heart-outline"
          iconBg="#ECFDF5"
          iconColor="#10B981"
          value={null}
          label="Groupes de soutien"
          sublabel={`actifs sur ${data.groupesSoutienTotal}`}
          progress={1}
          progressColor="#10B981"
        />

        {/* Alertes */}
        <AlertCard
          items={[
            {
              value: data.participantsHandicap,
              text: `participants en situation de handicap, sur ${data.personnesTouchees} personnes touchées. Comptés activité par activité, jamais estimés.`,
              color: Colors.text,
            },
            {
              value: data.signalementsAttente,
              text: `signalements attendent d'être traités, sur ${data.signalementsTotal} reçus. Aucune autorité n'est prévenue automatiquement.`,
              color: "#EF4444",
            },
          ]}
        />

        {/* Découpage */}
        <View style={styles.decoupageCard}>
          <Text style={styles.decoupageTitle}>
            {data.portee.niveau === "arrondissement" ? "Facilitateurs" : "Découpage"}
          </Text>
          <View style={styles.decoupageTable}>
            <View style={[styles.decoupageRow, styles.decoupageHeader]}>
              <Text style={[styles.decoupageHeaderCell, { flex: 1 }]}>Nom</Text>
              <Text style={styles.decoupageHeaderCellNum}>Parents</Text>
              <Text style={styles.decoupageHeaderCellNum}>Séances</Text>
              <Text style={styles.decoupageHeaderCellNum}>Écarts</Text>
            </View>
            {data.decoupage.map((entite, index) => (
              <View
                key={entite.id}
                style={[
                  styles.decoupageRow,
                  index < data.decoupage.length - 1 && styles.decoupageRowBorder,
                ]}
              >
                <Text style={[styles.decoupageCell, { flex: 1, fontWeight: "700" }]}>
                  {entite.nom}
                </Text>
                <Text style={styles.decoupageCellNum}>{entite.parents}</Text>
                <Text style={styles.decoupageCellNum}>{entite.seances}</Text>
                <Text
                  style={[
                    styles.decoupageCellNum,
                    entite.ecarts > 0 && styles.decoupageCellAmber,
                  ]}
                >
                  {entite.ecarts}
                </Text>
              </View>
            ))}
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  filRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  filItemRow: {
    flexDirection: "row",
  },
  filItem: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  filItemCurrent: {
    color: Colors.text,
    fontWeight: "700",
  },
  filSep: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  titleSection: {
    marginBottom: 4,
  },
  delegationName: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 4,
  },
  delegationType: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  registreBtn: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  registreBtnText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    minWidth: 80,
  },
  sectionSubtitle: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  decoupageCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  decoupageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  decoupageTable: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  decoupageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  decoupageHeader: {
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  decoupageHeaderCell: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  decoupageHeaderCellNum: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    width: 60,
    textAlign: "right",
  },
  decoupageRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  decoupageCell: {
    fontSize: 14,
    color: Colors.text,
  },
  decoupageCellNum: {
    fontSize: 14,
    color: Colors.textSecondary,
    width: 60,
    textAlign: "right",
  },
  decoupageCellAmber: {
    color: "#F59E0B",
    fontWeight: "700",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 16,
    lineHeight: 18,
  },
});

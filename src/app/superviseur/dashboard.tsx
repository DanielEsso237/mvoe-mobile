import AccountMenu from "@/components/common/AccountMenu";
import AlertCard from "@/components/superviseur/AlertCard";
import FacilitateursTable from "@/components/superviseur/FacilitateursTable";
import StatCard from "@/components/superviseur/StatCard";
import StatCardSimple from "@/components/superviseur/StatCardSimple";
import StatCardText from "@/components/superviseur/StatCardText";
import { Colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MOCK_DATA = {
  delegation: "Ebolowa II",
  type: "Délégation d'arrondissement · 1 arrondissement",
  facilitateursActifs: 3,
  facilitateursFormes: 3,
  cohortes: 4,
  parentsInscrits: 78,
  seancesTenues: 5,
  seancesParParent: 1.14,
  ecarts: 2,
  joursRemontee: 3.2,
  activites: 9,
  personnesTouchees: 124,
  femmes: 77,
  hommes: 45,
  groupesSoutienActifs: 1,
  groupesSoutienTotal: 1,
  participantsHandicap: 2,
  signalementsAttente: 3,
  signalementsTotal: 7,
  facilitateurs: [
    { nom: "Ateba Marie-Claire", derniereActivite: "il y a 16 j" },
    { nom: "Ndzana Léonie", derniereActivite: "il y a 16 j" },
    { nom: "Ndzana Étienne", derniereActivite: "il y a 1 j" },
  ],
};

export default function DashboardScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

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
        {/* Titre délégation */}
        <View style={styles.titleSection}>
          <Text style={styles.delegationName}>{MOCK_DATA.delegation}</Text>
          <Text style={styles.delegationType}>{MOCK_DATA.type}</Text>
          <TouchableOpacity style={styles.registreBtn}>
            <Text style={styles.registreBtnText}>Ouvrir le registre</Text>
          </TouchableOpacity>
        </View>

        {/* Stats principales */}
        <StatCard
          iconName="people-outline"
          iconBg="#EEF2FF"
          iconColor="#6366F1"
          value={MOCK_DATA.facilitateursActifs}
          label="Facilitateurs actifs"
          sublabel={`sur ${MOCK_DATA.facilitateursFormes} formés`}
          progress={
            MOCK_DATA.facilitateursActifs / MOCK_DATA.facilitateursFormes
          }
          progressColor={Colors.primary}
        />

        <StatCardSimple
          iconName="list-outline"
          iconBg="#ECFDF5"
          iconColor="#10B981"
          value={MOCK_DATA.cohortes}
          label="Cohortes"
        />

        <StatCardSimple
          iconName="person-outline"
          iconBg="#EFF6FF"
          iconColor="#3B82F6"
          value={MOCK_DATA.parentsInscrits}
          label="Parents inscrits"
        />

        <StatCardSimple
          iconName="calendar-outline"
          iconBg="#F5F3FF"
          iconColor="#8B5CF6"
          value={MOCK_DATA.seancesTenues}
          label="Séances tenues"
        />

        <StatCardText
          value={`${MOCK_DATA.seancesParParent}`}
          label="séances reçues par parent inscrit"
          description="Un parent rattrapé par son binôme a reçu la séance : il compte."
        />

        <StatCardText
          value={`${MOCK_DATA.ecarts}`}
          label="écarts entre le déclaré et l'observé"
          description="Un écart n'est pas une faute : il montre un endroit du déroulé qui résiste."
          valueColor="#F59E0B"
        />

        <StatCardText
          value={`${MOCK_DATA.joursRemontee}`}
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
          value={MOCK_DATA.activites}
          label="Activités"
        />

        <StatCard
          iconName="people-outline"
          iconBg="#EFF6FF"
          iconColor="#3B82F6"
          value={MOCK_DATA.personnesTouchees}
          label="Personnes touchées"
          sublabel={`${MOCK_DATA.femmes} femmes · ${MOCK_DATA.hommes} hommes`}
          progress={MOCK_DATA.femmes / MOCK_DATA.personnesTouchees}
          progressColor="#6366F1"
        />

        <StatCard
          iconName="heart-outline"
          iconBg="#ECFDF5"
          iconColor="#10B981"
          value={null}
          label="Groupes de soutien"
          sublabel={`actifs sur ${MOCK_DATA.groupesSoutienTotal}`}
          progress={1}
          progressColor="#10B981"
        />

        {/* Alertes */}
        <AlertCard
          items={[
            {
              value: MOCK_DATA.participantsHandicap,
              text: `participants en situation de handicap, sur ${MOCK_DATA.personnesTouchees} personnes touchées. Comptés activité par activité, jamais estimés.`,
              color: Colors.text,
            },
            {
              value: MOCK_DATA.signalementsAttente,
              text: `signalements attendent d'être traités, sur ${MOCK_DATA.signalementsTotal} reçus. Aucune autorité n'est prévenue automatiquement.`,
              color: "#EF4444",
            },
          ]}
        />

        {/* Tableau facilitateurs */}
        <FacilitateursTable facilitateurs={MOCK_DATA.facilitateurs} />

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
    gap: 12,
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
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 16,
    lineHeight: 18,
  },
});

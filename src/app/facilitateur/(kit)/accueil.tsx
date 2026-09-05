import KitHeader from "@/components/facilitateur/KitHeader";
import { Colors } from "@/constants/colors";
import {
  getCohortesDisponibles,
  getPaquet,
  getPaquetActuel,
} from "@/services/facilitateur";
import type { CohortePaquet, CohorteResume } from "@/types";
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

const SHORTCUTS: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
}[] = [
  { icon: "person-add-outline", label: "Inscrire un parent", route: "/facilitateur/inscrire" },
  { icon: "star-outline", label: "Enregistrer une activité", route: "/facilitateur/activite" },
  { icon: "home-outline", label: "Visite à domicile", route: "/facilitateur/visite" },
  { icon: "warning-outline", label: "Signaler", route: "/facilitateur/signaler" },
  { icon: "school-outline", label: "Ma formation", route: "/facilitateur/formation" },
  { icon: "bar-chart-outline", label: "Mon activité", route: "/facilitateur/tableau-de-bord" },
];

const STATUT_LABEL: Record<string, string> = {
  a_venir: "À venir",
  en_cours: "En cours",
  terminee: "Terminée",
};

export default function AccueilScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const [cohortesDisponibles, setCohortesDisponibles] = useState<
    CohorteResume[] | null
  >(null);
  const [paquet, setPaquet] = useState<CohortePaquet | null | undefined>(
    undefined
  );
  const [telechargement, setTelechargement] = useState(false);

  useEffect(() => {
    const local = getPaquetActuel();
    if (local) {
      setPaquet(local);
    } else {
      getCohortesDisponibles().then(setCohortesDisponibles);
      setPaquet(null);
    }
  }, []);

  const handleTelecharger = async (cohorteId: string) => {
    setTelechargement(true);
    try {
      const result = await getPaquet(cohorteId);
      setPaquet(result);
    } finally {
      setTelechargement(false);
    }
  };

  if (paquet === undefined) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <KitHeader title="Mon kit" onMenuPress={() => navigation.openDrawer()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!paquet ? (
          <View style={styles.card}>
            <Ionicons name="cloud-download-outline" size={32} color={Colors.primary} />
            <Text style={styles.cardTitle}>Télécharger votre cohorte</Text>
            <Text style={styles.cardSubtitle}>
              Le kit ne garde qu&apos;une seule cohorte hors-ligne à la fois.
              Téléchargez-la pendant que vous êtes en ligne.
            </Text>
            {(cohortesDisponibles ?? []).map((cohorte) => (
              <TouchableOpacity
                key={cohorte.id}
                style={styles.telechargerButton}
                activeOpacity={0.85}
                disabled={telechargement}
                onPress={() => handleTelecharger(cohorte.id)}
              >
                <Text style={styles.telechargerButtonText}>
                  {telechargement
                    ? "Téléchargement…"
                    : `Télécharger « ${cohorte.libelle} »`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <>
            {/* Carte cohorte */}
            <View style={styles.card}>
              <Text style={styles.cohorteTitle}>{paquet.cohorte.libelle}</Text>
              <Text style={styles.cohorteMeta}>
                {paquet.parents.length} parents · plafond {paquet.cohorte.ratioMax} ·
                démarrée le {paquet.cohorte.dateDebut}
              </Text>
            </View>

            {/* Séances */}
            {paquet.seances.map((seance) => (
              <TouchableOpacity
                key={seance.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => router.push("/facilitateur/seance")}
              >
                <View style={styles.seanceHeader}>
                  <Text style={styles.seanceModule}>{seance.moduleTitre}</Text>
                  <View
                    style={[
                      styles.statutBadge,
                      seance.statut === "en_cours" && styles.statutBadgeEnCours,
                      seance.statut === "terminee" && styles.statutBadgeTerminee,
                    ]}
                  >
                    <Text style={styles.statutBadgeText}>
                      {STATUT_LABEL[seance.statut]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.seanceMeta}>
                  {seance.sequences.length} séquences
                </Text>
              </TouchableOpacity>
            ))}

            {/* Raccourcis */}
            <Text style={styles.sectionTitle}>Accès rapide</Text>
            <View style={styles.shortcutsGrid}>
              {SHORTCUTS.map((s) => (
                <TouchableOpacity
                  key={s.route}
                  style={styles.shortcut}
                  activeOpacity={0.85}
                  onPress={() => router.push(s.route as any)}
                >
                  <View style={styles.shortcutIcon}>
                    <Ionicons name={s.icon} size={22} color={Colors.primary} />
                  </View>
                  <Text style={styles.shortcutLabel}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 8,
  },
  telechargerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  telechargerButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  cohorteTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
  },
  cohorteMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  seanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seanceModule: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
  },
  seanceMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statutBadge: {
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statutBadgeEnCours: {
    backgroundColor: "#DBEAFE",
  },
  statutBadgeTerminee: {
    backgroundColor: "#D1FAE5",
  },
  statutBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 8,
  },
  shortcutsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  shortcut: {
    width: "47%",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    gap: 10,
  },
  shortcutIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  shortcutLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});

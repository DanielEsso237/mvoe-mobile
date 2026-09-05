import AccountMenu from "@/components/common/AccountMenu";
import { Colors } from "@/constants/colors";
import { getCohortes, updateParametreCohorte } from "@/services/superviseur";
import type { Cohorte } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const RATIO_OPTIONS = [10, 15, 20, 25];

export default function ParametresScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [cohortes, setCohortes] = useState<Cohorte[] | null>(null);
  const [confirmations, setConfirmations] = useState<
    Record<string, { avant: number; apres: number }>
  >({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    getCohortes().then(setCohortes);
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  const handleChangeRatio = async (cohorte: Cohorte, nouveauRatio: number) => {
    const avant = cohorte.ratioMax;
    if (avant === nouveauRatio) return;

    setCohortes((prev) =>
      prev
        ? prev.map((c) =>
            c.id === cohorte.id ? { ...c, ratioMax: nouveauRatio } : c
          )
        : prev
    );

    await updateParametreCohorte(cohorte.id, nouveauRatio);

    setConfirmations((prev) => ({
      ...prev,
      [cohorte.id]: { avant, apres: nouveauRatio },
    }));
    if (timers.current[cohorte.id]) clearTimeout(timers.current[cohorte.id]);
    timers.current[cohorte.id] = setTimeout(() => {
      setConfirmations((prev) => {
        const next = { ...prev };
        delete next[cohorte.id];
        return next;
      });
    }, 5000);
  };

  if (!cohortes) {
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
        {/* Titre */}
        <Text style={styles.pageTitle}>Paramètres des cohortes</Text>
        <Text style={styles.pageSubtitle}>
          Le plafond d&apos;une cohorte se change ici, et prend effet
          immédiatement.
        </Text>

        {cohortes.map((cohorte) => {
          const places = Math.max(cohorte.ratioMax - cohorte.effectif, 0);
          const exces = cohorte.effectif - cohorte.ratioMax;
          const confirmation = confirmations[cohorte.id];

          return (
            <View key={cohorte.id} style={styles.card}>
              <Text style={styles.cohorteTitle}>{cohorte.libelle}</Text>
              <Text style={styles.cohorteSubtitle}>
                {cohorte.arrondissementNom}
              </Text>

              {confirmation && (
                <View style={styles.confirmBanner}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#047857"
                  />
                  <Text style={styles.confirmText}>
                    Plafond modifié : {confirmation.avant} → {confirmation.apres}
                  </Text>
                </View>
              )}

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Inscrits</Text>
                  <Text style={styles.statValue}>{cohorte.effectif}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Plafond</Text>
                  <Text style={styles.statValue}>{cohorte.ratioMax}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Places</Text>
                  <Text style={styles.statValue}>{places}</Text>
                </View>
              </View>

              <Text style={styles.ratioLabel}>Ratio maximum</Text>
              <View style={styles.ratioGrid}>
                {RATIO_OPTIONS.map((option) => {
                  const isActive = option === cohorte.ratioMax;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.ratioButton,
                        isActive && styles.ratioButtonActive,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleChangeRatio(cohorte, option)}
                    >
                      <Text
                        style={[
                          styles.ratioButtonText,
                          isActive && styles.ratioButtonTextActive,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {exces > 0 && (
                <View style={styles.warningBanner}>
                  <Text style={styles.warningText}>
                    {exces}{" "}
                    {exces === 1 ? "parent inscrit" : "parents inscrits"}{" "}
                    au-delà du plafond. Aucun n&apos;a été retiré.
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        <Text style={styles.footerNote}>
          Le plafond est une donnée de la cohorte, jamais une constante du code
          : c&apos;est ce qui permet à une délégation d&apos;adapter la taille
          de ses groupes sans attendre une nouvelle version de
          l&apos;application.
        </Text>

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
  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.text,
    lineHeight: 36,
    marginBottom: 8,
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
  cohorteTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    lineHeight: 26,
    marginBottom: 4,
  },
  cohorteSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 18,
  },
  confirmBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#D1FAE5",
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#047857",
  },
  statsRow: {
    flexDirection: "row",
    gap: 28,
    marginBottom: 20,
  },
  statItem: {},
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
  },
  ratioLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 10,
  },
  ratioGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  ratioButton: {
    width: "30%",
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  ratioButtonActive: {
    backgroundColor: Colors.primary,
    shadowOpacity: 0.2,
  },
  ratioButtonText: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
  },
  ratioButtonTextActive: {
    color: Colors.white,
  },
  warningBanner: {
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 14,
    marginTop: 18,
  },
  warningText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
  footerNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginTop: 4,
    marginBottom: 20,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
    lineHeight: 18,
  },
});

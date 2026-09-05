import KitHeader from "@/components/facilitateur/KitHeader";
import { Colors } from "@/constants/colors";
import { getPaquetActuel, inscrireParent } from "@/services/facilitateur";
import type { CohortePaquet } from "@/types";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LANGUES = [
  { value: "fr", label: "Français" },
  { value: "bulu", label: "Bulu" },
  { value: "en", label: "English" },
];
const SITUATIONS = [
  { value: "union", label: "En union" },
  { value: "seul", label: "Seul(e)" },
  { value: "non_renseigne", label: "Ne pas préciser" },
];
const REVENUS = [
  { value: "regulier", label: "Régulier" },
  { value: "irregulier", label: "Irrégulier" },
  { value: "aucun", label: "Aucun" },
  { value: "non_renseigne", label: "Ne pas préciser" },
];

export default function InscrireScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const [paquet, setPaquet] = useState<CohortePaquet | null | undefined>(
    undefined
  );
  const [langue, setLangue] = useState("fr");
  const [situation, setSituation] = useState<
    "union" | "seul" | "non_renseigne"
  >("non_renseigne");
  const [revenu, setRevenu] = useState<
    "regulier" | "irregulier" | "aucun" | "non_renseigne"
  >("non_renseigne");
  const [telephonePartage, setTelephonePartage] = useState(false);
  const [repereLocal, setRepereLocal] = useState("");
  const [soumission, setSoumission] = useState(false);
  const [resultat, setResultat] = useState<{ codeParent: string; codeAcces: string } | null>(
    null
  );

  useEffect(() => {
    setPaquet(getPaquetActuel());
  }, []);

  if (paquet === undefined) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!paquet) {
    return (
      <View style={styles.root}>
        <KitHeader title="Inscrire un parent" onMenuPress={() => navigation.openDrawer()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Téléchargez d&apos;abord votre cohorte depuis « Mon kit ».
          </Text>
        </View>
      </View>
    );
  }

  const depassementCap = paquet.parents.length >= paquet.cohorte.ratioMax;

  const handleSubmit = async () => {
    setSoumission(true);
    const result = await inscrireParent({
      langue,
      situation,
      revenu,
      telephonePartage,
      repereLocal: repereLocal.trim() || undefined,
    });
    setSoumission(false);
    setResultat(result);
  };

  if (resultat) {
    return (
      <View style={styles.root}>
        <KitHeader title="Inscrire un parent" onMenuPress={() => navigation.openDrawer()} />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>À remettre au parent</Text>
            <Text style={styles.cardSubtitle}>
              Ce code ne s&apos;affichera plus jamais sur cet appareil.
            </Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>Code parent</Text>
              <Text style={styles.codeValue}>{resultat.codeParent}</Text>
            </View>
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>Code d&apos;accès</Text>
              <Text style={styles.codeValue}>{resultat.codeAcces}</Text>
            </View>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => router.push("/facilitateur/accueil")}
            >
              <Text style={styles.submitButtonText}>Terminé</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <KitHeader title="Inscrire un parent" onMenuPress={() => navigation.openDrawer()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {depassementCap && (
          <View style={styles.capWarning}>
            <Text style={styles.capWarningText}>
              Cette cohorte a déjà atteint son plafond ({paquet.cohorte.ratioMax}).
              Vous pouvez continuer, mais prévenez votre superviseur.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>LANGUE</Text>
          <View style={styles.chipRow}>
            {LANGUES.map((l) => (
              <TouchableOpacity
                key={l.value}
                style={[styles.chip, langue === l.value && styles.chipActive]}
                onPress={() => setLangue(l.value)}
              >
                <Text
                  style={[styles.chipText, langue === l.value && styles.chipTextActive]}
                >
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.cardLabel}>SITUATION</Text>
          <View style={styles.chipRow}>
            {SITUATIONS.map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[styles.chip, situation === s.value && styles.chipActive]}
                onPress={() => setSituation(s.value as typeof situation)}
              >
                <Text
                  style={[styles.chipText, situation === s.value && styles.chipTextActive]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.cardLabel}>REVENU</Text>
          <View style={styles.chipRow}>
            {REVENUS.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[styles.chip, revenu === r.value && styles.chipActive]}
                onPress={() => setRevenu(r.value as typeof revenu)}
              >
                <Text
                  style={[styles.chipText, revenu === r.value && styles.chipTextActive]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.cardLabel}>TÉLÉPHONE</Text>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, !telephonePartage && styles.chipActive]}
              onPress={() => setTelephonePartage(false)}
            >
              <Text style={[styles.chipText, !telephonePartage && styles.chipTextActive]}>
                À elle seule
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chip, telephonePartage && styles.chipActive]}
              onPress={() => setTelephonePartage(true)}
            >
              <Text style={[styles.chipText, telephonePartage && styles.chipTextActive]}>
                Partagé au foyer
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cardLabel}>
            REPÈRE PRIVÉ <Text style={styles.optional}>— facultatif, local uniquement</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="ex : Odile, marché"
            placeholderTextColor={Colors.placeholder}
            value={repereLocal}
            onChangeText={setRepereLocal}
          />

          <TouchableOpacity
            style={[styles.submitButton, soumission && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={soumission}
          >
            <Text style={styles.submitButtonText}>
              {soumission ? "Inscription…" : "Inscrire ce parent"}
            </Text>
          </TouchableOpacity>
        </View>

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
  emptyState: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  capWarning: {
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 14,
  },
  capWarningText: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 19,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginTop: 6,
  },
  optional: {
    fontWeight: "400",
    textTransform: "none",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#A5AEFC",
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  codeBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  codeLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.primary,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});

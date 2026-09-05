import KitHeader from "@/components/facilitateur/KitHeader";
import { Colors } from "@/constants/colors";
import { enregistrerActivite, getGroupesSoutien } from "@/services/facilitateur";
import type { ActiviteType, GroupeSoutien } from "@/types";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TYPES: { value: ActiviteType; label: string }[] = [
  { value: "causerie", label: "Causerie" },
  { value: "atelier", label: "Atelier" },
  { value: "porte_a_porte", label: "Porte-à-porte" },
  { value: "reunion_groupe", label: "Réunion de groupe" },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function ActiviteScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const [groupes, setGroupes] = useState<GroupeSoutien[]>([]);
  const [type, setType] = useState<ActiviteType>("causerie");
  const [date] = useState(today());
  const [duree, setDuree] = useState("45");
  const [lieu, setLieu] = useState("");
  const [groupeSoutienId, setGroupeSoutienId] = useState<string | null>(null);
  const [commentaire, setCommentaire] = useState("");
  const [touchees, setTouchees] = useState("");
  const [handicap, setHandicap] = useState("");
  const [hommes, setHommes] = useState("");
  const [femmes, setFemmes] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [confirme, setConfirme] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    getGroupesSoutien().then(setGroupes);
  }, []);

  const nTouchees = Number(touchees) || 0;
  const nHandicap = Number(handicap) || 0;
  const nHommes = Number(hommes) || 0;
  const nFemmes = Number(femmes) || 0;
  const incoherence =
    nHandicap > nTouchees || nHommes + nFemmes > nTouchees;

  const isValid =
    lieu.trim().length > 0 &&
    Number(duree) >= 5 &&
    Number(duree) <= 480 &&
    nTouchees > 0 &&
    !incoherence;

  const handleSubmit = async () => {
    if (!isValid) {
      setErreur(
        incoherence
          ? "Les sous-totaux ne peuvent pas dépasser le nombre de personnes touchées."
          : "Vérifiez le lieu, la durée (5 à 480 min) et le nombre de personnes touchées."
      );
      return;
    }
    setErreur(null);
    setEnvoi(true);
    await enregistrerActivite({
      type,
      date,
      dureeMinutes: Number(duree),
      lieu,
      groupeSoutienId: groupeSoutienId ?? undefined,
      commentaire: commentaire.trim() || undefined,
      personnesTouchees: nTouchees,
      dontHandicap: nHandicap,
      hommes: nHommes,
      femmes: nFemmes,
    });
    setEnvoi(false);
    setConfirme(true);
  };

  if (confirme) {
    return (
      <View style={styles.root}>
        <KitHeader title="Activités" onMenuPress={() => navigation.openDrawer()} />
        <View style={styles.emptyState}>
          <Text style={styles.confirmTitle}>Activité enregistrée.</Text>
          <Text style={styles.confirmText}>
            Elle se synchronisera dès que le réseau reviendra.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/facilitateur/accueil")}
          >
            <Text style={styles.backButtonText}>Retour à mon kit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <KitHeader title="Activités" onMenuPress={() => navigation.openDrawer()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.label}>TYPE</Text>
          <View style={styles.chipRow}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.chip, type === t.value && styles.chipActive]}
                onPress={() => setType(t.value)}
              >
                <Text style={[styles.chipText, type === t.value && styles.chipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>DATE</Text>
          <View style={styles.dateBox}>
            <Text style={styles.dateText}>{date}</Text>
          </View>

          <Text style={styles.label}>DURÉE (minutes)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={duree}
            onChangeText={setDuree}
          />

          <Text style={styles.label}>LIEU (repère, pas une adresse)</Text>
          <TextInput
            style={styles.input}
            placeholder="Sous le grand manguier, marché central"
            placeholderTextColor={Colors.placeholder}
            value={lieu}
            onChangeText={setLieu}
          />

          {type === "reunion_groupe" && groupes.length > 0 && (
            <>
              <Text style={styles.label}>GROUPE DE SOUTIEN</Text>
              <View style={styles.chipRow}>
                {groupes.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.chip, groupeSoutienId === g.id && styles.chipActive]}
                    onPress={() => setGroupeSoutienId(g.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        groupeSoutienId === g.id && styles.chipTextActive,
                      ]}
                    >
                      {g.nom}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={styles.label}>
            COMMENTAIRE <Text style={styles.optional}>— sur l&apos;activité, pas une personne</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Facultatif"
            placeholderTextColor={Colors.placeholder}
            value={commentaire}
            onChangeText={setCommentaire}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Effectifs</Text>
          <Text style={styles.label}>PERSONNES TOUCHÉES</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={touchees}
            onChangeText={setTouchees}
          />
          <Text style={styles.label}>DONT EN SITUATION DE HANDICAP</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={handicap}
            onChangeText={setHandicap}
          />
          <View style={styles.row}>
            <View style={styles.rowField}>
              <Text style={styles.label}>HOMMES</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={hommes}
                onChangeText={setHommes}
              />
            </View>
            <View style={styles.rowField}>
              <Text style={styles.label}>FEMMES</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={femmes}
                onChangeText={setFemmes}
              />
            </View>
          </View>
          {incoherence && (
            <Text style={styles.erreur}>
              Les sous-totaux dépassent les personnes touchées.
            </Text>
          )}
        </View>

        {erreur && <Text style={styles.erreur}>{erreur}</Text>}

        <TouchableOpacity
          style={[styles.submitButton, envoi && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={envoi}
        >
          <Text style={styles.submitButtonText}>
            {envoi ? "Enregistrement…" : "Enregistrer l'activité"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          © 2026 Mvoé — Programme national de parentalité positive, MINPROFF.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F3F4F6" },
  emptyState: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center", gap: 12 },
  confirmTitle: { fontSize: 22, fontWeight: "800", color: Colors.text },
  confirmText: { fontSize: 14, color: Colors.textSecondary, textAlign: "center" },
  backButton: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  backButtonText: { color: Colors.white, fontWeight: "700" },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: "800", color: Colors.text },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginTop: 6,
  },
  optional: { fontWeight: "400", textTransform: "none" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: "#EEF2FF" },
  chipText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary },
  dateBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
  },
  dateText: { fontSize: 15, color: Colors.text },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  row: { flexDirection: "row", gap: 10 },
  rowField: { flex: 1 },
  erreur: { color: "#DC2626", fontSize: 13 },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitButtonDisabled: { backgroundColor: "#A5AEFC" },
  submitButtonText: { color: Colors.white, fontSize: 15, fontWeight: "700" },
  footer: { textAlign: "center", fontSize: 12, color: Colors.textMuted, lineHeight: 18, marginTop: 8 },
});

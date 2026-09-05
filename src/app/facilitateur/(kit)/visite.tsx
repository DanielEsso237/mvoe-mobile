import KitHeader from "@/components/facilitateur/KitHeader";
import { Colors } from "@/constants/colors";
import { enregistrerVisite, getFoyers } from "@/services/facilitateur";
import type { Foyer } from "@/types";
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

const OBSERVATIONS = [
  "Enfant scolarisé",
  "Signes de bonne alimentation",
  "Tensions perceptibles dans le foyer",
  "Difficulté d'accès à l'eau",
  "Autre adulte présent",
];

const DIFFICULTES = ["Voir", "Entendre", "Marcher", "Se souvenir", "Communiquer"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function VisiteScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const [foyers, setFoyers] = useState<Foyer[]>([]);
  const [foyerId, setFoyerId] = useState<string | null>(null);
  const [nouveauFoyer, setNouveauFoyer] = useState(false);
  const [localite, setLocalite] = useState("");
  const [adultes, setAdultes] = useState("2");
  const [enfants, setEnfants] = useState("1");
  const [difficultes, setDifficultes] = useState<string[]>([]);
  const [dejaParticipe, setDejaParticipe] = useState(false);
  const [observations, setObservations] = useState<string[]>([]);
  const [suiviPrevu, setSuiviPrevu] = useState<boolean | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [confirme, setConfirme] = useState(false);

  useEffect(() => {
    getFoyers().then((list) => {
      setFoyers(list);
      if (list.length === 0) setNouveauFoyer(true);
    });
  }, []);

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const isValid =
    (foyerId || (nouveauFoyer && localite.trim().length > 0)) &&
    suiviPrevu !== null;

  const handleSubmit = async () => {
    if (!isValid) return;
    setEnvoi(true);
    await enregistrerVisite({
      foyer: nouveauFoyer
        ? {
            localite,
            adultes: Number(adultes) || 0,
            enfants: Number(enfants) || 0,
            difficultesFonctionnelles: difficultes,
            dejaParticipeProgramme: dejaParticipe,
          }
        : { foyerId: foyerId! },
      date: today(),
      observations,
      suiviPrevu: !!suiviPrevu,
    });
    setEnvoi(false);
    setConfirme(true);
  };

  if (confirme) {
    return (
      <View style={styles.root}>
        <KitHeader title="Visites" onMenuPress={() => navigation.openDrawer()} />
        <View style={styles.emptyState}>
          <Text style={styles.confirmTitle}>Visite enregistrée.</Text>
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
      <KitHeader title="Visites" onMenuPress={() => navigation.openDrawer()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Le foyer</Text>

          {foyers.length > 0 && (
            <View style={styles.chipRow}>
              {foyers.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.chip, foyerId === f.id && !nouveauFoyer && styles.chipActive]}
                  onPress={() => {
                    setFoyerId(f.id);
                    setNouveauFoyer(false);
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      foyerId === f.id && !nouveauFoyer && styles.chipTextActive,
                    ]}
                  >
                    {f.localite}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.chip, nouveauFoyer && styles.chipActive]}
                onPress={() => setNouveauFoyer(true)}
              >
                <Text style={[styles.chipText, nouveauFoyer && styles.chipTextActive]}>
                  + Nouveau foyer
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {nouveauFoyer && (
            <>
              <Text style={styles.label}>LOCALITÉ (quartier, pas une adresse)</Text>
              <TextInput
                style={styles.input}
                placeholder="Quartier Nko'ovos"
                placeholderTextColor={Colors.placeholder}
                value={localite}
                onChangeText={setLocalite}
              />
              <View style={styles.row}>
                <View style={styles.rowField}>
                  <Text style={styles.label}>ADULTES</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={adultes}
                    onChangeText={setAdultes}
                  />
                </View>
                <View style={styles.rowField}>
                  <Text style={styles.label}>ENFANTS</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={enfants}
                    onChangeText={setEnfants}
                  />
                </View>
              </View>
              <Text style={styles.label}>DIFFICULTÉS FONCTIONNELLES DANS LE FOYER</Text>
              <View style={styles.chipRow}>
                {DIFFICULTES.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.chip, difficultes.includes(d) && styles.chipActive]}
                    onPress={() => setDifficultes((prev) => toggle(prev, d))}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        difficultes.includes(d) && styles.chipTextActive,
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.chip, dejaParticipe && styles.chipActive, styles.chipSelfWidth]}
                onPress={() => setDejaParticipe((v) => !v)}
              >
                <Text style={[styles.chipText, dejaParticipe && styles.chipTextActive]}>
                  A déjà participé au programme
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>La visite</Text>
          <Text style={styles.label}>CE QUE VOUS AVEZ OBSERVÉ</Text>
          <View style={styles.chipRow}>
            {OBSERVATIONS.map((o) => (
              <TouchableOpacity
                key={o}
                style={[styles.chip, observations.includes(o) && styles.chipActive]}
                onPress={() => setObservations((prev) => toggle(prev, o))}
              >
                <Text
                  style={[styles.chipText, observations.includes(o) && styles.chipTextActive]}
                >
                  {o}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.hint}>
            Une observation libre appartient au signalement, pas ici.
          </Text>

          <Text style={styles.label}>SUIVI PRÉVU ?</Text>
          <View style={styles.ouiNonRow}>
            <TouchableOpacity
              style={[styles.ouiNonButton, suiviPrevu === true && styles.ouiNonButtonActive]}
              onPress={() => setSuiviPrevu(true)}
            >
              <Text
                style={[styles.ouiNonText, suiviPrevu === true && styles.ouiNonTextActive]}
              >
                Oui
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ouiNonButton, suiviPrevu === false && styles.ouiNonButtonActive]}
              onPress={() => setSuiviPrevu(false)}
            >
              <Text
                style={[styles.ouiNonText, suiviPrevu === false && styles.ouiNonTextActive]}
              >
                Non
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, (!isValid || envoi) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || envoi}
        >
          <Text style={styles.submitButtonText}>
            {envoi ? "Enregistrement…" : "Enregistrer la visite"}
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
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelfWidth: { alignSelf: "flex-start" },
  chipActive: { borderColor: Colors.primary, backgroundColor: "#EEF2FF" },
  chipText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary },
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
  hint: { fontSize: 12, color: Colors.textMuted, lineHeight: 18 },
  ouiNonRow: { flexDirection: "row", gap: 10 },
  ouiNonButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  ouiNonButtonActive: { borderColor: Colors.primary, backgroundColor: "#EEF2FF" },
  ouiNonText: { fontSize: 14, fontWeight: "700", color: Colors.textSecondary },
  ouiNonTextActive: { color: Colors.primary },
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

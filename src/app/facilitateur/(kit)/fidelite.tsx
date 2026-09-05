import KitHeader from "@/components/facilitateur/KitHeader";
import { Colors } from "@/constants/colors";
import { getPaquetActuel, soumettreFidelite } from "@/services/facilitateur";
import type { CohortePaquet, FideliteReponse } from "@/types";
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

type Qualite = "difficile" | "correcte" | "bien_passee";

const QUALITE_OPTIONS: { value: Qualite; label: string }[] = [
  { value: "difficile", label: "Difficile" },
  { value: "correcte", label: "Correcte" },
  { value: "bien_passee", label: "Bien passée" },
];

export default function FideliteScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const [paquet, setPaquet] = useState<CohortePaquet | null | undefined>(
    undefined
  );
  const [reponses, setReponses] = useState<
    Record<string, { realisee: boolean | null; qualite?: Qualite; commentaire?: string }>
  >({});
  const [commentaireGeneral, setCommentaireGeneral] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [envoi, setEnvoi] = useState(false);

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

  const seance = paquet?.seances.find((s) => s.sequences.length > 0);
  const sequences = seance?.sequences.filter((s) => s.type === "unite" || s.type === "brise_glace") ?? [];

  const setRealisee = (id: string, realisee: boolean) => {
    setReponses((prev) => ({ ...prev, [id]: { ...prev[id], realisee } }));
  };
  const setQualite = (id: string, qualite: Qualite) => {
    setReponses((prev) => ({ ...prev, [id]: { ...prev[id], qualite } }));
  };
  const setCommentaire = (id: string, commentaire: string) => {
    setReponses((prev) => ({ ...prev, [id]: { ...prev[id], commentaire } }));
  };

  const nbRepondues = Object.values(reponses).filter((r) => r.realisee !== null && r.realisee !== undefined).length;

  const handleEnvoyer = async () => {
    setEnvoi(true);
    const payload: FideliteReponse[] = sequences
      .filter((seq) => reponses[seq.id]?.realisee !== undefined)
      .map((seq) => ({
        sequenceId: seq.id,
        realisee: !!reponses[seq.id].realisee,
        qualite: reponses[seq.id].qualite,
        commentaire: reponses[seq.id].commentaire,
      }));
    await soumettreFidelite(seance?.id ?? "", payload);
    setEnvoi(false);
    setEnvoye(true);
  };

  if (envoye) {
    return (
      <View style={styles.root}>
        <KitHeader title="Fidélité" onMenuPress={() => navigation.openDrawer()} />
        <View style={styles.emptyState}>
          <Text style={styles.confirmTitle}>Merci.</Text>
          <Text style={styles.confirmText}>
            {nbRepondues} sur {sequences.length} séquences répondues. Ce qui
            est resté vide ne sera pas envoyé.
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
      <KitHeader title="Fidélité" onMenuPress={() => navigation.openDrawer()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Ce que vous déclarez ici n&apos;affiche jamais ce que la séance a
          enregistré : les deux sources restent indépendantes.
        </Text>

        {sequences.map((seq) => {
          const reponse = reponses[seq.id];
          return (
            <View key={seq.id} style={styles.card}>
              <Text style={styles.cardTitle}>{seq.titre}</Text>
              <Text style={styles.cardLabel}>RÉALISÉE ?</Text>
              <View style={styles.ouiNonRow}>
                <TouchableOpacity
                  style={[
                    styles.ouiNonButton,
                    reponse?.realisee === true && styles.ouiNonButtonActive,
                  ]}
                  onPress={() => setRealisee(seq.id, true)}
                >
                  <Text
                    style={[
                      styles.ouiNonText,
                      reponse?.realisee === true && styles.ouiNonTextActive,
                    ]}
                  >
                    Oui
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.ouiNonButton,
                    reponse?.realisee === false && styles.ouiNonButtonActive,
                  ]}
                  onPress={() => setRealisee(seq.id, false)}
                >
                  <Text
                    style={[
                      styles.ouiNonText,
                      reponse?.realisee === false && styles.ouiNonTextActive,
                    ]}
                  >
                    Non
                  </Text>
                </TouchableOpacity>
              </View>

              {reponse?.realisee === true && (
                <>
                  <Text style={styles.cardLabel}>QUALITÉ</Text>
                  <View style={styles.qualiteRow}>
                    {QUALITE_OPTIONS.map((q) => (
                      <TouchableOpacity
                        key={q.value}
                        style={[
                          styles.qualiteChip,
                          reponse.qualite === q.value && styles.qualiteChipActive,
                        ]}
                        onPress={() => setQualite(seq.id, q.value)}
                      >
                        <Text
                          style={[
                            styles.qualiteChipText,
                            reponse.qualite === q.value && styles.qualiteChipTextActive,
                          ]}
                        >
                          {q.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Commentaire — facultatif"
                    placeholderTextColor={Colors.placeholder}
                    value={reponse.commentaire}
                    onChangeText={(text) => setCommentaire(seq.id, text)}
                  />
                </>
              )}
            </View>
          );
        })}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>CE QUI S&apos;EST LE MOINS BIEN PASSÉ</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Facultatif"
            placeholderTextColor={Colors.placeholder}
            multiline
            value={commentaireGeneral}
            onChangeText={setCommentaireGeneral}
          />
        </View>

        <TouchableOpacity
          style={[styles.envoyerButton, envoi && styles.envoyerButtonDisabled]}
          onPress={handleEnvoyer}
          disabled={envoi}
        >
          <Text style={styles.envoyerButtonText}>
            {envoi ? "Envoi…" : `Envoyer (${nbRepondues} sur ${sequences.length})`}
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
    gap: 12,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
  },
  confirmText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
  },
  backButton: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  backButtonText: {
    color: Colors.white,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  intro: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.6,
  },
  ouiNonRow: {
    flexDirection: "row",
    gap: 10,
  },
  ouiNonButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  ouiNonButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: "#EEF2FF",
  },
  ouiNonText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  ouiNonTextActive: {
    color: Colors.primary,
  },
  qualiteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  qualiteChip: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  qualiteChipActive: {
    borderColor: Colors.primary,
    backgroundColor: "#EEF2FF",
  },
  qualiteChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  qualiteChipTextActive: {
    color: Colors.primary,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.text,
    minHeight: 44,
  },
  envoyerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  envoyerButtonDisabled: {
    backgroundColor: "#A5AEFC",
  },
  envoyerButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});

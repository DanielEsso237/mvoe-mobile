import KitHeader from "@/components/facilitateur/KitHeader";
import { Colors } from "@/constants/colors";
import { getPaquetActuel } from "@/services/facilitateur";
import type { CohortePaquet, Sequence } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function formatChrono(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function SeanceScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const [paquet, setPaquet] = useState<CohortePaquet | null | undefined>(
    undefined
  );
  const [demarree, setDemarree] = useState(false);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [langue, setLangue] = useState<string | null>(null);
  const [modalite, setModalite] = useState<"audio" | "texte">("audio");
  const [chrono, setChrono] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setPaquet(getPaquetActuel());
  }, []);

  useEffect(() => {
    if (demarree) {
      timerRef.current = setInterval(() => setChrono((c) => c + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [demarree, sequenceIndex]);

  if (paquet === undefined) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const seance = paquet?.seances.find((s) => s.sequences.length > 0);

  if (!paquet || !seance) {
    return (
      <View style={styles.root}>
        <KitHeader title="Séance" onMenuPress={() => navigation.openDrawer()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Aucune séance disponible. Téléchargez d&apos;abord votre cohorte
            depuis « Mon kit ».
          </Text>
        </View>
      </View>
    );
  }

  const sequences = seance.sequences;
  const currentSequence: Sequence | undefined = sequences[sequenceIndex];
  const depassement = currentSequence
    ? chrono > currentSequence.dureeMinutes * 60
    : false;

  const handleDemarrer = () => {
    setDemarree(true);
    setSequenceIndex(0);
    setChrono(0);
    if (langue === null && currentSequence?.unite?.languesDisponibles.length) {
      setLangue(currentSequence.unite.languesDisponibles[0]);
    }
  };

  const handleSuivante = () => {
    if (sequenceIndex < sequences.length - 1) {
      setSequenceIndex((i) => i + 1);
      setChrono(0);
      const next = sequences[sequenceIndex + 1];
      if (next.unite?.languesDisponibles.length) {
        setLangue(next.unite.languesDisponibles[0]);
      }
    }
  };

  const estDerniere = sequenceIndex === sequences.length - 1;

  return (
    <View style={styles.root}>
      <KitHeader title="Séance" onMenuPress={() => navigation.openDrawer()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.moduleTitle}>{seance.moduleTitre}</Text>

        {!demarree ? (
          <TouchableOpacity
            style={styles.demarrerButton}
            activeOpacity={0.85}
            onPress={handleDemarrer}
          >
            <Text style={styles.demarrerButtonText}>Démarrer la séance</Text>
          </TouchableOpacity>
        ) : (
          <>
            {/* Séquence en cours */}
            <View style={styles.currentCard}>
              <Text style={styles.currentLabel}>SÉQUENCE EN COURS</Text>
              <Text style={styles.currentTitle}>{currentSequence?.titre}</Text>
              <Text
                style={[styles.chrono, depassement && styles.chronoDepassement]}
              >
                {formatChrono(chrono)}
              </Text>
              {depassement && (
                <Text style={styles.depassementText}>
                  Dépassement — ce n&apos;est qu&apos;une information, pas une
                  alarme.
                </Text>
              )}

              {currentSequence?.type === "brise_glace" && (
                <View style={styles.briseGlaceBand}>
                  <Text style={styles.briseGlaceText}>
                    Brise-glace — aucun contrôle ici, c&apos;est la salle qui
                    mène.
                  </Text>
                </View>
              )}

              {currentSequence?.unite && (
                <View style={styles.uniteBox}>
                  <View style={styles.langueRow}>
                    {currentSequence.unite.languesDisponibles.map((code) => (
                      <TouchableOpacity
                        key={code}
                        style={[
                          styles.langueChip,
                          langue === code && styles.langueChipActive,
                        ]}
                        onPress={() => setLangue(code)}
                      >
                        <Text
                          style={[
                            styles.langueChipText,
                            langue === code && styles.langueChipTextActive,
                          ]}
                        >
                          {code}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.modaliteRow}>
                    <TouchableOpacity
                      style={[
                        styles.modaliteButton,
                        modalite === "audio" && styles.modaliteButtonActive,
                      ]}
                      onPress={() => setModalite("audio")}
                    >
                      <Ionicons
                        name="volume-high-outline"
                        size={16}
                        color={modalite === "audio" ? Colors.white : Colors.primary}
                      />
                      <Text
                        style={[
                          styles.modaliteButtonText,
                          modalite === "audio" && styles.modaliteButtonTextActive,
                        ]}
                      >
                        Écouter
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modaliteButton,
                        modalite === "texte" && styles.modaliteButtonActive,
                      ]}
                      onPress={() => setModalite("texte")}
                    >
                      <Ionicons
                        name="reader-outline"
                        size={16}
                        color={modalite === "texte" ? Colors.white : Colors.primary}
                      />
                      <Text
                        style={[
                          styles.modaliteButtonText,
                          modalite === "texte" && styles.modaliteButtonTextActive,
                        ]}
                      >
                        Texte et images
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {modalite === "audio" ? (
                    currentSequence.unite.audioParLangue[langue ?? ""] ? (
                      <View style={styles.audioPlayer}>
                        <Ionicons name="play-circle" size={28} color={Colors.primary} />
                        <Text style={styles.audioFile}>
                          {currentSequence.unite.audioParLangue[langue ?? ""]}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.missingText}>
                        Pas encore d&apos;audio dans cette langue — utilisez le
                        texte.
                      </Text>
                    )
                  ) : currentSequence.unite.texteParLangue[langue ?? ""] ? (
                    <Text style={styles.uniteTexte}>
                      {currentSequence.unite.texteParLangue[langue ?? ""]}
                    </Text>
                  ) : (
                    <Text style={styles.missingText}>
                      Pas encore de texte dans cette langue.
                    </Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.pointageButton}
                onPress={() => router.push("/facilitateur/pointage")}
              >
                <Text style={styles.pointageButtonText}>Pointer les présences</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suivanteButton}
                onPress={
                  estDerniere
                    ? () => router.push("/facilitateur/fidelite")
                    : handleSuivante
                }
              >
                <Text style={styles.suivanteButtonText}>
                  {estDerniere ? "Terminer la séance" : "Séquence suivante"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Le déroulé */}
            <Text style={styles.sectionTitle}>Le déroulé</Text>
            <View style={styles.derouleList}>
              {sequences.map((seq, index) => {
                const etat =
                  index < sequenceIndex
                    ? "passee"
                    : index === sequenceIndex
                      ? "en_cours"
                      : "a_venir";
                return (
                  <View
                    key={seq.id}
                    style={[
                      styles.bloc,
                      { minHeight: 32 + seq.dureeMinutes * 2.2 },
                      etat === "en_cours" && styles.blocEnCours,
                      etat === "passee" && styles.blocPassee,
                      seq.type === "brise_glace" && styles.blocBriseGlace,
                    ]}
                  >
                    <Text
                      style={[
                        styles.blocTitre,
                        etat === "passee" && styles.blocTitrePassee,
                      ]}
                    >
                      {seq.titre}
                    </Text>
                    <Text style={styles.blocDuree}>{seq.dureeMinutes} min</Text>
                  </View>
                );
              })}
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
    lineHeight: 21,
  },
  moduleTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
  },
  demarrerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  demarrerButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  currentCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  currentLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  currentTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 4,
  },
  chrono: {
    fontSize: 40,
    fontWeight: "800",
    fontFamily: "monospace",
    color: Colors.text,
  },
  chronoDepassement: {
    color: "#F59E0B",
  },
  depassementText: {
    fontSize: 12,
    color: "#F59E0B",
    marginBottom: 6,
  },
  briseGlaceBand: {
    backgroundColor: "#FEF08A",
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
    alignItems: "center",
  },
  briseGlaceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#713F12",
    textAlign: "center",
  },
  uniteBox: {
    marginTop: 10,
    gap: 10,
  },
  langueRow: {
    flexDirection: "row",
    gap: 8,
  },
  langueChip: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  langueChipActive: {
    borderColor: Colors.primary,
    backgroundColor: "#EEF2FF",
  },
  langueChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  langueChipTextActive: {
    color: Colors.primary,
  },
  modaliteRow: {
    flexDirection: "row",
    gap: 8,
  },
  modaliteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modaliteButtonActive: {
    backgroundColor: Colors.primary,
  },
  modaliteButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
  modaliteButtonTextActive: {
    color: Colors.white,
  },
  audioPlayer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 14,
  },
  audioFile: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  uniteTexte: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 14,
  },
  missingText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: "italic",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  pointageButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  pointageButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  suivanteButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  suivanteButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 8,
  },
  derouleList: {
    gap: 8,
  },
  bloc: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    justifyContent: "center",
  },
  blocEnCours: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: "#EEF2FF",
  },
  blocPassee: {
    backgroundColor: "#F9FAFB",
    opacity: 0.7,
  },
  blocBriseGlace: {
    backgroundColor: "#FEF9C3",
  },
  blocTitre: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  blocTitrePassee: {
    textDecorationLine: "line-through",
    color: Colors.textMuted,
  },
  blocDuree: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});

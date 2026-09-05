import ParentHeader from "@/components/parent/ParentHeader";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getQuestions, repondreQuestion } from "@/services/parent";
import type { QuestionSemaine } from "@/types";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function QuestionsScreen() {
  const { parent } = useAuth();
  const estConnecte = !!parent?.token;
  const [questions, setQuestions] = useState<QuestionSemaine[] | null>(null);
  const [index, setIndex] = useState(0);
  const [optionChoisie, setOptionChoisie] = useState<string | null>(null);
  const [termine, setTermine] = useState(false);

  useEffect(() => {
    getQuestions().then(setQuestions);
  }, []);

  if (!questions) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const question = questions[index];

  const repondre = async (optionId: string) => {
    setOptionChoisie(optionId);
    if (estConnecte) {
      await repondreQuestion(question.id, optionId);
    }
  };

  const suivante = () => {
    setOptionChoisie(null);
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setTermine(true);
    }
  };

  if (termine) {
    return (
      <View style={styles.root}>
        <ParentHeader title="Les questions de la semaine" />
        <View style={styles.emptyState}>
          <Text style={styles.finTitle}>C&apos;est tout pour cette semaine.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ParentHeader title="Les questions de la semaine" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.progress}>
          Question {index + 1} sur {questions.length}
        </Text>

        <View style={styles.card}>
          <Text style={styles.enonce}>{question.enonce}</Text>

          <View style={styles.optionsColumn}>
            {question.options.map((option) => {
              const active = optionChoisie === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => repondre(option.id)}
                  disabled={!!optionChoisie}
                >
                  <Text
                    style={[styles.optionText, active && styles.optionTextActive]}
                  >
                    {option.libelle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {optionChoisie && (
            <View style={styles.explicationBox}>
              <Text style={styles.explicationTexte}>{question.explication}</Text>
              <Text style={styles.reference}>{question.reference}</Text>
              {!estConnecte && (
                <Text style={styles.anonymeNote}>
                  Votre choix n&apos;a été enregistré nulle part : cela demande
                  un code.
                </Text>
              )}
            </View>
          )}

          {optionChoisie && (
            <TouchableOpacity style={styles.suivanteButton} onPress={suivante}>
              <Text style={styles.suivanteButtonText}>
                {index < questions.length - 1 ? "Question suivante" : "Terminer"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.footer}>
          © 2026 Mvoé — Programme national de parentalité positive, MINPROFF.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F3F4F6" },
  loadingRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  finTitle: { fontSize: 20, fontWeight: "800", color: Colors.text, textAlign: "center" },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  progress: { fontSize: 13, color: Colors.textMuted, fontWeight: "600" },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  enonce: { fontSize: 17, fontWeight: "700", color: Colors.text, lineHeight: 24 },
  optionsColumn: { gap: 10 },
  option: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  optionActive: { borderColor: Colors.primary, backgroundColor: "#EEF2FF" },
  optionText: { fontSize: 14, color: Colors.text, fontWeight: "600" },
  optionTextActive: { color: Colors.primary },
  explicationBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  explicationTexte: { fontSize: 14, color: Colors.text, lineHeight: 20 },
  reference: { fontSize: 12, color: Colors.textMuted, fontStyle: "italic" },
  anonymeNote: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  suivanteButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  suivanteButtonText: { color: Colors.white, fontSize: 14, fontWeight: "700" },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});

import ParentHeader from "@/components/parent/ParentHeader";
import { Colors } from "@/constants/colors";
import { getSituations, poserAssistant } from "@/services/parent";
import type { AssistantReponse, SituationFrequente } from "@/types";
import { Ionicons } from "@expo/vector-icons";
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

export default function QuestionScreen() {
  const [situations, setSituations] = useState<SituationFrequente[] | null>(
    null
  );
  const [texteLibre, setTexteLibre] = useState("");
  const [interrogation, setInterrogation] = useState(false);
  const [reponse, setReponse] = useState<AssistantReponse | null>(null);

  useEffect(() => {
    getSituations().then(setSituations);
  }, []);

  const poser = async (situationId?: string) => {
    setInterrogation(true);
    setReponse(null);
    const result = await poserAssistant(
      situationId ? { situationId } : { texte: texteLibre.trim() }
    );
    setReponse(result);
    setInterrogation(false);
  };

  return (
    <View style={styles.root}>
      <ParentHeader title="Poser une question" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!reponse && (
          <>
            <Text style={styles.intro}>
              Ce n&apos;est pas une intelligence qui invente : elle ne répond
              qu&apos;avec ce que le programme a validé.
            </Text>

            <Text style={styles.sectionTitle}>Situations fréquentes</Text>
            {situations === null ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <View style={styles.chipColumn}>
                {situations.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={styles.situationCard}
                    onPress={() => poser(s.id)}
                    disabled={interrogation}
                  >
                    <Text style={styles.situationText}>{s.libelle}</Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>Ou décrivez votre situation</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Décrivez ce qui vous préoccupe…"
              placeholderTextColor={Colors.placeholder}
              multiline
              maxLength={500}
              value={texteLibre}
              onChangeText={setTexteLibre}
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!texteLibre.trim() || interrogation) && styles.submitButtonDisabled,
              ]}
              onPress={() => poser()}
              disabled={!texteLibre.trim() || interrogation}
            >
              <Text style={styles.submitButtonText}>
                {interrogation ? "Recherche…" : "Envoyer"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {reponse && (
          <View style={styles.reponseCard}>
            {reponse.trouve ? (
              <>
                <Text style={styles.reponseTexte}>{reponse.reponse}</Text>
                {reponse.texte && (
                  <Text style={styles.reponseDetail}>{reponse.texte}</Text>
                )}
                {reponse.reference && (
                  <Text style={styles.reference}>{reponse.reference}</Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.reponseTexte}>
                  Nous n&apos;avons pas de réponse validée pour cette
                  situation précise. Un facilitateur pourra vous aider :
                </Text>
                {reponse.contactsFacilitateurs?.map((c) => (
                  <View key={c.telephone} style={styles.contactRow}>
                    <Text style={styles.contactNom}>{c.nom}</Text>
                    <Text style={styles.contactTel}>{c.telephone}</Text>
                  </View>
                ))}
              </>
            )}
            <TouchableOpacity
              style={styles.nouvelleQuestionButton}
              onPress={() => {
                setReponse(null);
                setTexteLibre("");
              }}
            >
              <Text style={styles.nouvelleQuestionText}>Poser une autre question</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.footer}>
          © 2026 Mvoé — Programme national de parentalité positive, MINPROFF.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F3F4F6" },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 10 },
  intro: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Colors.text, marginTop: 8 },
  chipColumn: { gap: 8 },
  situationCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  situationText: { fontSize: 14, color: Colors.text, fontWeight: "600", flex: 1 },
  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 90,
    backgroundColor: Colors.white,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitButtonDisabled: { backgroundColor: "#A5AEFC" },
  submitButtonText: { color: Colors.white, fontSize: 15, fontWeight: "700" },
  reponseCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  reponseTexte: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  reponseDetail: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  reference: { fontSize: 12, color: Colors.textMuted, fontStyle: "italic" },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
  },
  contactNom: { fontSize: 14, fontWeight: "700", color: Colors.text },
  contactTel: { fontSize: 14, color: Colors.primary, fontWeight: "600" },
  nouvelleQuestionButton: {
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  nouvelleQuestionText: { color: Colors.primary, fontWeight: "700", fontSize: 14 },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});

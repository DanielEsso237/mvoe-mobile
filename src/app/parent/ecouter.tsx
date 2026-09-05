import ParentHeader from "@/components/parent/ParentHeader";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getModules, getUnite, getUnites } from "@/services/parent";
import type { Modalite, ModuleCatalogue, UniteDetail, UniteResume } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Vue = "modules" | "unites" | "unite";

export default function EcouterScreen() {
  const { parent } = useAuth();
  const langue = parent?.langue ?? "fr";
  const [vue, setVue] = useState<Vue>("modules");
  const [modules, setModules] = useState<ModuleCatalogue[] | null>(null);
  const [unites, setUnites] = useState<UniteResume[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleCatalogue | null>(
    null
  );
  const [uniteDetail, setUniteDetail] = useState<UniteDetail | null>(null);
  const [modalite, setModalite] = useState<Modalite>("audio");

  useEffect(() => {
    getModules().then(setModules);
  }, []);

  const ouvrirModule = async (module: ModuleCatalogue) => {
    setSelectedModule(module);
    const list = await getUnites(module.numero);
    setUnites(list);
    setVue("unites");
  };

  const ouvrirUnite = async (uniteId: string, m: Modalite = "audio") => {
    const detail = await getUnite(uniteId, m);
    setUniteDetail(detail ?? null);
    setModalite(m);
    setVue("unite");
  };

  if (!modules) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ParentHeader title="Écouter" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {vue !== "modules" && (
          <TouchableOpacity
            onPress={() => setVue(vue === "unite" ? "unites" : "modules")}
          >
            <Text style={styles.backLink}>
              ← {vue === "unite" ? selectedModule?.titre : "Tous les modules"}
            </Text>
          </TouchableOpacity>
        )}

        {vue === "modules" &&
          modules.map((m) => (
            <TouchableOpacity
              key={m.numero}
              style={[styles.card, !m.renseigne && styles.cardDisabled]}
              activeOpacity={0.85}
              disabled={!m.renseigne}
              onPress={() => ouvrirModule(m)}
            >
              <View style={styles.cardRow}>
                <Text style={styles.cardTitle}>{m.titre}</Text>
                {!m.renseigne && <Text style={styles.bientot}>Bientôt</Text>}
              </View>
              {m.renseigne && (
                <Text style={styles.cardMeta}>{m.unitesCount} unités</Text>
              )}
            </TouchableOpacity>
          ))}

        {vue === "unites" &&
          unites.map((u) => (
            <TouchableOpacity
              key={u.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => ouvrirUnite(u.id)}
            >
              <Text style={styles.cardTitle}>{u.titre}</Text>
            </TouchableOpacity>
          ))}

        {vue === "unite" && uniteDetail && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{uniteDetail.titre}</Text>
            {uniteDetail.langueDeRepli && (
              <Text style={styles.repliText}>
                Cette version n&apos;existe pas encore dans votre langue.
                Voici la version disponible.
              </Text>
            )}

            <View style={styles.modaliteRow}>
              <TouchableOpacity
                style={[
                  styles.modaliteButton,
                  modalite === "audio" && styles.modaliteButtonActive,
                ]}
                onPress={() => uniteDetail && ouvrirUnite(uniteDetail.id, "audio")}
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
                onPress={() => uniteDetail && ouvrirUnite(uniteDetail.id, "texte")}
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
                  Lire et voir
                </Text>
              </TouchableOpacity>
            </View>

            {modalite === "audio" ? (
              uniteDetail.fichierAudio ? (
                <View style={styles.audioPlayer}>
                  <Ionicons name="play-circle" size={32} color={Colors.primary} />
                  <Text style={styles.audioFile}>{uniteDetail.fichierAudio}</Text>
                </View>
              ) : (
                <Text style={styles.missingText}>
                  Pas encore d&apos;audio — essayez « Lire et voir ».
                </Text>
              )
            ) : uniteDetail.contenuTexte ? (
              <Text style={styles.uniteTexte}>{uniteDetail.contenuTexte}</Text>
            ) : (
              <Text style={styles.missingText}>Pas encore de texte disponible.</Text>
            )}
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
  loadingRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 10 },
  backLink: { fontSize: 15, fontWeight: "700", color: Colors.primary, marginBottom: 6 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  cardDisabled: { opacity: 0.5 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "800", color: Colors.text },
  cardMeta: { fontSize: 13, color: Colors.textMuted },
  bientot: { fontSize: 12, color: Colors.textMuted, fontStyle: "italic" },
  repliText: { fontSize: 12, color: "#92400E", fontStyle: "italic" },
  modaliteRow: { flexDirection: "row", gap: 8 },
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
  modaliteButtonActive: { backgroundColor: Colors.primary },
  modaliteButtonText: { fontSize: 13, fontWeight: "700", color: Colors.primary },
  modaliteButtonTextActive: { color: Colors.white },
  audioPlayer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 16,
  },
  audioFile: { fontSize: 13, color: Colors.textSecondary },
  uniteTexte: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 14,
  },
  missingText: { fontSize: 13, color: Colors.textMuted, fontStyle: "italic" },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});

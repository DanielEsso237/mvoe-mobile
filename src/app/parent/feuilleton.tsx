import ParentHeader from "@/components/parent/ParentHeader";
import { Colors } from "@/constants/colors";
import { getFeuilletons } from "@/services/parent";
import type { Feuilleton } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STORAGE_PREFIX = "mvoe.parent.lecture.";

function formatTemps(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function FeuilletonScreen() {
  const [feuilleton, setFeuilleton] = useState<Feuilleton | null>(null);
  const [episodeIndex, setEpisodeIndex] = useState(0);
  const [position, setPosition] = useState(0);
  const [lecture, setLecture] = useState(false);
  const [positionsSauvees, setPositionsSauvees] = useState<Record<number, number>>(
    {}
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getFeuilletons().then(async (f) => {
      setFeuilleton(f);
      const entries = await Promise.all(
        f.episodes.map(async (ep) => {
          const raw = await AsyncStorage.getItem(`${STORAGE_PREFIX}${ep.numero}`);
          return [ep.numero, raw ? Number(raw) : 0] as const;
        })
      );
      setPositionsSauvees(Object.fromEntries(entries));
    });
  }, []);

  const episode = feuilleton?.episodes[episodeIndex];

  const choisirEpisode = (index: number) => {
    setLecture(false);
    setEpisodeIndex(index);
    const numero = feuilleton?.episodes[index]?.numero;
    setPosition(numero !== undefined ? positionsSauvees[numero] ?? 0 : 0);
  };

  useEffect(() => {
    if (lecture && episode) {
      timerRef.current = setInterval(() => {
        setPosition((p) => {
          const next = Math.min(p + 1, episode.dureeSecondes);
          if (next % 2 === 0 || next === episode.dureeSecondes) {
            AsyncStorage.setItem(`${STORAGE_PREFIX}${episode.numero}`, String(next));
            setPositionsSauvees((prev) => ({ ...prev, [episode.numero]: next }));
          }
          if (next >= episode.dureeSecondes) setLecture(false);
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lecture, episode]);

  if (!feuilleton || !episode) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ParentHeader title="Le feuilleton" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titre}>{feuilleton.titre}</Text>
        <Text style={styles.resume}>{feuilleton.resume}</Text>
        {feuilleton.langueDeRepli && (
          <Text style={styles.repliText}>
            Version en langue de repli, faute de version dans votre langue.
          </Text>
        )}

        <View style={styles.playerCard}>
          <Text style={styles.episodeTitre}>
            Épisode {episode.numero} — {episode.titre}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(position / episode.dureeSecondes) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.playerRow}>
            <Text style={styles.tempsText}>
              {formatTemps(position)} / {episode.dureeLisible}
            </Text>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => setLecture((v) => !v)}
            >
              <Ionicons
                name={lecture ? "pause" : "play"}
                size={22}
                color={Colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Épisodes</Text>
        {feuilleton.episodes.map((ep, index) => {
          const saved = positionsSauvees[ep.numero] ?? 0;
          const aReprendre = saved > 0 && saved < ep.dureeSecondes;
          return (
            <TouchableOpacity
              key={ep.numero}
              style={[
                styles.episodeRow,
                index === episodeIndex && styles.episodeRowActive,
              ]}
              onPress={() => choisirEpisode(index)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.episodeRowTitre}>
                  {ep.numero}. {ep.titre}
                </Text>
                <Text style={styles.episodeRowMeta}>{ep.dureeLisible}</Text>
              </View>
              {aReprendre && <Text style={styles.reprendreTag}>À reprendre</Text>}
            </TouchableOpacity>
          );
        })}

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
  titre: { fontSize: 22, fontWeight: "800", color: Colors.text },
  resume: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  repliText: { fontSize: 12, color: "#92400E", fontStyle: "italic" },
  playerCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
    marginTop: 8,
  },
  episodeTitre: { fontSize: 16, fontWeight: "700", color: Colors.text },
  progressTrack: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  playerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tempsText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "monospace" },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Colors.text, marginTop: 8 },
  episodeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
  },
  episodeRowActive: { borderColor: Colors.primary, backgroundColor: "#EEF2FF" },
  episodeRowTitre: { fontSize: 14, fontWeight: "700", color: Colors.text },
  episodeRowMeta: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  reprendreTag: { fontSize: 11, fontWeight: "700", color: Colors.primary },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});

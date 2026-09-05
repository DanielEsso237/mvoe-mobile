import ParentHeader from "@/components/parent/ParentHeader";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CARDS: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  route: string;
}[] = [
  {
    icon: "headset-outline",
    title: "Écouter",
    subtitle: "Le catalogue du programme, en audio ou en images.",
    route: "/parent/ecouter",
  },
  {
    icon: "book-outline",
    title: "Le feuilleton",
    subtitle: "Une famille comme la vôtre, épisode après épisode.",
    route: "/parent/feuilleton",
  },
  {
    icon: "help-buoy-outline",
    title: "Poser une question",
    subtitle: "Une situation qui vous préoccupe ? Décrivez-la.",
    route: "/parent/question",
  },
];

export default function AccueilParentScreen() {
  const router = useRouter();
  const { parent } = useAuth();

  return (
    <View style={styles.root}>
      <ParentHeader title="Mvoé" showBack={false} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!parent?.programme && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              Vous consultez sans compte, et c&apos;est très bien. Un code
              vous permet en plus de répondre aux questions de la semaine.
            </Text>
          </View>
        )}

        {CARDS.map((card) => (
          <TouchableOpacity
            key={card.route}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push(card.route as any)}
          >
            <View style={styles.cardIcon}>
              <Ionicons name={card.icon} size={26} color={Colors.primary} />
            </View>
            <View style={styles.cardTextColumn}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.secondaryLink}
          onPress={() => router.push("/parent/questions")}
        >
          <Text style={styles.secondaryLinkText}>Les questions de la semaine</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryLink}
          onPress={() => router.push("/parent/facilitateur")}
        >
          <Text style={styles.secondaryLinkText}>Trouver un facilitateur</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
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
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  banner: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
  },
  bannerText: { fontSize: 13, color: Colors.text, lineHeight: 19 },
  card: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 18,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTextColumn: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: "800", color: Colors.text },
  cardSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, lineHeight: 18 },
  secondaryLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  secondaryLinkText: { fontSize: 14, fontWeight: "700", color: Colors.primary },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
});

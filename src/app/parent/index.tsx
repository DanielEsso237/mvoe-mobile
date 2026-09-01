import LogoHeader from "@/components/common/LogoHeader";
import SpaceSelector from "@/components/common/SpaceSelector";
import LanguageSelector from "@/components/login/LanguageSelector";
import { Colors } from "@/constants/colors";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ParentScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <LogoHeader title="Mvoé" subtitle="ESPACE PARENT" />
        <Text style={styles.title}>VOTRE LANGUE</Text>
        <Text style={styles.subtitle}>
          Choisissez, ou appuyez sur le haut-parleur pour écouter.
        </Text>
        <LanguageSelector onSelect={(code) => console.log("Langue:", code)} />
        <SpaceSelector currentSpace="parent" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.primary,
    marginBottom: 12,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
});

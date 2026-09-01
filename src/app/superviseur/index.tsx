import LogoHeader from "@/components/common/LogoHeader";
import SpaceSelector from "@/components/common/SpaceSelector";
import SupervisorForm from "@/components/login/SupervisorForm";
import { Colors } from "@/constants/colors";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function SuperviseurScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <LogoHeader title="Mvoé" subtitle="MINPROFF" />
        <Text style={styles.title}>OUVRIR UNE{"\n"}SESSION</Text>
        <Text style={styles.subtitle}>
          Ministère, délégation régionale, départementale ou d'arrondissement.
        </Text>
        <SupervisorForm />
        <SpaceSelector currentSpace="superviseur" />
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
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
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

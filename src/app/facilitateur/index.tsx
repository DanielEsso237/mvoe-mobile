import LogoHeader from "@/components/common/LogoHeader";
import SpaceSelector from "@/components/common/SpaceSelector";
import PhoneKitForm from "@/components/login/PhoneKitForm";
import { Colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function FacilitateurKitScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <LogoHeader title="Mvoé" subtitle="KIT DU FACILITATEUR" showOnline />
        <Text style={styles.title}>OUVRIR MON{"\n"}KIT</Text>
        <Text style={styles.subtitle}>
          Vos identifiants vous ont été remis par votre superviseur.
        </Text>
        <PhoneKitForm onSwitchMode={() => router.push("/facilitateur/email")} />
        <SpaceSelector currentSpace="facilitateur" />
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

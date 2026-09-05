import LogoHeader from "@/components/common/LogoHeader";
import SpaceSelector from "@/components/common/SpaceSelector";
import SupervisorForm from "@/components/login/SupervisorForm";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/services/client";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function SuperviseurLoginScreen() {
  const router = useRouter();
  const { loginSuperviseur } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (email: string, motDePasse: string) => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await loginSuperviseur({ email, motDePasse });
      router.replace("/superviseur/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Impossible de se connecter."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <LogoHeader title="Mvoé" subtitle="ESPACE SUPERVISEUR" />
        <Text style={styles.title}>OUVRIR MA{"\n"}SESSION</Text>
        <Text style={styles.subtitle}>
          Réservé aux comptes de délégation et au niveau national.
        </Text>
        <SupervisorForm
          onSubmit={handleSubmit}
          loading={loading}
          errorMessage={errorMessage}
        />
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

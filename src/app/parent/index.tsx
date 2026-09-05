import LogoHeader from "@/components/common/LogoHeader";
import SpaceSelector from "@/components/common/SpaceSelector";
import PrimaryButton from "@/components/common/PrimaryButton";
import SecondaryButton from "@/components/common/SecondaryButton";
import InputField from "@/components/common/InputField";
import LanguageSelector from "@/components/login/LanguageSelector";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/services/client";
import { creerSessionParentAnonyme } from "@/services/session";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type Etape = "langue" | "acces" | "code" | "refus_mineur";

export default function ParentScreen() {
  const router = useRouter();
  const { loginParent, setParentSession } = useAuth();
  const [etape, setEtape] = useState<Etape>("langue");
  const [langue, setLangue] = useState<string | null>(null);
  const [codeParent, setCodeParent] = useState("");
  const [codeAcces, setCodeAcces] = useState("");
  const [majeur, setMajeur] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConsulter = async () => {
    await setParentSession(creerSessionParentAnonyme(langue ?? "fr"));
    router.replace("/parent/accueil");
  };

  const handleOuvrirSession = async () => {
    if (majeur === null) {
      setErrorMessage("Merci de préciser si vous êtes majeur ou mineur.");
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    try {
      await loginParent({
        codeParent,
        codeAcces,
        majeur,
        langue: langue ?? "fr",
      });
      router.replace("/parent/accueil");
    } catch (error) {
      if (error instanceof ApiError && error.message === "mineur") {
        setEtape("refus_mineur");
      } else {
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Impossible d'ouvrir la session."
        );
      }
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
        <LogoHeader title="Mvoé" subtitle="ESPACE PARENT" />

        {etape === "langue" && (
          <>
            <Text style={styles.title}>VOTRE LANGUE</Text>
            <Text style={styles.subtitle}>
              Choisissez, ou appuyez sur le haut-parleur pour écouter.
            </Text>
            <LanguageSelector onSelect={setLangue} />
            <View style={styles.spacer} />
            <PrimaryButton
              title="CONTINUER"
              onPress={() => setEtape("acces")}
              disabled={!langue}
            />
            <SpaceSelector currentSpace="parent" />
          </>
        )}

        {etape === "acces" && (
          <>
            <Text style={styles.title}>BIENVENUE</Text>
            <Text style={styles.subtitle}>
              Vous pouvez consulter les contenus sans compte, ou ouvrir votre
              session si vous avez un code.
            </Text>
            <PrimaryButton
              title="CONSULTER LES CONTENUS"
              onPress={handleConsulter}
            />
            <SecondaryButton
              title="Ouvrir ma session"
              onPress={() => setEtape("code")}
            />
            <SecondaryButton title="← Changer de langue" onPress={() => setEtape("langue")} />
          </>
        )}

        {etape === "code" && (
          <>
            <Text style={styles.title}>OUVRIR MA{"\n"}SESSION</Text>
            <Text style={styles.subtitle}>
              Le code vous a été remis par votre facilitateur.
            </Text>
            <InputField
              label="Code parent"
              placeholder="EB2-01"
              icon="key-outline"
              value={codeParent}
              onChangeText={setCodeParent}
            />
            <InputField
              label="Code d'accès"
              placeholder="••••"
              icon="lock-closed-outline"
              secureTextEntry
              keyboardType="phone-pad"
              value={codeAcces}
              onChangeText={setCodeAcces}
            />

            <Text style={styles.ageLabel}>ÊTES-VOUS MAJEUR(E) ?</Text>
            <View style={styles.ageRow}>
              <SecondaryButton
                title="Majeur(e)"
                variant={majeur === true ? "filled" : "outline"}
                onPress={() => setMajeur(true)}
              />
              <SecondaryButton
                title="Mineur(e)"
                variant={majeur === false ? "filled" : "outline"}
                onPress={() => setMajeur(false)}
              />
            </View>

            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}

            <View style={styles.spacer} />
            <PrimaryButton
              title={loading ? "CONNEXION…" : "OUVRIR MA SESSION"}
              onPress={handleOuvrirSession}
              disabled={loading}
            />
            <SecondaryButton title="← Retour" onPress={() => setEtape("acces")} />
          </>
        )}

        {etape === "refus_mineur" && (
          <>
            <Text style={styles.title}>UN INSTANT</Text>
            <Text style={styles.subtitle}>
              L&apos;espace parent avec compte est réservé aux personnes
              majeures. Vous pouvez tout de même trouver un facilitateur près
              de chez vous.
            </Text>
            <PrimaryButton
              title="TROUVER UN FACILITATEUR"
              onPress={() => router.push("/parent/facilitateur")}
            />
            <SecondaryButton title="← Retour" onPress={() => setEtape("acces")} />
          </>
        )}
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
  spacer: {
    height: 8,
  },
  ageLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 10,
  },
  ageRow: {
    flexDirection: "row",
    gap: 10,
  },
  error: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: 8,
  },
});

import InputField from "@/components/common/InputField";
import PrimaryButton from "@/components/common/PrimaryButton";
import SecondaryButton from "@/components/common/SecondaryButton";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  onSwitchMode: () => void;
  onSubmit: (email: string, motDePasse: string) => void;
  loading?: boolean;
  errorMessage?: string | null;
  emailPlaceholder?: string;
  buttonTitle?: string;
}

export default function EmailPasswordForm({
  onSwitchMode,
  onSubmit,
  loading = false,
  errorMessage,
  emailPlaceholder = "prenom.nom@minproff.cm",
  buttonTitle = "OUVRIR MON KIT",
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <InputField
        label="Adresse e-mail"
        placeholder={emailPlaceholder}
        icon="mail-outline"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <InputField
        label="Mot de passe"
        placeholder="••••••••"
        icon="lock-closed-outline"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      <View style={styles.spacer} />
      <PrimaryButton
        title={loading ? "CONNEXION…" : buttonTitle}
        onPress={() => onSubmit(email, password)}
        disabled={loading}
      />
      <SecondaryButton
        title="Utiliser mon numéro et mon code d'appareil"
        onPress={onSwitchMode}
        variant="filled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  spacer: {
    height: 8,
  },
  error: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: -4,
    marginBottom: 8,
  },
});

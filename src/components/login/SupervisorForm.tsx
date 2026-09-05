import InputField from "@/components/common/InputField";
import PrimaryButton from "@/components/common/PrimaryButton";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  onSubmit: (email: string, motDePasse: string) => void;
  loading?: boolean;
  errorMessage?: string | null;
}

export default function SupervisorForm({ onSubmit, loading = false, errorMessage }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <InputField
        label="Adresse e-mail"
        placeholder="minproff@mvoe.test"
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
        title={loading ? "CONNEXION…" : "OUVRIR LA SESSION"}
        onPress={() => onSubmit(email, password)}
        disabled={loading}
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

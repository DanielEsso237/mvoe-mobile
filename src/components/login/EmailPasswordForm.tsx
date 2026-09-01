import InputField from "@/components/common/InputField";
import PrimaryButton from "@/components/common/PrimaryButton";
import SecondaryButton from "@/components/common/SecondaryButton";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

interface Props {
  onSwitchMode: () => void;
  emailPlaceholder?: string;
  buttonTitle?: string;
}

export default function EmailPasswordForm({
  onSwitchMode,
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
      <View style={styles.spacer} />
      <PrimaryButton title={buttonTitle} onPress={() => {}} />
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
});

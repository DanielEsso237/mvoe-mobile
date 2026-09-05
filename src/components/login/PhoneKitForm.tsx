import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import InputField from '@/components/common/InputField';
import PrimaryButton from '@/components/common/PrimaryButton';
import SecondaryButton from '@/components/common/SecondaryButton';

interface Props {
  onSwitchMode: () => void;
  onSubmit: (telephone: string, codeAppareil: string) => void;
  loading?: boolean;
  errorMessage?: string | null;
}

export default function PhoneKitForm({ onSwitchMode, onSubmit, loading = false, errorMessage }: Props) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  return (
    <View style={styles.container}>
      <InputField
        label="Numéro de téléphone"
        placeholder="699 00 00 00"
        icon="call-outline"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <InputField
        label="Code d'appareil"
        placeholder="••••••"
        icon="lock-closed-outline"
        secureTextEntry
        value={code}
        onChangeText={setCode}
      />
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      <View style={styles.spacer} />
      <PrimaryButton
        title={loading ? 'CONNEXION…' : 'OUVRIR MON KIT'}
        onPress={() => onSubmit(phone, code)}
        disabled={loading}
      />
      <SecondaryButton
        title="Utiliser mon e-mail et mon mot de passe"
        onPress={onSwitchMode}
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
    color: '#DC2626',
    fontSize: 13,
    marginTop: -4,
    marginBottom: 8,
  },
});

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import InputField from '@/components/common/InputField';
import PrimaryButton from '@/components/common/PrimaryButton';

export default function SupervisorForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      <View style={styles.spacer} />
      <PrimaryButton title="OUVRIR LA SESSION" onPress={() => {}} />
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
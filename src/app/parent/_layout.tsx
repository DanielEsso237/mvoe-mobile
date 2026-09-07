import React from 'react';
import { Stack } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';

// Voir facilitateur/_layout.tsx pour l'explication complète. Le parent n'a
// pas de sous-dossier de groupe comme « (kit) »/« (app) » : chaque écran
// protégé est donc listé individuellement ici.
export default function ParentLayout() {
  const { parent } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Protected guard={!parent}>
        <Stack.Screen name="index" />
      </Stack.Protected>
      <Stack.Protected guard={!!parent}>
        <Stack.Screen name="accueil" />
        <Stack.Screen name="ecouter" />
        <Stack.Screen name="feuilleton" />
        <Stack.Screen name="question" />
        <Stack.Screen name="questions" />
        <Stack.Screen name="facilitateur" />
      </Stack.Protected>
    </Stack>
  );
}
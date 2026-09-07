import React from 'react';
import { Stack } from 'expo-router';

export default function ParentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        // Voir facilitateur/_layout.tsx pour l'explication.
        animation: 'none',
      }}
    />
  );
}
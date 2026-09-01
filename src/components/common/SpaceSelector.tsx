import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import SpaceCard from '@/components/common/SpaceCard';
import { SPACES } from '@/constants/spaces';
import { Colors } from '@/constants/colors';

interface Props {
  currentSpace: 'facilitateur' | 'superviseur' | 'parent';
}

export default function SpaceSelector({ currentSpace }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.title}>LES TROIS ESPACES</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.cards}>
        {SPACES.map((space) => (
          <SpaceCard
            key={space.id}
            letter={space.letter}
            label={space.label}
            subtitle={space.subtitle}
            isActive={currentSpace === space.id}
            onPress={() => {
              if (currentSpace !== space.id) {
                router.replace(space.route as any);
              }
            }}
          />
        ))}
      </View>

      <Text style={styles.footer}>
        Chaque espace a ses propres identifiants.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  cards: {
    gap: 0,
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 8,
  },
});
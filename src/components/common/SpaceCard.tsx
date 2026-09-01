import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { UserSpace } from '@/types';

interface Props {
  letter: string;
  label: string;
  subtitle: string;
  isActive: boolean;
  onPress: () => void;
}

export default function SpaceCard({ letter, label, subtitle, isActive, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, isActive && styles.activeCard]}
    >
      <View style={[styles.letterBox, isActive && styles.activeLetterBox]}>
        <Text style={[styles.letter, isActive && styles.activeLetter]}>{letter}</Text>
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.label}>
          {label}{' '}
          {isActive && <Text style={styles.hereText}>VOUS ÊTES ICI</Text>}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons
        name="arrow-forward"
        size={20}
        color={isActive ? Colors.primary : Colors.textMuted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  activeCard: {
    backgroundColor: Colors.activeBg,
    borderColor: Colors.activeBorder,
    borderWidth: 1.5,
  },
  letterBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeLetterBox: {
    backgroundColor: Colors.primary,
  },
  letter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  activeLetter: {
    color: Colors.white,
  },
  textColumn: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  hereText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});
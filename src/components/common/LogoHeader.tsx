import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface Props {
  title: string;
  subtitle: string;
  showOnline?: boolean;
}

export default function LogoHeader({ title, subtitle, showOnline = false }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>☰</Text>
        </View>
        <View style={styles.textColumn}>
          <Text style={styles.brand}>Mvoé</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {showOnline && (
          <View style={styles.onlineBadge}>
            <View style={styles.dot} />
            <Text style={styles.onlineText}>EN LIGNE</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  textColumn: {
    flex: 1,
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
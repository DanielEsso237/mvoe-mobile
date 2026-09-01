import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'outline' | 'filled';
}

export default function SecondaryButton({ title, onPress, variant = 'outline' }: Props) {
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.button,
        isOutline ? styles.outline : styles.filled,
      ]}
    >
      <Text
        style={[
          styles.text,
          isOutline ? styles.textPrimary : styles.textWhite,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  filled: {
    backgroundColor: Colors.primary,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  textPrimary: {
    color: Colors.primary,
  },
  textWhite: {
    color: Colors.white,
  },
});
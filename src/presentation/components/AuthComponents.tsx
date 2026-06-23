import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { AppTheme } from '@presentation/theme';

// ── AuthField ─────────────────────────────────────────────────────────────────

interface AuthFieldProps extends TextInputProps {
  label: string;
  theme: AppTheme;
}

export const AuthField: React.FC<AuthFieldProps> = ({ label, theme, ...inputProps }) => {
  const s = fieldStyles(theme);
  return (
    <View style={s.wrapper}>
      <Text style={s.label}>{label}</Text>
      <TextInput style={s.input} placeholderTextColor={theme.textMuted} {...inputProps} />
    </View>
  );
};

const fieldStyles = (theme: AppTheme): ReturnType<typeof StyleSheet.create> =>
  StyleSheet.create({
    wrapper: { gap: 6 },
    label: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: theme.textSecondary,
    },
    input: {
      height: 52,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 16,
      fontSize: 16,
      color: theme.textPrimary,
    },
  });

// ── PrimaryButton ─────────────────────────────────────────────────────────────

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  theme: AppTheme;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  theme,
}) => {
  const s = buttonStyles(theme);
  const isDisabled = disabled || isLoading;
  return (
    <Pressable
      style={({ pressed }) => [
        s.button,
        isDisabled && s.buttonDisabled,
        pressed && s.buttonPressed,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {isLoading ? <ActivityIndicator color={theme.accentLightText} /> : <Text style={s.label}>{label}</Text>}
    </Pressable>
  );
};

const buttonStyles = (theme: AppTheme): ReturnType<typeof StyleSheet.create> =>
  StyleSheet.create({
    button: {
      height: 54,
      backgroundColor: theme.accentLight,
      borderWidth: 1.5,
      borderColor: theme.accent,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: theme.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 4,
    },
    buttonDisabled: {
      opacity: 0.45,
    },
    buttonPressed: {
      opacity: 0.82,
      transform: [{ scale: 0.97 }],
    },
    label: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.accentLightText,
      letterSpacing: 0.5,
    },
  });

// ── GhostButton (for navigation links between auth screens) ───────────────────

interface GhostButtonProps {
  label: string;
  onPress: () => void;
  theme: AppTheme;
}

export const GhostButton: React.FC<GhostButtonProps> = ({ label, onPress, theme }) => {
  const s = ghostStyles(theme);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.button, pressed && s.pressed]}>
      <Text style={s.label}>{label}</Text>
    </Pressable>
  );
};

const ghostStyles = (theme: AppTheme): ReturnType<typeof StyleSheet.create> =>
  StyleSheet.create({
    button: {
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 8,
    },
    pressed: { opacity: 0.6 },
    label: {
      fontSize: 14,
      color: theme.accentLightText,
      fontWeight: '600',
    },
  });

// ── AuthError ─────────────────────────────────────────────────────────────────

interface AuthErrorProps {
  message: string | null;
  theme: AppTheme;
}

export const AuthError: React.FC<AuthErrorProps> = ({ message, theme }) => {
  if (!message) return null;
  return <Text style={{ fontSize: 13, color: theme.danger, marginTop: 2 }}>{message}</Text>;
};

// ── AuthWordmark ──────────────────────────────────────────────────────────────

interface AuthWordmarkProps {
  theme: AppTheme;
  subtitle: string;
}

export const AuthWordmark: React.FC<AuthWordmarkProps> = ({ theme, subtitle }) => {
  const s = wordmarkStyles(theme);
  return (
    <View style={s.wrapper}>
      <Text style={s.wordmark}>KISS GYM</Text>
      <Text style={s.subtitle}>{subtitle}</Text>
    </View>
  );
};

const wordmarkStyles = (theme: AppTheme): ReturnType<typeof StyleSheet.create> =>
  StyleSheet.create({
    wrapper: { gap: 6 },
    wordmark: {
      fontSize: 42,
      fontWeight: '800',
      letterSpacing: 6,
      color: theme.accent,
    },
    subtitle: {
      fontSize: 13,
      letterSpacing: 2,
      color: theme.textSecondary,
      textTransform: 'uppercase',
    },
  });

import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';
import { useAuth } from '@presentation/context/AuthContext';
import { AppTheme, useTheme } from '@presentation/theme';
import {
  AuthError,
  AuthField,
  AuthWordmark,
  GhostButton,
  PrimaryButton,
} from '@presentation/components/AuthComponents';
import { RegisterScreenProps } from '@presentation/navigation/types';

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { register, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const nameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const s = styles(theme);

  // Pre-fill name from email prefix when user moves away from email field
  const handleEmailBlur = (): void => {
    if (!name.trim() && email.trim()) {
      const prefix = email.split('@')[0] ?? '';
      if (prefix) setName(prefix);
    }
  };

  // Name is optional — only email + password required
  const canSubmit = email.trim().length > 0 && password.length >= 6 && !isLoading;

  const handleRegister = async (): Promise<void> => {
    if (!canSubmit) return;
    try {
      await register(email.trim(), name.trim(), password);
    } catch {
      // error state is in AuthContext — displayed by AuthError below
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.inner}>
        <AuthWordmark theme={theme} subtitle="create your account" />

        <View style={s.form}>
          <AuthField
            label="Email"
            theme={theme}
            value={email}
            onChangeText={setEmail}
            onBlur={handleEmailBlur}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => nameRef.current?.focus()}
            editable={!isLoading}
          />

          <AuthField
            label="Name (optional)"
            theme={theme}
            value={name}
            onChangeText={setName}
            placeholder="Your display name"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!isLoading}
            // @ts-expect-error — ref forwarding via TextInputProps
            ref={nameRef}
          />

          <AuthField
            label="Password"
            theme={theme}
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 6 characters"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={handleRegister}
            editable={!isLoading}
            // @ts-expect-error — ref forwarding via TextInputProps
            ref={passwordRef}
          />

          <AuthError message={error} theme={theme} />

          <PrimaryButton
            label="Create account"
            onPress={handleRegister}
            isLoading={isLoading}
            disabled={!canSubmit}
            theme={theme}
          />
        </View>

        <GhostButton
          label="Already have an account? Log in"
          onPress={() => navigation.goBack()}
          theme={theme}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = (theme: AppTheme): ReturnType<typeof StyleSheet.create> =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    inner: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', gap: 32 },
    form: { gap: 12 },
  });

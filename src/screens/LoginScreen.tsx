import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { login } from '../api/client';
import { Icon } from '../components/Icon';
import { Card, FormField, PrimaryButton } from '../components/ui';
import { styles } from '../styles/styles';
import { colors } from '../styles/theme';
import { getErrorMessage } from '../utils/errors';

export function LoginScreen({
  onAuthenticated,
}: {
  onAuthenticated: (token: string) => Promise<void>;
}) {
  const [email, setEmail] = useState('dev@fluxtrackr.local');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setIsLoading(true);

    try {
      const response = await login(email.trim(), password);
      await onAuthenticated(response.accessToken);
    } catch (error) {
      Alert.alert('Erro no login', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.appContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.form}
      >
        <ScrollView
          contentContainerStyle={styles.keyboardContent}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.loginCard}>
            <View style={styles.loginLogo}>
              <Icon color={colors.primary} name="pulse" size={42} />
            </View>

            <View>
              <Text style={[styles.title, styles.centerText]}>FluxTrackr</Text>
              <Text style={[styles.sectionSubtitle, styles.centerText]}>
                Controle seu fluxo financeiro com clareza.
              </Text>
            </View>

            <View style={{ gap: 16 }}>
              <FormField
                autoCapitalize="none"
                autoCorrect={false}
                icon="mail-outline"
                keyboardType="email-address"
                label="E-mail"
                onChangeText={setEmail}
                placeholder="nome@empresa.com"
                value={email}
              />
              <FormField
                icon="lock-closed-outline"
                label="Senha"
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                value={password}
              />
            </View>

            <PrimaryButton
              icon="log-in-outline"
              isLoading={isLoading}
              label="Entrar"
              onPress={handleLogin}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

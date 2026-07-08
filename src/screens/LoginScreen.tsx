import { useState } from 'react';
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
} from 'react-native';

import { login } from '../api/client';
import { styles } from '../styles/styles';
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
      const response = await login(email, password);
      await onAuthenticated(response.accessToken);
    } catch (error) {
      Alert.alert('Erro no login', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.form}
      >
        <Text style={styles.title}>FluxTrackr</Text>
        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          style={styles.input}
          value={email}
        />
        <Text style={styles.label}>Senha</Text>
        <TextInput
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        <Button
          disabled={isLoading}
          onPress={handleLogin}
          title={isLoading ? 'Entrando...' : 'Entrar'}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

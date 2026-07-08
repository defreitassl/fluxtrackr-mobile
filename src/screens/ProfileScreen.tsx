import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { getHealth } from '../api/client';
import { Icon } from '../components/Icon';
import { AppText, Card, IconButton, PrimaryButton } from '../components/ui';
import { styles } from '../styles/styles';
import { colors } from '../styles/theme';
import { getErrorMessage } from '../utils/errors';

export function ProfileScreen({
  onLogout,
  userEmail,
}: {
  onLogout: () => Promise<void>;
  token: string;
  userEmail?: string;
}) {
  const [apiStatus, setApiStatus] = useState<'checking' | 'offline' | 'online'>(
    'checking',
  );

  async function checkApiStatus() {
    setApiStatus('checking');

    try {
      const health = await getHealth();
      setApiStatus(health.status === 'ok' ? 'online' : 'offline');
    } catch {
      setApiStatus('offline');
    }
  }

  useEffect(() => {
    checkApiStatus();
  }, []);

  async function handleLogout() {
    try {
      await onLogout();
    } catch (error) {
      Alert.alert('Erro ao sair', getErrorMessage(error));
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <View style={[styles.avatar, styles.avatarLarge]}>
            <Icon color={colors.muted} name="person-outline" size={44} />
          </View>
          <AppText size="title" weight="bold">
            FluxTrackr User
          </AppText>
          <AppText muted numberOfLines={1}>
            {userEmail ?? 'dev@fluxtrackr.local'}
          </AppText>
          <Pressable onPress={checkApiStatus} style={styles.chip}>
            <View
              style={{
                backgroundColor:
                  apiStatus === 'online'
                    ? colors.primary
                    : apiStatus === 'checking'
                      ? colors.warning
                      : colors.danger,
                borderRadius: 99,
                height: 8,
                width: 8,
              }}
            />
            <Text style={styles.chipText}>
              API{' '}
              {apiStatus === 'online'
                ? 'Online'
                : apiStatus === 'checking'
                  ? 'Verificando'
                  : 'Offline'}
            </Text>
          </Pressable>
        </View>

        <Card style={{ gap: 18 }}>
          <View style={styles.row}>
            <View style={styles.transactionIcon}>
              <Icon color={colors.tertiary} name="paper-plane-outline" />
            </View>
            <View style={styles.listText}>
              <AppText size="title" weight="bold">
                Registro rápido via Telegram
              </AppText>
              <AppText muted>
                Envie gastos diretamente pelo bot privado para reduzir atrito no
                cadastro diário.
              </AppText>
            </View>
          </View>

          <View style={[styles.inputShell, { justifyContent: 'space-between' }]}>
            <AppText mono muted numberOfLines={1} size="caption">
              @FluxTrackr_Bot
            </AppText>
            <Pressable
              onPress={() =>
                Alert.alert(
                  'Telegram',
                  'Abra o bot no Telegram e envie /start com o usuário autorizado.',
                )
              }
            >
              <AppText mono size="caption" style={styles.valuePrimary}>
                Abrir
              </AppText>
            </Pressable>
          </View>

          <PrimaryButton
            icon="link-outline"
            label="Conectar Telegram"
            onPress={() =>
              Alert.alert(
                'Telegram privado',
                'A conexão é feita pelo TELEGRAM_USER_ID configurado no bot.',
              )
            }
          />
        </Card>

        <Card style={{ gap: 6 }}>
          <AppText mono muted size="caption">
            CONFIGURAÇÕES GERAIS
          </AppText>
          <SettingsRow icon="moon-outline" label="Aparência" value="Escuro" />
          <SettingsRow icon="language-outline" label="Idioma" value="Português" />
          <SettingsRow icon="shield-checkmark-outline" label="Segurança" />
        </Card>

        <Card style={{ alignItems: 'center', gap: 12 }}>
          <Icon color={colors.danger} name="log-out-outline" size={42} />
          <AppText size="title" weight="bold">
            Encerrar Sessão
          </AppText>
          <AppText muted style={styles.centerText}>
            Você será desconectado deste dispositivo.
          </AppText>
          <PrimaryButton
            icon="log-out-outline"
            label="Sair da Conta"
            onPress={handleLogout}
            tone="danger"
          />
        </Card>
      </ScrollView>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  value,
}: {
  icon: 'language-outline' | 'moon-outline' | 'shield-checkmark-outline';
  label: string;
  value?: string;
}) {
  return (
    <View style={[styles.listItem, { backgroundColor: colors.transparent, borderWidth: 0 }]}>
      <View style={[styles.row, { flex: 1 }]}>
        <Icon color={colors.muted} name={icon} />
        <AppText numberOfLines={1}>{label}</AppText>
      </View>
      {value ? (
        <AppText mono muted numberOfLines={1} size="caption">
          {value}
        </AppText>
      ) : (
        <IconButton color={colors.muted} name="chevron-forward" onPress={() => undefined} />
      )}
    </View>
  );
}

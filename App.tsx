import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';

import { AppHeader } from './src/components/AppHeader';
import { BottomNavigation } from './src/components/BottomNavigation';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { PlanningScreen } from './src/screens/PlanningScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { NotificationCenterScreen } from './src/screens/NotificationCenterScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import {
  clearStoredToken,
  getStoredToken,
  storeToken,
} from './src/storage/tokenStorage';
import { styles } from './src/styles/styles';
import { colors } from './src/styles/theme';
import { Screen } from './src/types/navigation';
import { decodeAccessToken } from './src/utils/jwt';
import { getUnreadNotificationCount, setUnauthorizedHandler } from './src/api/client';

type OverlayScreen = 'notification-center' | null;

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_500Medium,
  });
  const [token, setToken] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [financialVersion, setFinancialVersion] = useState(0);
  const [overlay, setOverlay] = useState<OverlayScreen>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const userEmail = token ? decodeAccessToken(token)?.email : undefined;

  useEffect(() => {
    getStoredToken()
      .then(setToken)
      .finally(() => setIsBooting(false));
  }, []);

  async function refreshUnreadCount(activeToken = token) {
    if (!activeToken) return;
    try { setUnreadCount((await getUnreadNotificationCount(activeToken)).unreadCount); }
    catch { /* The requesting screen exposes API errors when relevant. */ }
  }

  useEffect(() => { if (token) refreshUnreadCount(token); }, [financialVersion, token]);
  useEffect(() => {
    setUnauthorizedHandler(() => { clearStoredToken().finally(() => { setOverlay(null); setToken(null); }); });
    return () => setUnauthorizedHandler(undefined);
  }, []);

  async function handleAuthenticated(accessToken: string) {
    await storeToken(accessToken);
    setToken(accessToken);
    setScreen('dashboard');
    setOverlay(null);
    await refreshUnreadCount(accessToken);
  }

  async function handleLogout() {
    await clearStoredToken();
    setToken(null);
    setOverlay(null);
  }

  function handleFinancialDataChanged() {
    setFinancialVersion((current) => current + 1);
  }

  if (isBooting || !fontsLoaded) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar backgroundColor={colors.background} barStyle="light-content" />
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!token) {
    return <LoginScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar backgroundColor={colors.background} barStyle="light-content" />
      {overlay ? <NotificationCenterScreen token={token} onClose={async () => { setOverlay(null); await refreshUnreadCount(); }} onUnreadChanged={refreshUnreadCount} /> : <>
      <AppHeader currentScreen={screen} userEmail={userEmail} unreadCount={unreadCount} onNotificationsPress={() => setOverlay('notification-center')} />

      {screen === 'dashboard' ? (
        <DashboardScreen
          onNavigate={setScreen}
          refreshKey={financialVersion}
          token={token}
        />
      ) : null}
      {screen === 'transactions' ? (
        <TransactionsScreen
          onChanged={handleFinancialDataChanged}
          token={token}
        />
      ) : null}
      {screen === 'categories' ? (
        <CategoriesScreen onChanged={handleFinancialDataChanged} token={token} />
      ) : null}
      {screen === 'planning' ? (
        <PlanningScreen
          onChanged={handleFinancialDataChanged}
          token={token}
        />
      ) : null}
      {screen === 'profile' ? (
        <ProfileScreen
          onLogout={handleLogout}
          token={token}
          userEmail={userEmail}
        />
      ) : null}
      <BottomNavigation currentScreen={screen} onChange={setScreen} />
      </>}
    </SafeAreaView>
  );
}

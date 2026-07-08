import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView } from 'react-native';

import { AppHeader } from './src/components/AppHeader';
import { ScreenTabs } from './src/components/ScreenTabs';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { FixedExpensesScreen } from './src/screens/FixedExpensesScreen';
import { FixedIncomesScreen } from './src/screens/FixedIncomesScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import {
  clearStoredToken,
  getStoredToken,
  storeToken,
} from './src/storage/tokenStorage';
import { styles } from './src/styles/styles';
import { Screen } from './src/types/navigation';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [financialVersion, setFinancialVersion] = useState(0);

  useEffect(() => {
    getStoredToken()
      .then(setToken)
      .finally(() => setIsBooting(false));
  }, []);

  async function handleAuthenticated(accessToken: string) {
    await storeToken(accessToken);
    setToken(accessToken);
    setScreen('dashboard');
  }

  async function handleLogout() {
    await clearStoredToken();
    setToken(null);
  }

  function handleFinancialDataChanged() {
    setFinancialVersion((current) => current + 1);
  }

  if (isBooting) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!token) {
    return <LoginScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader onLogout={handleLogout} />
      <ScreenTabs currentScreen={screen} onChange={setScreen} />

      {screen === 'dashboard' ? (
        <DashboardScreen refreshKey={financialVersion} token={token} />
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
      {screen === 'fixedExpenses' ? (
        <FixedExpensesScreen
          onChanged={handleFinancialDataChanged}
          token={token}
        />
      ) : null}
      {screen === 'fixedIncomes' ? (
        <FixedIncomesScreen onChanged={handleFinancialDataChanged} token={token} />
      ) : null}
    </SafeAreaView>
  );
}

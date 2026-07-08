import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Text, View } from 'react-native';

import { getMonthlySummary } from '../api/client';
import { Metric } from '../components/Metric';
import { styles } from '../styles/styles';
import { MonthlySummary } from '../types/api';
import { getErrorMessage } from '../utils/errors';

export function DashboardScreen({
  refreshKey,
  token,
}: {
  refreshKey: number;
  token: string;
}) {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadSummary() {
    setIsLoading(true);

    try {
      setSummary(await getMonthlySummary(token));
    } catch (error) {
      Alert.alert('Erro ao carregar resumo', getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, [refreshKey, token]);

  if (isLoading && !summary) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Resumo mensal</Text>
        <Button title="Atualizar" onPress={loadSummary} />
      </View>
      {summary ? (
        <View style={styles.card}>
          <Metric label="Saldo disponivel" value={summary.availableBalance} />
          <Metric label="Receitas fixas" value={summary.fixedIncomeTotal} />
          <Metric label="Gastos fixos" value={summary.fixedExpenseTotal} />
          <Metric
            label="Receitas do mes"
            value={summary.transactionIncomeTotal}
          />
          <Metric
            label="Gastos do mes"
            value={summary.transactionExpenseTotal}
          />
          <Metric
            label="Orcamento diario"
            value={summary.suggestedDailyBudget}
          />
          <Text style={styles.muted}>
            {summary.remainingDays} dias restantes em {summary.month}/
            {summary.year}
          </Text>
        </View>
      ) : (
        <Text style={styles.muted}>Nenhum resumo carregado.</Text>
      )}
    </View>
  );
}

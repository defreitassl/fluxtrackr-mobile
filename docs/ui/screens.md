# Telas

## Autenticação
Login com email e senha, carregamento, erro de credenciais e restauração de sessão. Sem navegação inferior.

## Dashboard
Prioridade: saldo total, valor comprometido, valor disponível, previsão de 30 dias, próxima fatura e próximos eventos. Header com perfil e notificações. FAB abre ações rápidas.

## Timeline
Fluxo cronológico unificado de transações, receitas, despesas, faturas e eventos planejados. Agrupar por data, permitir filtros e abrir detalhes ao pressionar um item.

## Planejamento
Visão de gastos fixos, ganhos fixos, orçamento e compromissos futuros. Usar abas ou segmented control somente para separar contextos claros. Exibir progresso e alertas de limite.

## Carteira
Contas, cartões, saldos e faturas. Mostrar saldo consolidado antes da lista de contas. FAB permite adicionar conta, cartão, receita ou despesa conforme contexto.

## Movimentações
Lista completa com busca, filtros, período e agrupamento por data. Deve reutilizar `TransactionRow` e manter estados loading, vazio, erro e paginação.

## Transação
Criação e edição de receita ou despesa. Campos: valor, descrição, categoria, data, conta, método de pagamento e observação. Confirmar descarte quando houver alterações.

## Conta, cartão e fatura
Detalhe com saldo/limite, fechamento, vencimento, movimentações vinculadas e ações de edição. Diferenciar claramente saldo disponível, limite usado e valor da fatura.

## Notificações e atividades
Listar eventos relevantes, permitir marcar como lido e navegar para o contexto de origem. Badge representa apenas itens não lidos.

## Perfil e configurações
Dados pessoais, tema claro/escuro/sistema, preferências, integração Telegram, status da API e logout. Ações destrutivas devem exigir confirmação.

## Estados obrigatórios
Todas as telas com dados remotos devem prever loading, vazio, erro recuperável e conteúdo. Formulários devem prever validação por campo, envio e falha de rede.

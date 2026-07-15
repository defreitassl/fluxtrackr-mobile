# Componentes

## Base

### AppText
Variantes: caption, body, large, title, section e display. Pesos regular, semibold e bold. Valores financeiros podem usar mono.

### Button
Variantes primary, secondary, ghost e danger. Estados default, pressed, disabled e loading. Ícone opcional. Altura mínima 52.

### IconButton
Área mínima 44x44. Suporta badge, estado pressed e rótulo de acessibilidade.

### Card
Variantes default, elevated, interactive e critical. Raio 16, padding 16. Pressable somente quando houver navegação ou ação clara.

### FormField
Label, input, helper, erro e ícone opcional. Estados default, focus, filled, disabled e error.

### Chip
Variantes filter e status. Estados default, selected e disabled. Não usar como botão principal.

### Toggle e SegmentedControl
Toggle para preferências binárias. SegmentedControl para até três visualizações mutuamente exclusivas.

## Navegação

### AppHeader
Avatar/perfil no canto esquerdo. Título ou contexto no centro. Notificações no canto direito com badge opcional.

### BottomNavigation
Exatamente quatro destinos: Dashboard, Timeline, Planejamento e Carteira. Exibir apenas ícones; usar accessibilityLabel. Estado ativo por cor e superfície, sem alterar tamanho.

### FAB
Exibir somente em Dashboard, Carteira e contextos financeiros compatíveis. Abre QuickActionSheet; não navega diretamente sem contexto.

### BottomSheet
Handle, título, conteúdo rolável e área de ações fixa quando necessário. Fecha por botão, gesto ou backdrop, sem perder dados sem confirmação.

## Financeiros

### MoneyValue
Formata BRL, sinal e privacidade. Variantes normal, income, expense e muted.

### TransactionRow
Ícone/categoria, descrição, conta, data, valor e status. Press abre detalhes; ações destrutivas não ficam expostas na linha.

### FinancialSummaryCard
Título, valor principal, comparação e informação auxiliar. Usado para saldo total, comprometido e disponível.

### ProgressBar
Valor entre 0 e 100, label acessível e estados normal, warning e danger.

### EmptyState
Ícone, título, descrição e uma ação opcional. Explica o próximo passo sem culpar o usuário.

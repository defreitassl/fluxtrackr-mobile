# Mapa de implementação

| Referência aprovada | Destino no app | Reuso principal | Situação atual |
|---|---|---|---|
| Dashboard v2 | `DashboardScreen` | Header, summary cards, event rows, FAB | Existe; requer novo layout e tema |
| Timeline v2 | nova `TimelineScreen` | TransactionRow, filtros, grupos por data | Ainda não existe |
| Planejamento v2 | `PlanningScreen` | SegmentedControl, cards, progress | Existe; requer reorganização |
| Carteira v1 | nova `WalletScreen` | account cards, invoice card, FAB | Parcialmente diluída em transações |
| Movimentações v2 | `TransactionsScreen` | busca, filtros, TransactionRow | Existe; requer refinamento visual |
| Transações v1 | modal/tela de formulário | FormField, Button, BottomSheet | Existe em modal; preservar regras |
| Conta/cartão/fatura v2 | novas telas de detalhe | summary, list rows, actions | Ainda não existe |
| Notificações v3 | nova `NotificationsScreen` | activity row, badge, filtros | Ainda não existe |
| Perfil v2 | `ProfileScreen` | sections, toggle, list items | Existe; requer expansão |
| Autenticação v3 | `LoginScreen` e boot | FormField, Button, feedback | Existe; requer novo visual |

## Mudanças estruturais

- Substituir a navegação atual de cinco itens por quatro destinos: Dashboard, Timeline, Planejamento e Carteira.
- Remover categorias e perfil da barra inferior; acessá-los por fluxos internos e pelo avatar.
- Remover labels visíveis da barra; manter labels de acessibilidade.
- Introduzir tema semântico claro/escuro/sistema antes de refatorar telas.
- Evoluir os componentes existentes em vez de duplicá-los.

## Compatibilidade

- Não alterar contratos da API nesta etapa.
- Preservar autenticação, armazenamento do JWT e operações CRUD existentes.
- Manter Expo SDK 54 e dependências atuais, salvo necessidade comprovada.
- Implementar em incrementos pequenos, com `npm run typecheck` ao final de cada etapa.

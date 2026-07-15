# Handoff para o Codex

## Objetivo

Aplicar a nova direção visual do FluxTrackr sem quebrar os fluxos funcionais existentes.

## Ordem de implementação

1. Criar tokens semânticos e suporte a tema claro, escuro e sistema.
2. Refatorar componentes base de `src/components/ui.tsx`.
3. Atualizar Header, BottomNavigation, FAB e BottomSheet.
4. Ajustar os tipos de navegação para quatro destinos principais.
5. Refatorar Login e Dashboard.
6. Implementar Timeline e Carteira.
7. Refatorar Planejamento e Movimentações.
8. Implementar detalhes, notificações e configurações.

## Regras

- Não reescrever regras de negócio sem necessidade.
- Não criar componentes específicos de tela quando houver padrão reutilizável.
- Não usar cores hex diretamente nas telas.
- Não adicionar biblioteca de UI nesta fase.
- Manter componentes e arquivos curtos e legíveis.
- Usar dados reais da API onde já existem; mocks apenas em áreas ainda sem contrato.

## Critérios de aceite

- `npm run typecheck` passa.
- Temas claro, escuro e sistema funcionam sem reiniciar o app.
- Barra inferior contém apenas quatro ícones com labels acessíveis.
- Perfil fica no canto superior esquerdo e notificações no direito.
- FAB aparece somente nos contextos documentados.
- Loading, vazio, erro e conteúdo existem nas telas remotas.
- Formulários preservam valores após erro de rede.
- Nenhuma funcionalidade existente de autenticação ou CRUD é removida.

## Estratégia de commits

Um commit por etapa funcional, por exemplo:

- `feat(ui): add semantic theme tokens`
- `refactor(ui): evolve shared components`
- `refactor(navigation): align primary destinations`
- `feat(timeline): add unified financial timeline`

# FluxTrackr UI

Esta pasta é a fonte de verdade para a evolução visual do app mobile.

## Ordem de prioridade

1. Regras de produto e navegação descritas aqui.
2. Protótipos aprovados no Stitch.
3. Contratos atuais da API e comportamento funcional existente.
4. Implementação visual legada em `src/styles` e `src/components`.

Quando houver conflito, preserve a regra de negócio existente e aplique a direção visual documentada aqui.

## Documentos

- [`design-system.md`](./design-system.md): tokens, temas e princípios visuais.
- [`components.md`](./components.md): contratos dos componentes reutilizáveis.
- [`screens.md`](./screens.md): estrutura, conteúdo e comportamento das telas.
- [`implementation-map.md`](./implementation-map.md): protótipo aprovado → tela React Native.
- [`codex-handoff.md`](./codex-handoff.md): sequência de trabalho e critérios de aceite.

## Uso pelo Codex

Antes de alterar uma tela, leia esta pasta, o componente atual e o contrato da API relacionado. Implemente um incremento por vez e execute `npm run typecheck` antes de concluir.

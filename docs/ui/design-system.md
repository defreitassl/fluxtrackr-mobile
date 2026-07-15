# Design System

## Direção

Minimalista, limpa, calma e premium. Verde é a cor de ação e confiança. O app deve suportar temas claro, escuro e sistema.

## Tipografia

- Corpo: Inter 400.
- Ênfase: Inter 600.
- Títulos: Inter 700.
- Valores, datas e rótulos técnicos: JetBrains Mono 500.
- Escala: caption 12/17, body 16/24, large 18/26, title 21/28, section 24/30, display 32/40.

## Espaçamento e forma

- Escala: 4, 8, 16, 24, 32 e 48.
- Raios: 8, 12, 16, 24 e pill.
- Alvos de toque: mínimo 44x44.
- Card padrão: raio 16, padding 16.
- Input: altura mínima 54, raio 12.
- Botão principal: altura mínima 52, raio 12.
- FAB: 56x56, raio 16.
- Bottom sheet: raio superior 24.

## Cores semânticas

Não consumir hex diretamente nas telas. Criar tokens por tema:

- `background`, `surface`, `surfaceElevated`, `surfaceMuted`.
- `border`, `borderMuted`.
- `text`, `textMuted`, `textInverse`.
- `primary`, `primaryPressed`, `primaryMuted`, `onPrimary`.
- `income`, `expense`, `warning`, `danger`, `telegram`.
- `overlay` e `shadow`.

A paleta azul-escura atual é legada. Preservar o verde existente como referência de marca, mas definir equivalentes claros e escuros com contraste acessível.

## Princípios

- Hierarquia por espaço, tipografia e superfície; evitar excesso de bordas.
- Valores financeiros devem ser facilmente escaneáveis.
- Verde não deve significar receita e ação ao mesmo tempo quando houver risco de ambiguidade; usar contexto, ícone e sinal.
- Sombras discretas no tema claro e reduzidas no escuro.
- Dados fictícios devem ser realistas e coerentes entre telas.

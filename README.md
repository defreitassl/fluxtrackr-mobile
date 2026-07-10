# Mobile

App mobile do FluxTrackr em Expo + React Native.

## Funcionalidades atuais

- Login usando `POST /auth/login`.
- Persistencia local do JWT com `expo-secure-store`.
- Dashboard mensal com saldo, orcamento diario, resumo financeiro e ultimas transacoes.
- CRUD de transacoes com filtros, busca, conta financeira, metodo de pagamento e formulario em modal.
- Criacao rapida de contas financeiras na tela de transacoes para testar `Nubank`, `Inter` e `Dinheiro`.
- CRUD de categorias.
- Planejamento de gastos fixos e ganhos fixos em uma tela com abas.
- Perfil com status da API, informacoes do bot Telegram e logout.
- Identidade visual dark inspirada nos arquivos de referencia em `FluxTrackrScreensStitch/`.

## Estrutura do codigo

O app segue uma estrutura simples por responsabilidade:

```text
App.tsx              Orquestracao de boot, sessao e tela ativa.
src/api/            Cliente HTTP da API.
src/components/     Componentes reutilizaveis entre telas.
src/constants/      Constantes de navegacao e configuracao local.
src/screens/        Telas funcionais do app.
src/storage/        Persistencia local do token.
src/styles/         Tokens visuais e estilos compartilhados.
src/types/          Tipos dos contratos e da navegacao.
src/utils/          Formatadores, validadores e helpers.
```

## Ambiente suportado no MVP

- Expo SDK: 54.
- Requisito minimo: iOS 15.1+ ou Android 7+.
- Suportado: Expo Go atualizado, Android Emulator ou iOS Simulator.
- Nao suportado agora: web.

Web nao e prioridade no MVP. O erro de web sobre `react-native-web/dist/exports/*` e esperado enquanto nao instalarmos e configurarmos suporte web. Neste MVP, nao rode pelo atalho web do Expo.

## Expo Go

Este app usa Expo SDK 54 para manter compatibilidade com Expo Go. Atualize o Expo Go no celular, suba o Metro com `npm run start` e leia o QR code pelo Expo Go.

Se aparecer `Project is incompatible with this version of Expo Go`, confira se o Metro foi reiniciado depois de instalar dependencias e se o app no celular e o Expo Go da loja, nao um development build antigo.

## Configurar API

Crie `.env`:

```bash
EXPO_PUBLIC_API_URL=http://192.168.3.65:3001
```

Use o IP da maquina que esta rodando a API na mesma rede do celular. Para Android Emulator, normalmente use:

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001
```

Para iOS Simulator ou teste local:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3001
```

## Rodar

Suba a API no repositorio `fluxtrackr-api`:

```bash
docker compose up -d postgres
npm run prisma:seed
PORT=3001 npm run start
```

Suba o app mobile em LAN:

```bash
npm run start
```

Para emulador/localhost:

```bash
npm run start:localhost
```

O usuario de desenvolvimento e:

- Email: `dev@fluxtrackr.local`
- Senha: `123456`

## Observacao sobre DevTools

Em alguns Linux, o Expo CLI pode exibir erro ao preparar o React Native DevTools por permissao do `chrome-sandbox`. Se o Metro continuar mostrando `Waiting on http://localhost:8081`, isso nao bloqueia o uso no Expo Go/emulador.

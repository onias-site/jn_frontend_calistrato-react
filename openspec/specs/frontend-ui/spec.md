# frontend-ui

## Purpose

Define como as telas do frontend Onias.Site (JobsNow) são construídas, para que qualquer pessoa ou agente que mexa no
código mantenha a mesma aparência e o mesmo comportamento: uma biblioteca de componentes (Mantine 7), o layout do
projeto em Tailwind (`styles/tailwind.css`) e uma camada única de requisições (`JnAjax`).

Esta spec consolida a limpeza de layout feita em novembro de 2026 na branch `layout-cleanup`, que removeu PrimeReact,
Bootstrap e jQuery.

## Requirements

### Requirement: Pilha de interface

O frontend SHALL usar Next.js 14 (App Router), React 18, Tailwind com as classes de layout do projeto e
Mantine 7 (`@mantine/core`, `@mantine/hooks`, `@mantine/notifications`) para componentes interativos. O frontend SHALL NOT
depender de PrimeReact, primeicons, primeflex, Bootstrap, react-bootstrap ou jQuery. O Mantine SHALL permanecer na
versão 7 enquanto o projeto estiver no React 18 (as versões 8 e 9 exigem React 19).

#### Scenario: Nova dependência de interface

- **WHEN** uma tela precisa de um componente que o Mantine ou o template já oferecem
- **THEN** o componente existente é usado e nenhuma biblioteca nova é adicionada

#### Scenario: Componente que o Mantine não tem

- **WHEN** nem o Mantine nem o template oferecem o componente
- **THEN** ele é construído em `presentation/components/source/` com as primitivas do Mantine (ex.: `SummaryMultiSelect`
  sobre `Combobox`), e não trazendo outra biblioteca

### Requirement: Divisão de responsabilidades entre Mantine e Tailwind

Campos de texto, senha, número, selects, multi-selects, etiquetas (`TagsInput`), checkboxes, modais, popovers, abas,
acordeões, tabelas paginadas e notificações SHALL ser componentes do Mantine. Painéis, grades, espaçamento, cores,
tipografia e botões SHALL usar as classes do Tailwind e as de layout do projeto (`panel`, `btn btn-primary`, `btn btn-outline-dark`,
`btn btn-danger`, `btn-success`, `text-primary`, `text-danger`, `text-white-dark`).

#### Scenario: Botão de ação

- **WHEN** uma tela precisa de um botão
- **THEN** usa `<button className="btn btn-primary">` (ou a variante adequada: `btn-outline-dark`, `btn-danger`, `btn-success`), e não o `Button` do Mantine,
  para que todos os botões do site tenham a mesma forma

#### Scenario: Ícone dentro de botão

- **WHEN** um botão leva ícone
- **THEN** o ícone é um componente de `presentation/icons/` com `className="h-4 w-4"` e o botão recebe `gap-2`

### Requirement: Componentes base compartilhados

As telas SHALL reutilizar os componentes de `presentation/components/source/`:

| Componente | Uso |
|---|---|
| `LabelComponent` | rótulo + botão de ajuda + campo + mensagem de erro do campo |
| `HelpButton` | o "?" que abre um modal com a explicação do campo ou da lista |
| `ConfirmModal` | pergunta de sim/não antes de uma ação (`danger` para ações destrutivas) |
| `Modal` | modal genérico, fecha por X, Esc e clique fora |
| `SummaryMultiSelect` | escolha múltipla com busca que resume as escolhas ("12 regiões selecionadas") |
| `Tabs` | assistente em abas com Voltar/Avançar, pendências e botão de concluir |
| `LoadingButton` | botão com ícone de carregamento enquanto a requisição dele roda |
| `notify` | notificação no canto da tela (`summary`, `detail`, `severity`) |
| `GridPagination` / `paginate` | paginação no navegador de um grid já carregado, 10 linhas por página, rodapé "1 a 10 de 37" com o `Pagination` do Mantine |

#### Scenario: Confirmação antes de excluir

- **WHEN** uma ação apaga, inativa ou desiste de algo
- **THEN** a tela abre um `ConfirmModal` com `danger`, `header`, `message`, `acceptLabel` ("Sim, excluir") e `rejectLabel`
  ("Não"), e só chama o backend no `accept`

### Requirement: Formulários

Cada campo SHALL ficar dentro de um `LabelComponent`, com o rótulo acima do campo (padrão `stacked`), o botão de ajuda ao
lado do rótulo e a mensagem de erro embaixo do campo. Os campos de uma linha SHALL ficar num contêiner com largura máxima
(`max-w-4xl`) para não se esticarem em telas largas. A validação SHALL produzir, para cada campo, a mensagem do erro
(`fieldErrors[campo] = 'mensagem'`), e não apenas `true`.

#### Scenario: Usuário tenta avançar com campo inválido

- **WHEN** o usuário clica em Avançar (ou Salvar) com um campo inválido
- **THEN** o campo fica com borda vermelha, a mensagem aparece embaixo dele e a tela não avança; nenhuma notificação
  repete a mesma mensagem

#### Scenario: Campo numérico dependente de checkbox

- **WHEN** um checkbox marcado significa "não se aplica" e desmarcado exige um número (`IntegerFieldComponent`)
- **THEN** o campo numérico aparece logo abaixo do checkbox, recuado na linha do texto, com largura curta (`max-w-xs`)

### Requirement: Assistente em abas

O componente `Tabs` SHALL mostrar os botões "Voltar" e "Avançar" (com setas retas, `IconChevron`) e, na última aba, o
botão de concluir com o rótulo recebido (`lastButtonLabel`). O botão Avançar SHALL permanecer habilitado; o clique executa
`onMoveOnFowardTabs` da aba, que devolve as pendências. Abas cujos campos mostram as próprias pendências SHALL declarar
`fieldsShowPendingRequirements: true`; as demais SHALL mostrar as pendências numa caixa vermelha acima dos botões, com o
título "Para continuar, resolva:".

#### Scenario: Aba com regras sem campo correspondente

- **WHEN** a aba Opções tem a pendência "Deve-se selecionar ao menos uma das regiões metropolitanas"
- **THEN** a pendência aparece na caixa acima dos botões, e não ao lado do botão Avançar

### Requirement: Modais

Modais SHALL usar o `Modal` do Mantine (ou o `Modal`/`ConfirmModal` de `source/`), com título em negrito, tamanho `md`
para formulários curtos (login) e `lg` para formulários maiores. Dentro de modais, os `LabelComponent` SHALL ter o rótulo
acima do campo. Listas de escolha dentro de modais SHALL usar `comboboxProps={{ withinPortal: false }}` para rolarem com o
modal.

#### Scenario: Modal de login

- **WHEN** o modal de login abre
- **THEN** o campo de e-mail é um `TextInput` do Mantine com ícone de pessoa, o rótulo fica acima, e nenhuma mensagem de
  erro aparece antes de o usuário digitar; a mensagem, quando existe, fica numa caixa (vermelha para erro, azul para
  orientação) entre o campo e o botão

### Requirement: Conteúdo auxiliar não empurra a tela

Informações complementares acionadas por botão (listas de referência, ajuda) SHALL abrir em `Popover` ou `Modal`, por cima
do conteúdo, e SHALL NOT expandir em linha empurrando o restante da tela para baixo.

#### Scenario: Grupos do Telegram

- **WHEN** o usuário clica em "De onde vieram essas vagas?"
- **THEN** a lista de grupos abre num `Popover` ancorado no botão e fecha ao clicar fora ou com Esc

### Requirement: Títulos e navegação

Cada página SHALL ter um título com o componente `PageTitle` (`presentation/layouts/page-title.tsx`) acima do painel de
conteúdo. Links SHALL levar a algum lugar: texto que não navega SHALL NOT ser estilizado como link. Os botões de abrir e
fechar o menu lateral SHALL funcionar no desktop e no celular.

#### Scenario: Página nova

- **WHEN** uma rota nova é criada em `app/(defaults)/`
- **THEN** o `page.tsx` renderiza `<PageTitle>Nome da tela</PageTitle>` seguido do componente da tela, e a tela é
  adicionada ao `sidebar.tsx` quando deve aparecer no menu

### Requirement: Gráficos

Gráficos SHALL usar o ApexCharts (`react-apexcharts`, já incluído pelo template), com `fontFamily` do tema
(`var(--font-nunito)`). Quando um gráfico de pizza tiver uma fatia agregada dominante ("Outras"), a tela SHALL oferecer a
visão em barras horizontais, com vagas e percentual na ponta de cada barra, via `SegmentedControl` no canto do painel.

### Requirement: Estilos globais

O arquivo `styles/tailwind.css` SHALL declarar as camadas `@layer tailwind-base, mantine;` e colocar apenas `@tailwind
base` dentro de `tailwind-base`. `@tailwind components` e `@tailwind utilities` SHALL ficar fora de qualquer `@layer`. O
`app/layout.tsx` SHALL importar `styles/tailwind.css` antes de `@mantine/core/styles.layer.css` e
`@mantine/notifications/styles.layer.css`. A fonte base do site é 15px (`text-[15px]` no `App.tsx`); rótulos SHALL NOT
usar fontes menores que `text-sm`.

#### Scenario: Regra do template que depende de especificidade

- **WHEN** o template usa uma regra como `.vertical.toggle-sidebar .horizontal-logo { display: flex }` para vencer uma
  utility (`lg:hidden`)
- **THEN** ela continua funcionando porque components e utilities estão fora de camada; movê-los para uma camada quebra
  o botão de reabrir o menu lateral

### Requirement: Camada de requisições

Todas as chamadas HTTP SHALL passar pelo `app/JnAjax.js`, que usa `fetch`. A interface pública SHALL ser mantida:
`doAnAjaxRequest(uri, callbacks, method, body, headers, ambiente)`, `doACachedRequest(...)` (resposta guardada em
memória), `doAPersistedRequest(uri, callbacks, ambiente, lifetime)` (guardada no `localStorage`). `callbacks` é um objeto
indexado pelo status HTTP (`callbacks[200]`, `callbacks[404]`...), mais `onUnexpectedHttpStatus`, `retryAfterAuthentication`
(refeita após o login), `setLoading`/`setNotLoading` (para o loading ficar num botão em vez da capa da página) e
`withoutSession: true` (sem cabeçalhos de sessão e sem `Content-Type`). O ambiente SHALL ser passado como
`'http://localhost:8081'` (currículos, vis) ou `'http://localhost:8082'` (login e chamados, js); o `JnAjax` troca pela URL
de produção pelas variáveis `NEXT_PUBLIC_VIS_API_URL` e `NEXT_PUBLIC_LOGIN_API_URL`. Falha de rede SHALL chegar ao
`complete` como status 0.

#### Scenario: Requisição que exige login

- **WHEN** a URI contém `{email}` e não há sessão
- **THEN** o `JnAjax` chama `callbacks[401]` sem ir ao backend, o que abre o modal de login; após autenticar, a requisição
  em `retryAfterAuthentication` é refeita

#### Scenario: Loading

- **WHEN** a tela não informa `setLoading`/`setNotLoading`
- **THEN** o `JnAjax` mostra a capa `#cover` (spinner em CSS, `app/loading.css`) durante a requisição

### Requirement: Mensagens ao usuário

Avisos, sucessos e erros SHALL ser mostrados por `PubSub.publish('showMessage', { summary, detail, severity })` (ou
`notify`), com `severity` em `success`, `info`, `warn` ou `error`. Erros de validação de campo SHALL aparecer embaixo do
campo, e não como notificação.

### Requirement: Commits

Mensagens de commit SHALL ter só o título, em português, sem corpo, sem lista e sem linhas de assinatura ou co-autoria.

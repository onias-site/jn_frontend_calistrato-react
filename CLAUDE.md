# Frontend Onias.Site (JobsNow)

Next.js 15 (App Router; desde 2026-11-10, os `params` das rotas dinâmicas chegam como Promise) com Tailwind e as classes de layout do projeto (`styles/tailwind.css`). Componentes interativos com **Mantine 7**. Requisições pelo
`app/JnAjax.js` (fetch nativo). A especificação completa do padrão de interface está em `openspec/specs/frontend-ui/spec.md`:
leia-a antes de criar ou alterar qualquer tela.

## Rodar local

```bash
npm run dev    # http://localhost:3000 (ou 3001 se a 3000 estiver ocupada)
npm test       # jest
```

As telas chamam as APIs em `http://localhost:8081` (currículos) e `http://localhost:8082` (login e chamados); sem elas no
ar, as telas que dependem de dados ficam vazias.

## Regras que não se quebram

- **Não reintroduzir** PrimeReact, primeicons, Bootstrap, react-bootstrap nem jQuery. Foram removidos em novembro de 2026.
- **Não usar Mantine 8 ou 9**: exigem React 19; o projeto está no React 18 com Next 15.
- Campos, selects, checkboxes, modais, abas, notificações e tabelas: **Mantine** (`@mantine/core`, `@mantine/notifications`).
- Layout, espaçamento, cores e botões: **Tailwind com as classes de layout do projeto** (`panel`, `btn btn-primary`, `btn-outline-dark`, `btn-danger`...).
- Ícones: os componentes de `presentation/icons/` (SVG). Nunca classes `pi pi-*`.
- Componentes base de `presentation/components/source/` antes de criar algo novo: `LabelComponent`, `HelpButton`,
  `ConfirmModal`, `Modal`, `SummaryMultiSelect`, `Tabs`, `LoadingButton`, `notify`, `GridPagination` (com `paginate`).
- Mensagens ao usuário: `PubSub.publish('showMessage', { summary, detail, severity })` ou `notify(...)`. Nunca `alert`.
- Requisições: sempre pelo `JnAjax` (`doAnAjaxRequest`, `doACachedRequest`, `doAPersistedRequest`), com callbacks por status
  HTTP. As telas passam `'http://localhost:8081'` ou `'http://localhost:8082'` como ambiente; o `JnAjax` troca pela URL de
  produção pelas variáveis `NEXT_PUBLIC_VIS_API_URL` e `NEXT_PUBLIC_LOGIN_API_URL`.
- CSS: só o preflight do Tailwind fica em `@layer` (`styles/tailwind.css`). Não mover components ou utilities para dentro
  de uma camada: o Tailwind emite as variantes responsivas fora dela e as regras do template param de funcionar.

## Commits

Título curto, em português, sem corpo e sem linhas de assinatura ou co-autoria.

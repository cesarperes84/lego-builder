# LEGO Builder

Projeto convertido para **React + Vite**, pronto para deploy na Vercel com Yarn.

## Rodar localmente

```bash
yarn install
yarn dev
```

## Build local

```bash
yarn build
yarn preview
```

## Vercel

Use estas configurações:

- Framework Preset: `Vite`
- Install Command: `yarn install`
- Build Command: `yarn build`
- Output Directory: `dist`

Importante: este pacote não usa Next.js. Não há `app/`, `pages/`, `.next` ou `next.config.js`.


## Correção Node/Vercel

Este pacote fixa o Vite em `6.3.5` e `@vitejs/plugin-react` em `4.3.4` para evitar erro de engine Node como:

`Expected version "^20.19.0 || >=22.12.0". Got "22.2.0"`

Depois de subir, na Vercel mantenha:

- Framework Preset: `Vite`
- Install Command: `yarn install`
- Build Command: `yarn build`
- Output Directory: `dist`

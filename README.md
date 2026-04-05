# Frontend - Gestão de Notas Fiscais

Aplicação React responsável pela autenticação visual, dashboard operacional e formulário de notas fiscais.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Recharts

## Estrutura principal

```text
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vercel.json
├── vite.config.ts
└── README.md
```

## Páginas

### Login

- login do usuário
- cadastro de usuário apenas na primeira tela
- alternância entre entrar e criar acesso inicial

### Dashboard

- tabela de notas destacada no topo
- resumo por cards
- filtros por período e status
- CTA visível para cadastrar nota
- gráfico simples com distribuição por status

### NotaForm

- cadastro de nova nota fiscal
- edição de nota existente

## Componentes principais

- `Navbar`
- `CardResumo`
- `TabelaNotas`
- `GraficoSimples`

## Variáveis de ambiente

Crie um arquivo `.env` com base em `.env.example`.

```env
VITE_API_URL="http://localhost:3333/api"
```

Em produção, o frontend publicado utiliza:

```env
VITE_API_URL="https://gestao-notas-backend.vercel.app/api"
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Rodando localmente

```bash
cd frontend
npm install
npm run dev
```

Aplicação local padrão:

- [http://localhost:5173](http://localhost:5173)

## Regras visuais

- `bg-red-100`: atrasado
- `bg-orange-100`: vence hoje ou amanhã
- `bg-yellow-100`: vence em até 3 dias
- `bg-green-100`: dentro do prazo

## Fluxo do usuário

1. Acessa a primeira tela.
2. Faz login ou cria o acesso inicial.
3. Entra no dashboard.
4. Visualiza as notas já no topo da página.
5. Usa o botão de destaque para cadastrar nova nota.

## Deploy

### Produção atual

- Frontend: [https://gestao-notas-frontend.vercel.app](https://gestao-notas-frontend.vercel.app)

### Configuração no Vercel

- Projeto: `gestao-notas-frontend`
- Variável obrigatória:
  - `VITE_API_URL`

### Observação para SPA

O arquivo [vercel.json](/C:/Users/p-h-m/Downloads/DEV2026/gestão-notas/frontend/vercel.json) possui rewrite para `index.html`, garantindo funcionamento das rotas do React no Vercel.

## Arquivos importantes

- Rotas principais: [src/App.tsx](/C:/Users/p-h-m/Downloads/DEV2026/gestão-notas/frontend/src/App.tsx)
- Tela inicial: [src/pages/Login.tsx](/C:/Users/p-h-m/Downloads/DEV2026/gestão-notas/frontend/src/pages/Login.tsx)
- Dashboard: [src/pages/Dashboard.tsx](/C:/Users/p-h-m/Downloads/DEV2026/gestão-notas/frontend/src/pages/Dashboard.tsx)
- Formulário de nota: [src/pages/NotaForm.tsx](/C:/Users/p-h-m/Downloads/DEV2026/gestão-notas/frontend/src/pages/NotaForm.tsx)
- Serviço HTTP: [src/services/api.ts](/C:/Users/p-h-m/Downloads/DEV2026/gestão-notas/frontend/src/services/api.ts)

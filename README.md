# Bootcamp Treinos API

API REST para o Bootcamp Treinos, construída com **Fastify**, **Prisma** e **Better Auth**. Oferece autenticação por e-mail/senha e estrutura de dados para planos de treino, dias da semana e exercícios.

---

## Visão geral do que foi feito até o momento

### 1. Stack e configuração base

- **Runtime:** Node.js 24.x (ES Modules)
- **Framework HTTP:** Fastify 5
- **Validação/serialização:** Zod + `fastify-type-provider-zod`
- **Documentação da API:** OpenAPI/Swagger + **Scalar** (API Reference em `/docs`)
- **CORS:** habilitado para `http://localhost:3000` com credenciais
- **Banco de dados:** PostgreSQL via Prisma (adapter `@prisma/adapter-pg`)

### 2. Autenticação (Better Auth)

- **Biblioteca:** Better Auth com plugin **openAPI**
- **Método:** e-mail e senha (`emailAndPassword.enabled: true`)
- **Persistência:** Prisma + adapter PostgreSQL
- **Rotas:** todas as requisições para `/api/auth/*` (GET e POST) são repassadas ao handler do Better Auth (login, registro, sessão, etc.)
- **Origem confiável:** `http://localhost:3000`

Arquivo principal: `src/lib/auth.ts`.

### 3. Modelo de dados (Prisma)

- **User:** id, name, email, emailVerified, image, createdAt, updatedAt; relações com WorkoutPlan, Session, Account.
- **WorkoutPlan:** nome, userId, isActive; relação com WorkoutDay.
- **WorkoutDay:** vinculado a um plano, weekDay (enum: MONDAY … SUNDAY), isRestDay; relação com WorkoutExercise.
- **WorkoutExercise:** name, order, exerciseId, sets, reps, restTimeInSeconds; vinculado a WorkoutDay.
- **Session / Account / Verification:** modelos usados pelo Better Auth (sessões, contas OAuth/senha, verificações).

*Observação:* ainda não há rotas da API (CRUD) para planos de treino, dias ou exercícios; apenas o schema e a autenticação estão implementados.

### 4. Rotas atuais

| Método | URL            | Descrição |
|--------|----------------|-----------|
| GET    | `/`            | Retorna o objeto Swagger (especificação OpenAPI) da API. |
| GET/POST | `/api/auth/*` | Proxy para o Better Auth (login, sign-up, sign-out, sessão, etc.). |

### 5. Documentação interativa

- **Scalar API Reference:** em desenvolvimento em `http://localhost:3000/docs`
- Dois “sources” configurados:
  - **Treinos API:** especificação em `/swagger.json` (ou `/swagger.json` conforme config).
  - **Better Auth:** schema OpenAPI gerado pelo plugin (URL configurada no Scalar).

### 6. Variáveis de ambiente

- **PORT** (opcional): porta do servidor (padrão: `3000`).
- **DATABASE_URL**: connection string PostgreSQL (ex.: `postgresql://user:password@localhost:5432/bootcamp-treinos`).

O projeto usa `dotenv` (via `prisma.config.ts` e dependências) para carregar `.env`. Não versionar `.env`; usar `.env.example` com chaves sem valores sensíveis.

---

## Como rodar o projeto

### Pré-requisitos

- Node.js 24.x
- PostgreSQL rodando e banco criado
- Arquivo `.env` na raiz com `PORT` e `DATABASE_URL`

### Comandos

```bash
# Instalar dependências
npm install

# Gerar cliente Prisma e rodar migrações (quando houver)
npx prisma generate
npx prisma migrate dev

# Desenvolvimento (watch)
npm run dev
```

O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT`).

---

## Estrutura de pastas (principais)

```
bootcamp-treinos-api/
├── prisma/
│   ├── schema.prisma    # Modelos e enums
│   └── migrations/      # Migrações do banco
├── src/
│   ├── index.ts         # Entrada Fastify, rotas, Swagger, CORS, proxy /api/auth/*
│   └── lib/
│       └── auth.ts      # Configuração Better Auth (Prisma, email/password, openAPI)
├── prisma.config.ts     # Config Prisma (schema, migrations, DATABASE_URL)
├── package.json
└── .env                 # PORT, DATABASE_URL (não versionar)
```

---

## Próximos passos sugeridos (roadmap)

1. **Rotas de domínio:** CRUD para `WorkoutPlan`, `WorkoutDay` e `WorkoutExercise` (protegidas por sessão Better Auth).
2. **Ajustes na raiz:** alinhar rota `GET /` ao schema (ex.: retornar `{ message: "Bootcamp Treinos API" }` ou manter só o Swagger em outro path).
3. **Documentação:** corrigir URL do Better Auth no Scalar se estiver incorreta (ex.: `/aoi/` → `/api/`) e garantir que `/swagger.json` esteja acessível.
4. **Testes:** substituir o script de test placeholder por testes (ex.: Vitest/Jest) para rotas e auth.
5. **Segurança:** revisar CORS e `trustedOrigins` para produção; não expor dados sensíveis no OpenAPI.

---

## Resumo técnico

- **Feito:** API Fastify com Zod, OpenAPI + Scalar, CORS, proxy completo do Better Auth em `/api/auth/*`, modelo Prisma para usuários, planos de treino, dias e exercícios, e documentação parcial.
- **Pendente:** rotas de negócio para treinos, testes automatizados e ajustes finos de documentação e produção.

Se quiser, posso detalhar algum trecho (por exemplo, apenas auth ou apenas Prisma) ou propor mudanças concretas nos arquivos.

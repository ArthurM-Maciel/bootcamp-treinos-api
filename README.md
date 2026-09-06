# Bootcamp Treinos API

API REST para o Bootcamp Treinos (FSC), construída com **Fastify**, **Prisma** e **Better Auth**. Autenticação por e-mail/senha, planos de treino personalizados, acompanhamento de sessões de treino e um personal trainer virtual via IA.

---

## Stack

- **Runtime:** Node.js 24.x (ES Modules), gerenciado com **pnpm**
- **Framework HTTP:** Fastify 5
- **Validação/serialização:** Zod 4 + `fastify-type-provider-zod`
- **Banco de dados:** PostgreSQL via Prisma 7 (adapter `@prisma/adapter-pg`)
- **Autenticação:** Better Auth (e-mail/senha, sessão via cookie)
- **IA:** Vercel AI SDK (v6) + OpenAI (`gpt-4o-mini`), com tool calling sobre os use cases do domínio
- **Documentação da API:** OpenAPI/Swagger + Scalar (`/docs`)

## Arquitetura

Camadas: **Routes → Use Cases → Prisma**.

- `src/routes/` — handlers Fastify. Validam request/response com schemas Zod, extraem a sessão autenticada e traduzem erros de domínio em status HTTP.
- `src/usecases/` — regras de negócio, uma classe por caso de uso.
- `src/schemas/` — schemas Zod compartilhados entre validação de rota e documentação OpenAPI.
- `src/errors/` — erros customizados (`NotFoundError`, `WorkoutPlanNotActiveError`, `SessionAlreadyStartedError`) lançados pelos use cases e mapeados nas rotas.
- `src/lib/db.ts` — client Prisma singleton, compartilhado entre Better Auth e os use cases.
- `src/lib/auth.ts` — configuração do Better Auth.

## Modelo de dados (Prisma)

- **User** — dados de conta (Better Auth) + dados de treino opcionais (`weightInGrams`, `heightInCentimeters`, `age`, `bodyFatPercentage`), usados pela IA.
- **WorkoutPlan** — pertence a um usuário; apenas um pode estar `isActive` por vez.
- **WorkoutDay** — dia da semana (`weekDay`) de um plano; pode ser dia de descanso (`isRest`).
- **WorkoutExercise** — exercício de um dia de treino (séries, repetições, descanso entre séries).
- **WorkoutSession** — registro de início/conclusão de um dia de treino (`startedAt`/`completedAt`), usado para calcular streak e estatísticas.
- **Session / Account / Verification** — modelos do Better Auth.

## Rotas

| Método   | URL                                                          | Descrição                                          | Protegida |
| -------- | ------------------------------------------------------------- | --------------------------------------------------- | :-------: |
| GET/POST | `/api/auth/*`                                                  | Proxy para o Better Auth (login, sign-up, sessão…)   |     -     |
| GET      | `/home/:date`                                                  | Dados da tela inicial (treino do dia, streak, semana)|     ✅     |
| GET      | `/me`                                                          | Dados de treino do usuário (`null` se não cadastrado)|     ✅     |
| PUT      | `/me`                                                          | Cria/atualiza dados de treino do usuário             |     ✅     |
| GET      | `/stats?from=&to=`                                             | Estatísticas de treino num período                   |     ✅     |
| GET      | `/workout-plans?active=`                                       | Lista os planos de treino do usuário                 |     ✅     |
| POST     | `/workout-plans`                                                | Cria um plano de treino (desativa o anterior)        |     ✅     |
| GET      | `/workout-plans/:workoutPlanId`                                 | Detalhe de um plano (dias + contagem de exercícios)  |     ✅     |
| GET      | `/workout-plans/:workoutPlanId/days/:workoutDayId`              | Detalhe de um dia (exercícios + sessões)              |     ✅     |
| POST     | `/workout-plans/:workoutPlanId/days/:workoutDayId/sessions`     | Inicia uma sessão de treino do dia                    |     ✅     |
| PATCH    | `/workout-plans/:workoutPlanId/days/:workoutDayId/sessions/:sessionId` | Conclui uma sessão de treino                | ✅     |
| POST     | `/ai`                                                           | Chat (streaming) com o personal trainer virtual       |     ✅     |

Documentação interativa completa em `http://localhost:8081/docs` (Scalar), especificação OpenAPI em `/swagger.json`.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável              | Descrição                                                   |
| --------------------- | ------------------------------------------------------------ |
| `PORT`                | Porta do servidor (padrão: `8081`)                            |
| `DATABASE_URL`        | Connection string do PostgreSQL                              |
| `BETTER_AUTH_SECRET`  | Segredo usado pelo Better Auth para assinar sessões           |
| `BETTER_AUTH_URL`     | URL pública da API (usada pelo Better Auth)                   |
| `OPENAI_API_KEY`      | Chave da OpenAI, necessária para a rota `POST /ai`             |

## Como rodar o projeto

### Pré-requisitos

- Node.js 24.x
- pnpm (`corepack enable` ou `npm i -g pnpm`)
- Docker (para o PostgreSQL local)

### Passo a passo

```bash
# Instalar dependências
pnpm install

# Subir o PostgreSQL local
docker compose up -d

# Copiar variáveis de ambiente e preencher os valores
cp .env.example .env

# Rodar migrações e gerar o client Prisma
pnpm exec prisma migrate dev

# Desenvolvimento (watch)
pnpm dev
```

O servidor sobe em `http://localhost:8081` (ou na porta definida em `PORT`).

### Outros comandos

```bash
pnpm lint      # ESLint
pnpm format    # Prettier
pnpm build     # Compila para ./dist
```

## Estrutura de pastas

```
bootcamp-treinos-api/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── index.ts          # Entrada Fastify: Swagger, CORS, docs, registro de rotas
│   ├── errors/            # Erros de domínio
│   ├── schemas/           # Schemas Zod compartilhados
│   ├── routes/            # Handlers Fastify (home, me, stats, workout-plan, ai)
│   ├── usecases/          # Regras de negócio
│   ├── lib/
│   │   ├── auth.ts        # Configuração Better Auth
│   │   └── db.ts          # Client Prisma singleton
│   └── generated/prisma/  # Client Prisma gerado (gitignored)
├── prisma.config.ts
├── docker-compose.yml      # PostgreSQL local
└── package.json
```

## Roadmap / próximos passos

- Testes automatizados (Vitest) para use cases e rotas
- Rate limiting e observabilidade (logs estruturados já existem via Fastify logger)
- Deploy (Docker image + CI)

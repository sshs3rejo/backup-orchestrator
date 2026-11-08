# Backup Orchestrator

Painel web para orquestrar backups de bancos de dados self-hosted e na nuvem, com destino no **Google Drive** via [rclone](https://rclone.org/).

Agendar um backup de Postgres, acompanhar a execução, ver quanto cada run ocupou e guardar tudo em um destino fora da máquina — sem depender de cron espalhado por vários servidores e scripts soltos.

Next.js 16 · React 19 · Prisma 7 · PostgreSQL · rclone

## O problema

Backup de banco de dados quase sempre acaba em um `pg_dump | gzip` dentro de um crontab, num servidor que ninguém lembra que existe. Quando o disco enche, quando a senha muda, quando o backup para de rodar — você descobre no dia em que precisa restaurar.

Este projeto coloca isso dentro de uma aplicação: os alvos (bancos) e os destinos (remotes do rclone) ficam cadastrados, as execuções ficam registradas com status e tamanho, e o agendamento é uma configuração — não um arquivo em `/etc`.

## Modelo de dados

Cinco entidades em Prisma:

| Modelo | Papel |
|---|---|
| `Database` | Um banco de origem (host, porta, credenciais, tipo) |
| `Remote` | Um destino no rclone — tipicamente um remote do Google Drive |
| `BackupJob` | O agendamento: qual banco, qual destino, com que frequência |
| `BackupRun` | Uma execução concreta do job: status, início, fim, tamanho, erro |
| `AppConfig` | Configuração global da aplicação |

Separar **job** de **run** é o que permite ver histórico: o job é a intenção ("backup diário do banco X para o Drive"), o run é o que realmente aconteceu naquela madrugada, com sucesso ou falha.

## API

```
GET    /api/databases          lista bancos cadastrados
POST   /api/databases          cadastra banco
GET    /api/databases/[id]
PATCH  /api/databases/[id]
DELETE /api/databases/[id]

GET    /api/jobs               agendamentos
POST   /api/jobs
GET    /api/jobs/[id]
PATCH  /api/jobs/[id]
DELETE /api/jobs/[id]

GET    /api/runs               histórico de execuções
GET    /api/stats              números agregados para o dashboard
GET    /api/storage            uso do destino
GET    /api/settings
PATCH  /api/settings
```

## Google Drive

A autenticação com o Drive é feita via OAuth (`lib/google-oauth.ts`). As credenciais geradas alimentam um arquivo de configuração do rclone, montado em tempo de execução — por padrão em `os.tmpdir()/backup-service-rclone.conf`, já que a aplicação não precisa de um `rclone.conf` persistente.

O binário do rclone vem de `node_modules/rclone.js`, então não há instalação manual. Para usar um binário próprio, defina `RCLONE_EXECUTABLE`.

## Rodando

Requisitos: Node 20+, pnpm, Docker.

```bash
git clone https://github.com/sshs3rejo/backup-orchestrator.git
cd backup-orchestrator
pnpm install
docker compose up -d      # postgres:16 em localhost:5432
cp .env.example .env
```

`DATABASE_URL` é a única variável obrigatória:

```bash
DATABASE_URL="postgresql://backup_service:backup_service_dev@localhost:5432/backup_service"
```

Opcionais (todas com padrão sensato) estão documentadas em `.env.example`:

| Variável | Para quê |
|---|---|
| `RCLONE_EXECUTABLE` | Usar um rclone já instalado |
| `RCLONE_CONFIG_PATH` | Apontar para um `rclone.conf` existente |
| `DEFAULT_RCLONE_REMOTE` | Nome do remote padrão (ex.: `gdrive`) |
| `STORAGE_BACKUP_PATH` | Onde os dumps são gravados (padrão `/backups`) |

Migrações e servidor:

```bash
pnpm db:generate
pnpm db:migrate
pnpm dev          # http://localhost:3000
```

## Interface

Dashboard com `recharts` para o avanço dos backups, componentes `shadcn` (radix-ui, base-ui) e ícones `phosphor` + `lucide`. Tema claro/escuro via `next-themes`.

## Estado atual

Em desenvolvimento ativo. O núcleo — cadastro de bancos, agendamento, execução via rclone e histórico — está implementado. Não há testes automatizados, e a aplicação ainda não tem autenticação: rode-a em rede privada, não exposta.

Notas de refatoração em andamento ficam em `app/refactoring.md`.

## Licença

MIT

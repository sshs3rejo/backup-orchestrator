import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Marca como falhas as runs "running" que não responderam em 5 minutos.
 * Rodado ao disparar um novo backup (POST) — sem PATCH mágico por ação.
 */
async function cleanupStuckRuns() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

  const stuckRuns = await prisma.backupRun.findMany({
    where: {
      status: 'running',
      startedAt: { lt: fiveMinutesAgo },
    },
  })

  for (const run of stuckRuns) {
    await prisma.backupRun.update({
      where: { id: run.id },
      data: {
        status: 'failed',
        error: 'Timeout - backup não respondeu em 5 minutos',
        finishedAt: new Date(),
      },
    })
  }

  return stuckRuns.length
}

export async function GET() {
  try {
    const runs = await prisma.backupRun.findMany({
      orderBy: { startedAt: 'desc' },
      include: { database: true },
    })

    const formattedRuns = runs.map(run => ({
      id: run.id,
      databaseId: run.databaseId,
      databaseName: run.database?.name || 'Desconhecido',
      status: run.status,
      filePath: run.filePath,
      size: run.size,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      error: run.error,
      duration: run.duration,
    }))

    return NextResponse.json(formattedRuns)
  } catch (error) {
    console.error('Error fetching runs:', error)
    return NextResponse.json({ error: 'Falha ao buscar runs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { databaseId } = body

    if (!databaseId) {
      return NextResponse.json({ error: 'databaseId é obrigatório' }, { status: 400 })
    }

    const database = await prisma.database.findUnique({
      where: { id: databaseId },
    })

    if (!database) {
      return NextResponse.json({ error: 'Database não encontrada' }, { status: 404 })
    }

    // Limpa runs travadas antes de disparar um novo backup
    await cleanupStuckRuns()

    const run = await prisma.backupRun.create({
      data: {
        databaseId,
        databaseName: database.name,
        status: 'running',
        startedAt: new Date(),
      },
    })

    runBackupWorker(run.id)

    return NextResponse.json(run, { status: 201 })
  } catch (error) {
    console.error('Error creating run:', error)
    return NextResponse.json({ error: 'Falha ao criar run' }, { status: 500 })
  }
}

async function runBackupWorker(runId: string) {
  try {
    const { spawn } = await import('child_process')

    const workerPath = process.cwd() + '/scripts/backup-worker.ts'

    const worker = spawn('npx', ['tsx', workerPath, '--run', runId], {
      stdio: 'inherit',
      shell: true,
    })

    worker.on('error', (error) => {
      console.error('Worker error:', error)
    })

    worker.on('exit', (code) => {
      console.log(`Worker exited with code ${code}`)
    })
  } catch (error) {
    console.error('Error starting worker:', error)
  }
}
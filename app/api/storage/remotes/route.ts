import { NextResponse } from "next/server"
import {
  listRemotes,
  createRemote,
  getProviders,
  getStorageUsage,
} from "@/lib/rclone"

export async function GET() {
  try {
    const [remotes, providers] = await Promise.all([
      listRemotes(),
      getProviders(),
    ])

    // Usage consolidado no mesmo response (apenas remotes do tipo drive)
    const driveRemotes = remotes.filter((r) => r.type === "drive")
    const totalUsage = { used: 0, total: 0, free: 0 }

    if (driveRemotes.length > 0) {
      const usageResults = await Promise.allSettled(
        driveRemotes.map((r) => getStorageUsage(r.name))
      )

      for (const result of usageResults) {
        if (result.status === "fulfilled" && result.value) {
          totalUsage.used += result.value.used
          totalUsage.total += result.value.total
          totalUsage.free += result.value.free
        }
      }
    }

    return NextResponse.json({ remotes, providers, usage: totalUsage })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao listar remotes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, config } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: "name e type são obrigatórios" },
        { status: 400 }
      )
    }

    await createRemote(name, type, config || {})
    return NextResponse.json({ success: true, name, type })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha ao criar remote" },
      { status: 500 }
    )
  }
}
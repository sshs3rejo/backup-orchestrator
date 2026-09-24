import { prisma } from "@/lib/prisma"
import type { AppSettings } from "@/lib/types"

const defaults: AppSettings = {
  defaultRemote: "",
  storageBackupPath: "/backups",
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const cfg = await prisma.appConfig.findUnique({ where: { id: "singleton" } })
    if (!cfg) return { ...defaults }
    return { ...defaults, ...(cfg.data as Partial<AppSettings>) }
  } catch {
    return { ...defaults }
  }
}

export async function saveSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings()
  const updated = { ...current, ...partial }

  await prisma.appConfig.upsert({
    where: { id: "singleton" },
    update: { data: updated },
    create: { id: "singleton", data: updated },
  })

  return updated
}
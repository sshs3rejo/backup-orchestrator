import type {
  Database,
  BackupJob,
  BackupRun,
  DashboardStats,
  AppSettings,
  TestResult,
  StartOAuthResponse,
  OAuthStatusResponse,
  FileListResponse,
  RemotesResponse,
} from './types'

export const databasesApi = {
  async getAll(): Promise<Database[]> {
    const res = await fetch('/api/databases')
    if (!res.ok) throw new Error('Falha ao buscar bancos')
    return res.json()
  },

  async create(data: {
    name: string
    type: string
    host: string
    port: string
    database: string
    username: string
    password: string
  }): Promise<Database> {
    const res = await fetch('/api/databases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Falha ao criar banco')
    return res.json()
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/databases/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Falha ao deletar banco')
  },
}

export const settingsApi = {
  async get(): Promise<AppSettings> {
    const res = await fetch('/api/settings')
    if (!res.ok) throw new Error('Falha ao buscar settings')
    return res.json()
  },

  async save(data: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Falha ao salvar settings')
    return res.json()
  },
}

export const runsApi = {
  async getAll(): Promise<BackupRun[]> {
    const res = await fetch('/api/runs')
    if (!res.ok) throw new Error('Falha ao buscar runs')
    return res.json()
  },

  async create(databaseId: string): Promise<BackupRun> {
    const res = await fetch('/api/runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ databaseId }),
    })
    if (!res.ok) throw new Error('Falha ao criar run')
    return res.json()
  },
}

export const jobsApi = {
  async getAll(): Promise<BackupJob[]> {
    const res = await fetch('/api/jobs')
    if (!res.ok) throw new Error('Falha ao buscar jobs')
    return res.json()
  },

  async create(data: {
    databaseId: string
    frequency: string
    time: string
    retentionDays: number
    destination?: string
  }): Promise<BackupJob> {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Falha ao criar job')
    return res.json()
  },

  async toggle(id: string, isActive: boolean): Promise<BackupJob> {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    if (!res.ok) throw new Error('Falha ao alternar job')
    return res.json()
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Falha ao deletar job')
  },
}

export const statsApi = {
  async get(): Promise<DashboardStats> {
    const res = await fetch('/api/stats')
    if (!res.ok) throw new Error('Falha ao buscar stats')
    return res.json()
  },
}

export const oauthApi = {
  async start(): Promise<StartOAuthResponse> {
    const res = await fetch("/api/storage/oauth", {
      method: "POST",
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Falha ao iniciar OAuth" }))
      throw new Error(err.error || "Falha ao iniciar OAuth")
    }
    return res.json()
  },

  async checkStatus(state: string): Promise<OAuthStatusResponse> {
    const res = await fetch(`/api/storage/oauth?state=${encodeURIComponent(state)}`)
    if (!res.ok) throw new Error("Falha ao verificar status")
    return res.json()
  },
}

export const storageApi = {
  async getRemotes(): Promise<RemotesResponse> {
    const res = await fetch('/api/storage/remotes')
    if (!res.ok) throw new Error('Falha ao buscar remotes')
    return res.json()
  },

  async createRemote(name: string, type: string, config: Record<string, string>): Promise<void> {
    const res = await fetch('/api/storage/remotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, config }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Falha ao criar remote')
    }
  },

  async deleteRemote(name: string): Promise<void> {
    const res = await fetch(`/api/storage/remotes/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Falha ao deletar remote')
  },

  async testRemote(name: string): Promise<TestResult> {
    const res = await fetch(`/api/storage/remotes/${encodeURIComponent(name)}`, {
      method: 'POST',
    })
    return res.json()
  },
}

export const fileApi = {
  async list(remoteName: string, path: string): Promise<FileListResponse> {
    const res = await fetch(`/api/storage/remotes/${encodeURIComponent(remoteName)}/files?path=${encodeURIComponent(path)}`)
    if (!res.ok) throw new Error("Falha ao listar arquivos")
    return res.json()
  },

  async _delete(remoteName: string, remotePath: string, isDir: boolean): Promise<void> {
    const res = await fetch(
      `/api/storage/remotes/${encodeURIComponent(remoteName)}/files?path=${encodeURIComponent(remotePath)}&dir=${isDir}`,
      { method: "DELETE" }
    )
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Falha ao deletar")
    }
  },

  async mkdir(remoteName: string, remotePath: string): Promise<void> {
    const res = await fetch(`/api/storage/remotes/${encodeURIComponent(remoteName)}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mkdir", remotePath }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Falha ao criar pasta")
    }
  },

  async rename(remoteName: string, remotePath: string, newName: string): Promise<void> {
    const res = await fetch(`/api/storage/remotes/${encodeURIComponent(remoteName)}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "rename", remotePath, newName }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Falha ao renomear")
    }
  },

  async download(remoteName: string, remotePath: string): Promise<Blob> {
    const res = await fetch(
      `/api/storage/remotes/${encodeURIComponent(remoteName)}/files?path=${encodeURIComponent(remotePath)}&download=true`
    )
    if (!res.ok) throw new Error("Falha no download")
    return res.blob()
  },

  async upload(remoteName: string, file: File, destPath: string): Promise<void> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("path", destPath)
    const res = await fetch(`/api/storage/remotes/${encodeURIComponent(remoteName)}/files`, {
      method: "POST",
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Falha no upload")
    }
  },
}
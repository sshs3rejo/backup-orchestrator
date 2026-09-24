// Fonte única de tipos do projeto. Nada é duplicado em lib/api.ts, lib/settings.ts ou rclone-types.ts.

// ---- Domínio (espelha o schema Prisma) ----

export type DatabaseType = 'postgres' | 'mysql' | 'mongodb'
export type BackupFrequency = 'hourly' | 'daily' | 'weekly'
export type BackupStatus = 'pending' | 'running' | 'success' | 'failed'

export interface Database {
  id: string
  name: string
  type: DatabaseType
  connectionUrl: string
  isActive: boolean
  createdAt: Date
  lastBackup?: Date
  successRate: number
}

export interface BackupJob {
  id: string
  databaseId: string
  frequency: BackupFrequency
  time: string
  retentionDays: number
  isActive: boolean
  nextRun?: Date
  destination: string
}

export interface BackupRun {
  id: string
  databaseId: string
  databaseName: string
  status: BackupStatus
  filePath?: string
  size?: number
  startedAt: Date
  finishedAt?: Date
  error?: string
  duration?: number
}

export interface DashboardStats {
  totalDatabases: number
  activeDatabases: number
  totalBackups: number
  successfulBackups: number
  failedBackups: number
  totalStorage: number
  averageBackupTime: number
  lastBackupTime?: Date
}

// ---- Settings (AppConfig no banco) ----

export interface AppSettings {
  defaultRemote: string
  storageBackupPath: string
}

// ---- Storage / rclone ----

export interface RemoteInfo {
  name: string
  type: string
  config: Record<string, string>
}

export interface StorageUsage {
  used: number
  total: number
  free: number
  truncated?: boolean
}

export interface TestResult {
  success: boolean
  message: string
}

export interface UploadResult {
  success: boolean
  error?: string
}

export interface RemoteExample {
  value: string
  help: string
}

export interface RemoteOption {
  name: string
  help: string
  provider: string
  default: string
  value: string
  examples: RemoteExample[]
  required: boolean
  advanced: boolean
}

export interface ProviderInfo {
  name: string
  description: string
  prefix: string
  options: RemoteOption[]
}

export interface StartOAuthResponse {
  state: string
  auth_url: string
}

export interface OAuthStatusResponse {
  status: "pending" | "success" | "error" | "expired"
  token?: string
  error?: string
}

export interface FileEntry {
  name: string
  path: string
  size: number
  modTime: string
  isDir: boolean
}

export interface FileListResponse {
  files: FileEntry[]
  path: string
}

export interface RemotesResponse {
  remotes: RemoteInfo[]
  providers: ProviderInfo[]
  usage: Pick<StorageUsage, "used" | "total" | "free">
}
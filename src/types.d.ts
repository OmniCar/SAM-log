export type Environment =
  | 'production'
  | 'staging'
  | 'development'
  | 'local'
  | 'default'

export type Loglevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly'

export interface ILogSettings {
  level: Loglevel
  useStackDriver: boolean
  useConsole: boolean
  keyFilename?: string // Service account key file
  projectId?: string // Project id
}

export interface ILogInfo {
  prefix?: string
  meta?: any | any[]
  settings?: Partial<ILogSettings>
}

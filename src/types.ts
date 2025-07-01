export interface Chord {
  id: string
  name: string
  displayName?: string
  frets: number[] // Array of 6 numbers representing fret positions for each string (0 = open, -1 = muted)
  fingers: number[] // Array of 6 numbers representing finger positions (0 = no finger, 1-4 = finger numbers)
  muted?: boolean[] // Array of 6 booleans representing muted strings
  baseFret?: number
  isCustom: boolean
  createdDate: string
}

export interface StrummingPattern {
  id: string
  name: string
  pattern: string
}

export interface SongSection {
  id: string
  name: string
  type: 'verse' | 'chorus' | 'bridge' | 'intro' | 'outro' | 'solo'
  chords: string[]
  lyrics?: string
  measures?: number
}

export interface Song {
  id: string
  title: string // Changed from 'name' to 'title' to match Azure schema
  artist?: string
  key?: string
  tempo?: number
  timeSignature?: string
  sections: SongSection[] // Changed from simple chords array to sections
  metadata: {
    createdAt: string
    updatedAt: string
    version: number
    difficulty?: number
    tags?: string[]
    notes?: string
    strummingPatterns?: StrummingPattern[]
  }
  // Keeping these for backward compatibility
  chords?: string[] // Deprecated - use sections instead
  createdDate?: string // Deprecated - use metadata.createdAt
  modifiedDate?: string // Deprecated - use metadata.updatedAt
}

export interface CustomChordsData {
  chords: Record<string, Omit<Chord, 'id' | 'isCustom' | 'createdDate'>>
  metadata: {
    updatedAt: string
    version: number
  }
}

export interface BlobInfo {
  name: string
  lastModified: string
  size: number
}

export interface SyncStatus {
  isLoading: boolean
  isSyncing: boolean
  lastSync?: string
  error?: string
}

export interface ChordPosition {
  string: number // 0-5 (low E to high E)
  fret: number // 0-24
  finger?: number // 1-4
}

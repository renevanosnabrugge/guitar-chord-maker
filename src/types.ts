export interface Chord {
  id: string
  name: string
  frets: number[] // Array of 6 numbers representing fret positions for each string (0 = open, -1 = muted)
  fingers: number[] // Array of 6 numbers representing finger positions (0 = no finger, 1-4 = finger numbers)
  isCustom: boolean
  createdDate: string
}

export interface StrummingPattern {
  id: string
  name: string
  pattern: string
}

export interface Song {
  id: string
  name: string
  artist?: string
  chords: string[] // Array of chord IDs
  metadata: {
    key?: string
    tempo?: number
    difficulty?: number
    tags?: string[]
    notes?: string
    strummingPatterns?: StrummingPattern[]
  }
  createdDate: string
  modifiedDate: string
}

export interface ChordPosition {
  string: number // 0-5 (low E to high E)
  fret: number // 0-24
  finger?: number // 1-4
}

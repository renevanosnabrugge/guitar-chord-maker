import { create } from 'zustand'
import { Song, SyncStatus } from '../types'
import { blobStorageClient } from '../services/blobStorageClient'

interface SongsStore {
  songs: Song[]
  syncStatus: SyncStatus
  
  // Actions
  loadSongs: () => Promise<void>
  createSong: (_songData: Omit<Song, 'id' | 'metadata'>) => Promise<Song>
  updateSong: (_songId: string, _updates: Partial<Song>) => Promise<void>
  deleteSong: (_songId: string) => Promise<void>
  syncWithCloud: () => Promise<void>
  setSyncStatus: (_status: Partial<SyncStatus>) => void
  clearError: () => void
}

// Utility function to create a new song with proper metadata
const createSongWithMetadata = (songData: Omit<Song, 'id' | 'metadata'>): Song => {
  const now = new Date().toISOString()
  return {
    ...songData,
    id: crypto.randomUUID(),
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: 1
    }
  }
}

// Utility function to update song with new metadata
const updateSongMetadata = (song: Song, updates: Partial<Song>): Song => {
  return {
    ...song,
    ...updates,
    metadata: {
      ...song.metadata,
      ...updates.metadata,
      updatedAt: new Date().toISOString(),
      version: (song.metadata?.version || 0) + 1
    }
  }
}

// Debounced upload function
const uploadTimeouts: Map<string, number> = new Map()

const debouncedUpload = (songId: string, song: Song, delay = 500) => {
  // Clear existing timeout for this song
  const existingTimeout = uploadTimeouts.get(songId)
  if (existingTimeout) {
    clearTimeout(existingTimeout)
  }

  // Set new timeout
  const timeout = setTimeout(async () => {
    try {
      await blobStorageClient.uploadSong(song)
      uploadTimeouts.delete(songId)
    } catch (error) {
      console.error(`Failed to upload song ${songId}:`, error)
    }
  }, delay)

  uploadTimeouts.set(songId, timeout)
}

export const useSongsStore = create<SongsStore>((set, get) => ({
  songs: [],
  syncStatus: {
    isLoading: false,
    isSyncing: false
  },

  setSyncStatus: (status) => set((state) => ({
    syncStatus: { ...state.syncStatus, ...status }
  })),

  clearError: () => set((state) => ({
    syncStatus: { ...state.syncStatus, error: undefined }
  })),

  loadSongs: async () => {
    const { setSyncStatus } = get()
    
    try {
      setSyncStatus({ isLoading: true, error: undefined })
      
      const songs = await blobStorageClient.downloadAllSongs()
      
      set({ songs })
      setSyncStatus({ 
        isLoading: false, 
        lastSync: new Date().toISOString() 
      })
      
      console.log(`Loaded ${songs.length} songs from Azure`)
    } catch (error) {
      console.error('Failed to load songs:', error)
      setSyncStatus({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load songs' 
      })
      
      // Try to load from localStorage as fallback
      try {
        const fallbackSongs = JSON.parse(localStorage.getItem('chordmaker_songs') || '[]')
        set({ songs: fallbackSongs })
        console.log('Loaded songs from localStorage fallback')
      } catch (fallbackError) {
        console.error('Fallback loading failed:', fallbackError)
      }
    }
  },

  createSong: async (songData) => {
    const { setSyncStatus } = get()
    
    try {
      const newSong = createSongWithMetadata(songData)
      
      // Optimistically update local state
      set((state) => ({
        songs: [...state.songs, newSong]
      }))
      
      // Save to localStorage as backup
      const currentSongs = get().songs
      localStorage.setItem('chordmaker_songs', JSON.stringify(currentSongs))
      
      // Upload to Azure (debounced)
      setSyncStatus({ isSyncing: true })
      debouncedUpload(newSong.id, newSong)
      
      // Reset syncing status after a delay
      setTimeout(() => setSyncStatus({ isSyncing: false }), 1000)
      
      console.log(`Created song: ${newSong.title}`)
      return newSong
    } catch (error) {
      console.error('Failed to create song:', error)
      setSyncStatus({ 
        error: error instanceof Error ? error.message : 'Failed to create song' 
      })
      throw error
    }
  },

  updateSong: async (songId, updates) => {
    const { setSyncStatus } = get()
    
    try {
      const currentSongs = get().songs
      const songIndex = currentSongs.findIndex(s => s.id === songId)
      
      if (songIndex === -1) {
        throw new Error(`Song with ID ${songId} not found`)
      }
      
      const updatedSong = updateSongMetadata(currentSongs[songIndex], updates)
      
      // Optimistically update local state
      set((state) => ({
        songs: state.songs.map(song => 
          song.id === songId ? updatedSong : song
        )
      }))
      
      // Save to localStorage as backup
      const newSongs = get().songs
      localStorage.setItem('chordmaker_songs', JSON.stringify(newSongs))
      
      // Upload to Azure (debounced)
      setSyncStatus({ isSyncing: true })
      debouncedUpload(songId, updatedSong)
      
      // Reset syncing status after a delay
      setTimeout(() => setSyncStatus({ isSyncing: false }), 1000)
      
      console.log(`Updated song: ${updatedSong.title}`)
    } catch (error) {
      console.error('Failed to update song:', error)
      setSyncStatus({ 
        error: error instanceof Error ? error.message : 'Failed to update song' 
      })
      throw error
    }
  },

  deleteSong: async (songId) => {
    const { setSyncStatus } = get()
    
    try {
      // Find the song before deleting
      const currentSongs = get().songs
      const song = currentSongs.find(s => s.id === songId)
      
      if (!song) {
        throw new Error(`Song with ID ${songId} not found`)
      }
      
      // Optimistically update local state
      set((state) => ({
        songs: state.songs.filter(s => s.id !== songId)
      }))
      
      // Save to localStorage as backup
      const newSongs = get().songs
      localStorage.setItem('chordmaker_songs', JSON.stringify(newSongs))
      
      // Delete from Azure
      setSyncStatus({ isSyncing: true })
      await blobStorageClient.deleteSong(songId)
      setSyncStatus({ isSyncing: false })
      
      console.log(`Deleted song: ${song.title}`)
    } catch (error) {
      console.error('Failed to delete song:', error)
      setSyncStatus({ 
        error: error instanceof Error ? error.message : 'Failed to delete song' 
      })
      throw error
    }
  },

  syncWithCloud: async () => {
    const { setSyncStatus, loadSongs } = get()
    
    try {
      setSyncStatus({ isSyncing: true, error: undefined })
      
      // For now, just reload all songs
      // In the future, this could implement more sophisticated conflict resolution
      await loadSongs()
      
      setSyncStatus({ 
        isSyncing: false, 
        lastSync: new Date().toISOString() 
      })
      
      console.log('Successfully synced with cloud')
    } catch (error) {
      console.error('Failed to sync with cloud:', error)
      setSyncStatus({ 
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Failed to sync with cloud' 
      })
      throw error
    }
  }
}))

import { create } from 'zustand'
import { Chord, CustomChordsData, SyncStatus } from '../types'
import { blobStorageClient } from '../services/blobStorageClient'

interface ChordsStore {
  customChords: Record<string, Chord>
  syncStatus: SyncStatus
  
  // Actions
  loadCustomChords: () => Promise<void>
  saveCustomChord: (_chord: Chord) => Promise<void>
  deleteCustomChord: (_chordName: string) => Promise<void>
  syncCustomChords: () => Promise<void>
  setSyncStatus: (_status: Partial<SyncStatus>) => void
  clearError: () => void
}

// Debounced upload function for custom chords
let chordsUploadTimeout: number | undefined

const debouncedUploadChords = (chordsData: CustomChordsData, delay = 500) => {
  // Clear existing timeout
  if (chordsUploadTimeout) {
    clearTimeout(chordsUploadTimeout)
  }

  // Set new timeout
  chordsUploadTimeout = setTimeout(async () => {
    try {
      await blobStorageClient.uploadCustomChords(chordsData)
      chordsUploadTimeout = undefined
    } catch (error) {
      console.error('Failed to upload custom chords:', error)
    }
  }, delay)
}

export const useChordsStore = create<ChordsStore>((set, get) => ({
  customChords: {},
  syncStatus: {
    isLoading: false,
    isSyncing: false
  },

  setSyncStatus: (status: Partial<SyncStatus>) => set((state) => ({
    syncStatus: { ...state.syncStatus, ...status }
  })),

  clearError: () => set((state) => ({
    syncStatus: { ...state.syncStatus, error: undefined }
  })),

  loadCustomChords: async () => {
    const { setSyncStatus } = get()
    
    try {
      setSyncStatus({ isLoading: true, error: undefined })
      
      const chordsData = await blobStorageClient.downloadCustomChords()
      
      if (chordsData) {
        // Convert the chords data to our local format
        const customChords: Record<string, Chord> = {}
        
        Object.entries(chordsData.chords).forEach(([name, chordDef]) => {
          customChords[name] = {
            ...chordDef,
            id: name,
            name,
            isCustom: true,
            createdDate: new Date().toISOString() // We don't have this in the cloud format
          }
        })
        
        set({ customChords })
        setSyncStatus({ 
          isLoading: false, 
          lastSync: new Date().toISOString() 
        })
        
        console.log(`Loaded ${Object.keys(customChords).length} custom chords from Azure`)
      } else {
        // No custom chords file exists yet
        set({ customChords: {} })
        setSyncStatus({ 
          isLoading: false, 
          lastSync: new Date().toISOString() 
        })
        console.log('No custom chords file found in Azure')
      }
      
    } catch (error) {
      console.error('Failed to load custom chords:', error)
      setSyncStatus({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load custom chords' 
      })
      
      // Try to load from localStorage as fallback
      try {
        const fallbackChords = JSON.parse(localStorage.getItem('chordmaker_custom_chords') || '[]')
        const customChords: Record<string, Chord> = {}
        
        if (Array.isArray(fallbackChords)) {
          fallbackChords.forEach((chord: Chord) => {
            customChords[chord.name] = chord
          })
        }
        
        set({ customChords })
        console.log('Loaded custom chords from localStorage fallback')
      } catch (fallbackError) {
        console.error('Fallback loading failed:', fallbackError)
      }
    }
  },

  saveCustomChord: async (chord: Chord) => {
    const { setSyncStatus } = get()
    
    try {
      // Optimistically update local state
      set((state) => ({
        customChords: {
          ...state.customChords,
          [chord.name]: chord
        }
      }))
      
      // Save to localStorage as backup
      const currentChords = get().customChords
      const chordsArray = Object.values(currentChords)
      localStorage.setItem('chordmaker_custom_chords', JSON.stringify(chordsArray))
      
      // Prepare data for Azure
      const chordsData: CustomChordsData = {
        chords: {},
        metadata: {
          updatedAt: new Date().toISOString(),
          version: 1
        }
      }
      
      // Convert our local format to cloud format
      Object.values(currentChords).forEach(c => {
        chordsData.chords[c.name] = {
          name: c.name,
          displayName: c.displayName,
          frets: c.frets,
          fingers: c.fingers,
          muted: c.muted,
          baseFret: c.baseFret
        }
      })
      
      // Upload to Azure (debounced)
      setSyncStatus({ isSyncing: true })
      debouncedUploadChords(chordsData)
      
      // Reset syncing status after a delay
      setTimeout(() => setSyncStatus({ isSyncing: false }), 1000)
      
      console.log(`Saved custom chord: ${chord.name}`)
    } catch (error) {
      console.error('Failed to save custom chord:', error)
      setSyncStatus({ 
        error: error instanceof Error ? error.message : 'Failed to save custom chord' 
      })
      throw error
    }
  },

  deleteCustomChord: async (chordName: string) => {
    const { setSyncStatus } = get()
    
    try {
      // Find the chord before deleting
      const currentChords = get().customChords
      const chord = currentChords[chordName]
      
      if (!chord) {
        throw new Error(`Custom chord '${chordName}' not found`)
      }
      
      // Optimistically update local state
      set((state) => {
        const newChords = { ...state.customChords }
        delete newChords[chordName]
        return { customChords: newChords }
      })
      
      // Save to localStorage as backup
      const newChords = get().customChords
      const chordsArray = Object.values(newChords)
      localStorage.setItem('chordmaker_custom_chords', JSON.stringify(chordsArray))
      
      // Prepare data for Azure
      const chordsData: CustomChordsData = {
        chords: {},
        metadata: {
          updatedAt: new Date().toISOString(),
          version: 1
        }
      }
      
      // Convert our local format to cloud format
      Object.values(newChords).forEach(c => {
        chordsData.chords[c.name] = {
          name: c.name,
          displayName: c.displayName,
          frets: c.frets,
          fingers: c.fingers,
          muted: c.muted,
          baseFret: c.baseFret
        }
      })
      
      // Upload to Azure (debounced)
      setSyncStatus({ isSyncing: true })
      debouncedUploadChords(chordsData)
      
      // Reset syncing status after a delay
      setTimeout(() => setSyncStatus({ isSyncing: false }), 1000)
      
      console.log(`Deleted custom chord: ${chordName}`)
    } catch (error) {
      console.error('Failed to delete custom chord:', error)
      setSyncStatus({ 
        error: error instanceof Error ? error.message : 'Failed to delete custom chord' 
      })
      throw error
    }
  },

  syncCustomChords: async () => {
    const { setSyncStatus, loadCustomChords } = get()
    
    try {
      setSyncStatus({ isSyncing: true, error: undefined })
      
      // For now, just reload all custom chords
      // In the future, this could implement more sophisticated conflict resolution
      await loadCustomChords()
      
      setSyncStatus({ 
        isSyncing: false, 
        lastSync: new Date().toISOString() 
      })
      
      console.log('Successfully synced custom chords with cloud')
    } catch (error) {
      console.error('Failed to sync custom chords with cloud:', error)
      setSyncStatus({ 
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Failed to sync custom chords with cloud' 
      })
      throw error
    }
  }
}))

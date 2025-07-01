import { useSongsStore } from '../stores/songsStore'
import { useChordsStore } from '../stores/chordsStore'

/**
 * Utility functions for handling sync operations across the application
 */

export interface SyncResult {
  success: boolean
  errors: string[]
  songsCount?: number
  chordsCount?: number
}

/**
 * Initialize all data from Azure Blob Storage
 * Call this when the app starts up
 */
export const initializeFromCloud = async (): Promise<SyncResult> => {
  const result: SyncResult = {
    success: true,
    errors: []
  }

  try {
    console.log('Initializing data from Azure Blob Storage...')

    // Load songs
    try {
      await useSongsStore.getState().loadSongs()
      result.songsCount = useSongsStore.getState().songs.length
    } catch (error) {
      result.errors.push(`Failed to load songs: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Load custom chords
    try {
      await useChordsStore.getState().loadCustomChords()
      result.chordsCount = Object.keys(useChordsStore.getState().customChords).length
    } catch (error) {
      result.errors.push(`Failed to load custom chords: ${error instanceof Error ? error.message : String(error)}`)
    }

    if (result.errors.length > 0) {
      result.success = false
      console.warn('Initialization completed with errors:', result.errors)
    } else {
      console.log(`Initialization successful: ${result.songsCount} songs, ${result.chordsCount} custom chords`)
    }

  } catch (error) {
    result.success = false
    result.errors.push(`Initialization failed: ${error instanceof Error ? error.message : String(error)}`)
    console.error('Failed to initialize from cloud:', error)
  }

  return result
}

/**
 * Sync all data with Azure Blob Storage
 * Call this when user manually requests a sync
 */
export const syncAllWithCloud = async (): Promise<SyncResult> => {
  const result: SyncResult = {
    success: true,
    errors: []
  }

  try {
    console.log('Syncing all data with Azure Blob Storage...')

    // Sync songs
    try {
      await useSongsStore.getState().syncWithCloud()
      result.songsCount = useSongsStore.getState().songs.length
    } catch (error) {
      result.errors.push(`Failed to sync songs: ${error instanceof Error ? error.message : String(error)}`)
    }

    // Sync custom chords
    try {
      await useChordsStore.getState().syncCustomChords()
      result.chordsCount = Object.keys(useChordsStore.getState().customChords).length
    } catch (error) {
      result.errors.push(`Failed to sync custom chords: ${error instanceof Error ? error.message : String(error)}`)
    }

    if (result.errors.length > 0) {
      result.success = false
      console.warn('Sync completed with errors:', result.errors)
    } else {
      console.log(`Sync successful: ${result.songsCount} songs, ${result.chordsCount} custom chords`)
    }

  } catch (error) {
    result.success = false
    result.errors.push(`Sync failed: ${error instanceof Error ? error.message : String(error)}`)
    console.error('Failed to sync with cloud:', error)
  }

  return result
}

/**
 * Check if the application is currently syncing with cloud
 */
export const isSyncing = (): boolean => {
  const songsSync = useSongsStore.getState().syncStatus.isSyncing
  const chordsSync = useChordsStore.getState().syncStatus.isSyncing
  return songsSync || chordsSync
}

/**
 * Check if there are any sync errors
 */
export const hasSyncErrors = (): boolean => {
  const songsError = useSongsStore.getState().syncStatus.error
  const chordsError = useChordsStore.getState().syncStatus.error
  return !!(songsError || chordsError)
}

/**
 * Get all current sync errors
 */
export const getSyncErrors = (): string[] => {
  const errors: string[] = []
  
  const songsError = useSongsStore.getState().syncStatus.error
  if (songsError) {
    errors.push(`Songs: ${songsError}`)
  }
  
  const chordsError = useChordsStore.getState().syncStatus.error
  if (chordsError) {
    errors.push(`Chords: ${chordsError}`)
  }
  
  return errors
}

/**
 * Clear all sync errors
 */
export const clearAllSyncErrors = (): void => {
  useSongsStore.getState().clearError()
  useChordsStore.getState().clearError()
}

/**
 * Get the last sync timestamp
 */
export const getLastSyncTime = (): Date | null => {
  const songsLastSync = useSongsStore.getState().syncStatus.lastSync
  const chordsLastSync = useChordsStore.getState().syncStatus.lastSync
  
  const timestamps = [songsLastSync, chordsLastSync]
    .filter(Boolean)
    .map(ts => new Date(ts!))
  
  if (timestamps.length === 0) {
    return null
  }
  
  // Return the most recent sync time
  return new Date(Math.max(...timestamps.map(d => d.getTime())))
}

/**
 * Retry failed operations with exponential backoff
 */
export const retryWithBackoff = async (
  operation: () => Promise<void>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<void> => {
  let attempt = 0
  
  while (attempt < maxRetries) {
    try {
      await operation()
      return // Success
    } catch (error) {
      attempt++
      
      if (attempt >= maxRetries) {
        throw error // Final attempt failed
      }
      
      // Exponential backoff: baseDelay * 2^attempt
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.log(`Operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

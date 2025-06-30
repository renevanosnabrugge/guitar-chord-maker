import { Chord, Song } from '../types'

const STORAGE_KEYS = {
  CUSTOM_CHORDS: 'chordmaker_custom_chords',
  SONGS: 'chordmaker_songs'
}

// Simple notification function
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  console.log(`${type.toUpperCase()}: ${message}`)
  // Could be enhanced with a toast notification system
}

// Chord Storage Functions
export const saveCustomChords = (chords: Chord[]): void => {
  try {
    const chordsJson = JSON.stringify(chords, null, 2)
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CHORDS, chordsJson)
    
    if (chords.length > 0) {
      showNotification(`Saved ${chords.length} custom chords`)
    }
  } catch (error) {
    console.error('Error saving custom chords:', error)
    showNotification('Error saving custom chords', 'error')
  }
}

export const loadCustomChords = (): Chord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_CHORDS)
    if (stored) {
      const chords = JSON.parse(stored) as Chord[]
      console.log(`Loaded ${chords.length} custom chords from storage`)
      return chords
    }
    return []
  } catch (error) {
    console.error('Error loading custom chords:', error)
    return []
  }
}

export const addCustomChord = (chord: Chord): Chord[] => {
  const currentChords = loadCustomChords()
  const updatedChords = [...currentChords, chord]
  saveCustomChords(updatedChords)
  return updatedChords
}

export const updateCustomChord = (updatedChord: Chord): Chord[] => {
  const currentChords = loadCustomChords()
  const updatedChords = currentChords.map(chord => 
    chord.id === updatedChord.id ? updatedChord : chord
  )
  saveCustomChords(updatedChords)
  return updatedChords
}

export const deleteCustomChord = (chordId: string): Chord[] => {
  const currentChords = loadCustomChords()
  const updatedChords = currentChords.filter(chord => chord.id !== chordId)
  saveCustomChords(updatedChords)
  return updatedChords
}

// Song Storage Functions
export const saveSongs = (songs: Song[]): void => {
  try {
    const songsJson = JSON.stringify(songs, null, 2)
    localStorage.setItem(STORAGE_KEYS.SONGS, songsJson)
    
    // Also create a backup
    if (songs.length > 0) {
      console.log('Songs saved to localStorage')
    }
  } catch (error) {
    console.error('Error saving songs:', error)
  }
}

export const loadSongs = (): Song[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SONGS)
    if (stored) {
      const songs = JSON.parse(stored) as Song[]
      console.log(`Loaded ${songs.length} songs from storage`)
      return songs
    }
    return []
  } catch (error) {
    console.error('Error loading songs:', error)
    return []
  }
}

export const addSong = (song: Song): Song[] => {
  const currentSongs = loadSongs()
  const updatedSongs = [...currentSongs, song]
  saveSongs(updatedSongs)
  return updatedSongs
}

export const updateSong = (updatedSong: Song): Song[] => {
  const currentSongs = loadSongs()
  const updatedSongs = currentSongs.map(song => 
    song.id === updatedSong.id ? updatedSong : song
  )
  saveSongs(updatedSongs)
  return updatedSongs
}

export const deleteSong = (songId: string): Song[] => {
  const currentSongs = loadSongs()
  const updatedSongs = currentSongs.filter(song => song.id !== songId)
  saveSongs(updatedSongs)
  return updatedSongs
}

// Backup and Export Functions
export const exportAllData = () => {
  const customChords = loadCustomChords()
  const songs = loadSongs()
  
  const allData = {
    customChords,
    songs,
    exportDate: new Date().toISOString(),
    version: '1.0'
  }
  
  const dataStr = JSON.stringify(allData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `chordmaker_backup_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const importAllData = (file: File): Promise<{ customChords: Chord[], songs: Song[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        if (data.customChords && Array.isArray(data.customChords)) {
          saveCustomChords(data.customChords)
        }
        
        if (data.songs && Array.isArray(data.songs)) {
          saveSongs(data.songs)
        }
        
        resolve({
          customChords: data.customChords || [],
          songs: data.songs || []
        })
      } catch (error) {
        reject(new Error('Invalid backup file format'))
      }
    }
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsText(file)
  })
}

// Clear all data (for reset functionality)
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CUSTOM_CHORDS)
  localStorage.removeItem(STORAGE_KEYS.SONGS)
  console.log('All data cleared from storage')
}

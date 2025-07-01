import { useState, useEffect, useMemo } from 'react'
import { ChordLibrary } from './components/ChordLibrary/ChordLibrary'
import { ChordEditor } from './components/ChordEditor/ChordEditor'
import { SongBuilder } from './components/SongBuilder/SongBuilder'
import { SongLibrary } from './components/SongLibrary/SongLibrary'
import { StorageStatus } from './components/StorageStatus'
import { Chord, Song } from './types'
import { defaultChords } from './data/defaultChords'
import { useSongsStore } from './stores/songsStore'
import { useChordsStore } from './stores/chordsStore'
import { blobStorageClient } from './services/blobStorageClient'
import { initializeFromCloud } from './utils/syncUtils'
import { exportAllData } from './utils/storage'
import './App.css'

type ViewMode = 'chord-library' | 'chord-editor' | 'song-builder' | 'song-library'

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('chord-library')
  const [selectedChords, setSelectedChords] = useState<string[]>([])
  const [editingChord, setEditingChord] = useState<Chord | null>(null)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Zustand store hooks
  const songs = useSongsStore(state => state.songs)
  const createSong = useSongsStore(state => state.createSong)
  const updateSong = useSongsStore(state => state.updateSong)
  const deleteSong = useSongsStore(state => state.deleteSong)

  const customChords = useChordsStore(state => state.customChords)
  const saveCustomChord = useChordsStore(state => state.saveCustomChord)
  const deleteCustomChord = useChordsStore(state => state.deleteCustomChord)

  // Initialize data from Azure on app start
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 App starting initialization from cloud...')
        await initializeFromCloud()
        console.log('🚀 App initialization completed successfully')
        setIsInitialized(true)
      } catch (error) {
        console.error('🚀 Failed to initialize from cloud:', error)
        setIsInitialized(true) // Still show the app even if cloud sync fails
      }
    }

    initialize()
  }, [])

  // Convert custom chords object to array and combine with default chords
  const allChords = useMemo(() => [
    ...defaultChords,
    ...Object.values(customChords)
  ], [customChords])

  // Debug logging for custom chords
  useEffect(() => {
    console.log('🎯 App: Custom chords updated:', Object.keys(customChords).length, 'chords')
    console.log('🎯 App: Total chords available:', allChords.length)
    
    // Make debugging functions available in the browser console
    if (typeof window !== 'undefined') {
      (window as unknown as { debugChords: unknown }).debugChords = {
        customChords,
        allChords,
        saveTestChord: async () => {
          const testChord: Chord = {
            id: 'test-chord',
            name: 'Test Chord',
            frets: [0, 2, 2, 1, 0, 0],
            fingers: [0, 2, 3, 1, 0, 0],
            isCustom: true,
            createdDate: new Date().toISOString()
          }
          await saveCustomChord(testChord)
          console.log('✅ Test chord saved!')
        },
        reloadChords: async () => {
          await useChordsStore.getState().loadCustomChords()
          console.log('✅ Custom chords reloaded!')
        },
        initializeCustomChordsFile: async () => {
          await blobStorageClient.initializeCustomChordsFile()
          console.log('✅ Custom chords file initialized!')
        }
      }
    }
  }, [customChords, allChords, saveCustomChord])

  const handleSaveChord = async (chord: Chord) => {
    try {
      await saveCustomChord(chord)
      setEditingChord(null)
      setCurrentView('chord-library')
    } catch (error) {
      console.error('Failed to save chord:', error)
      // Could show a toast notification here
    }
  }

  const handleEditChord = (chord: Chord) => {
    setEditingChord(chord)
    setCurrentView('chord-editor')
  }

  const handleDeleteChord = async (chordId: string) => {
    try {
      // Find the chord name from the id
      const chord = Object.values(customChords).find(c => c.id === chordId)
      if (chord) {
        await deleteCustomChord(chord.name)
      }
    } catch (error) {
      console.error('Failed to delete chord:', error)
    }
  }

  const handleSaveSong = async (songData: Omit<Song, 'id' | 'metadata'>) => {
    try {
      if (editingSong) {
        await updateSong(editingSong.id, songData)
      } else {
        await createSong(songData)
      }
      setEditingSong(null)
      setSelectedChords([])
      setCurrentView('song-library')
    } catch (error) {
      console.error('Failed to save song:', error)
    }
  }

  const handleDeleteSong = async (songId: string) => {
    try {
      await deleteSong(songId)
    } catch (error) {
      console.error('Failed to delete song:', error)
    }
  }

  const handleEditSong = (song: Song) => {
    setEditingSong(song)
    // Handle both old and new song formats
    const chords = song.chords || []
    setSelectedChords(chords)
    setCurrentView('song-builder')
  }

  const renderCurrentView = () => {
    if (!isInitialized) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading ChordMaker...</p>
        </div>
      )
    }

    switch (currentView) {
      case 'chord-library':
        return (
          <ChordLibrary
            chords={allChords}
            onSelectChord={(chordId) => setSelectedChords(prev => [...prev, chordId])}
            onEditChord={handleEditChord}
            onDeleteChord={handleDeleteChord}
          />
        )
      case 'chord-editor':
        return (
          <ChordEditor
            chord={editingChord}
            onSave={handleSaveChord}
            onCancel={() => {
              setEditingChord(null)
              setCurrentView('chord-library')
            }}
          />
        )
      case 'song-builder':
        return (
          <SongBuilder
            chords={allChords}
            selectedChords={selectedChords}
            onUpdateChords={setSelectedChords}
            onSaveSong={handleSaveSong}
            editingSong={editingSong}
          />
        )
      case 'song-library':
        return (
          <SongLibrary
            songs={songs}
            chords={allChords}
            onDeleteSong={handleDeleteSong}
            onEditSong={handleEditSong}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="app">
      <nav className="nav">
        <h1>Guitar Chord Maker</h1>
        <div className="nav-buttons">
          <button
            className={currentView === 'chord-library' ? 'active' : ''}
            onClick={() => setCurrentView('chord-library')}
          >
            Chord Library
          </button>
          <button
            className={currentView === 'chord-editor' ? 'active' : ''}
            onClick={() => {
              setEditingChord(null)
              setCurrentView('chord-editor')
            }}
          >
            Create Chord
          </button>
          <button
            className={currentView === 'song-builder' ? 'active' : ''}
            onClick={() => {
              setEditingSong(null)
              setSelectedChords([])
              setCurrentView('song-builder')
            }}
          >
            Build Song
          </button>
          <button
            className={currentView === 'song-library' ? 'active' : ''}
            onClick={() => setCurrentView('song-library')}
          >
            Song Library
          </button>
          <button
            onClick={exportAllData}
            className="backup-button"
            title="Export all data as backup"
          >
            📥 Backup
          </button>
        </div>
      </nav>
      
      {/* Azure Storage Status */}
      <StorageStatus />
      
      <main className="main">
        {renderCurrentView()}
      </main>
    </div>
  )
}

export default App

import { useState, useEffect } from 'react'
import { ChordLibrary } from './components/ChordLibrary/ChordLibrary'
import { ChordEditor } from './components/ChordEditor/ChordEditor'
import { SongBuilder } from './components/SongBuilder/SongBuilder'
import { SongLibrary } from './components/SongLibrary/SongLibrary'
import { Chord, Song } from './types'
import { defaultChords } from './data/defaultChords'
import {
  loadCustomChords,
  addCustomChord,
  updateCustomChord,
  deleteCustomChord,
  loadSongs,
  addSong,
  updateSong,
  deleteSong,
  exportAllData
} from './utils/storage'
import './App.css'

type ViewMode = 'chord-library' | 'chord-editor' | 'song-builder' | 'song-library'

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('chord-library')
  const [customChords, setCustomChords] = useState<Chord[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [selectedChords, setSelectedChords] = useState<string[]>([])
  const [editingChord, setEditingChord] = useState<Chord | null>(null)
  const [editingSong, setEditingSong] = useState<Song | null>(null)

  // Load data from storage on app start
  useEffect(() => {
    const storedChords = loadCustomChords()
    const storedSongs = loadSongs()
    setCustomChords(storedChords)
    setSongs(storedSongs)
  }, [])

  const allChords = [...defaultChords, ...customChords]

  const handleSaveChord = (chord: Chord) => {
    if (editingChord) {
      const updatedChords = updateCustomChord(chord)
      setCustomChords(updatedChords)
    } else {
      const updatedChords = addCustomChord(chord)
      setCustomChords(updatedChords)
    }
    setEditingChord(null)
    setCurrentView('chord-library')
  }

  const handleEditChord = (chord: Chord) => {
    setEditingChord(chord)
    setCurrentView('chord-editor')
  }

  const handleDeleteChord = (chordId: string) => {
    const updatedChords = deleteCustomChord(chordId)
    setCustomChords(updatedChords)
  }

  const handleSaveSong = (song: Song) => {
    if (editingSong) {
      const updatedSongs = updateSong(song)
      setSongs(updatedSongs)
    } else {
      const updatedSongs = addSong(song)
      setSongs(updatedSongs)
    }
    setEditingSong(null)
    setSelectedChords([])
    setCurrentView('song-library')
  }

  const handleDeleteSong = (songId: string) => {
    const updatedSongs = deleteSong(songId)
    setSongs(updatedSongs)
  }

  const handleEditSong = (song: Song) => {
    setEditingSong(song)
    setSelectedChords(song.chords)
    setCurrentView('song-builder')
  }

  const renderCurrentView = () => {
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
      <main className="main">
        {renderCurrentView()}
      </main>
    </div>
  )
}

export default App

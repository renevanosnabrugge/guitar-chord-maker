import { useState, useEffect } from 'react'
import { Chord, Song } from '../../types'
import { ChordChart } from '../ChordChart/ChordChart'
import './SongBuilder.css'

interface SongBuilderProps {
  chords: Chord[]
  selectedChords: string[]
  onUpdateChords: (chords: string[]) => void
  onSaveSong: (song: Song) => void
  editingSong?: Song | null
}

export const SongBuilder: React.FC<SongBuilderProps> = ({
  chords,
  selectedChords,
  onUpdateChords,
  onSaveSong,
  editingSong
}) => {
  const [songName, setSongName] = useState('')
  const [artist, setArtist] = useState('')
  const [key, setKey] = useState('')
  const [notes, setNotes] = useState('')

  // Load editing song data when component mounts or editingSong changes
  useEffect(() => {
    if (editingSong) {
      setSongName(editingSong.name)
      setArtist(editingSong.artist || '')
      setKey(editingSong.metadata?.key || '')
      setNotes(editingSong.metadata?.notes || '')
    } else {
      // Reset form when not editing
      setSongName('')
      setArtist('')
      setKey('')
      setNotes('')
    }
  }, [editingSong])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'custom' | 'major' | 'minor' | 'dominant7' | 'suspended' | 'major7' | 'power' | 'barre'>('all')

  const getChordById = (id: string) => chords.find(chord => chord.id === id)

  const getFilteredChords = () => {
    let filtered = chords.filter(chord => 
      chord.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (filterType !== 'all') {
      filtered = filtered.filter(chord => {
        if (filterType === 'custom') {
          return chord.isCustom
        }
        
        if (chord.isCustom) return false // Only filter default chords by type for non-custom filters
        
        switch (filterType) {
          case 'major':
            return /^[A-G]$/.test(chord.name) && !chord.name.includes('shape)')
          case 'minor':
            return chord.name.includes('m') && !chord.name.includes('maj7') && !chord.name.includes('7') && !chord.name.includes('shape)')
          case 'dominant7':
            return chord.name.includes('7') && !chord.name.includes('maj7') && !chord.name.includes('shape)')
          case 'suspended':
            return chord.name.includes('sus')
          case 'major7':
            return chord.name.includes('maj7')
          case 'power':
            return chord.name.includes('5') && !chord.name.includes('sus') && !chord.name.includes('shape)')
          case 'barre':
            return chord.name.includes('shape)')
          default:
            return true
        }
      })
    }

    return filtered
  }

  const addChord = (chordId: string) => {
    onUpdateChords([...selectedChords, chordId])
  }

  const removeChord = (index: number) => {
    const newChords = [...selectedChords]
    newChords.splice(index, 1)
    onUpdateChords(newChords)
  }

  const moveChord = (fromIndex: number, toIndex: number) => {
    const newChords = [...selectedChords]
    const [movedChord] = newChords.splice(fromIndex, 1)
    newChords.splice(toIndex, 0, movedChord)
    onUpdateChords(newChords)
  }

  const clearSong = () => {
    onUpdateChords([])
    setSongName('')
    setArtist('')
    setKey('')
    setNotes('')
    setSearchTerm('')
    setFilterType('all')
  }

  const handleSave = () => {
    if (!songName.trim()) {
      alert('Please enter a song name')
      return
    }

    if (selectedChords.length === 0) {
      alert('Please add at least one chord to the song')
      return
    }

    const song: Song = {
      id: editingSong ? editingSong.id : `song-${Date.now()}`,
      name: songName.trim(),
      artist: artist.trim() || undefined,
      chords: selectedChords,
      metadata: {
        key: key.trim() || undefined,
        notes: notes.trim() || undefined
      },
      createdDate: editingSong ? editingSong.createdDate : new Date().toISOString().split('T')[0],
      modifiedDate: new Date().toISOString().split('T')[0]
    }

    onSaveSong(song)
  }

  const exportToFile = () => {
    if (!songName.trim() || selectedChords.length === 0) {
      alert('Please complete the song before exporting')
      return
    }

    const song: Song = {
      id: `song-${Date.now()}`,
      name: songName.trim(),
      artist: artist.trim() || undefined,
      chords: selectedChords,
      metadata: {
        key: key.trim() || undefined,
        notes: notes.trim() || undefined
      },
      createdDate: new Date().toISOString().split('T')[0],
      modifiedDate: new Date().toISOString().split('T')[0]
    }

    const dataStr = JSON.stringify(song, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${songName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="song-builder">
      <div className="song-builder__header">
        <h2>{editingSong ? 'Edit Song' : 'Song Builder'}</h2>
      </div>

      {/* Chord Sequence - Full Width */}
      <div className="song-builder__sequence">
        <h3>Chord Sequence</h3>
        {selectedChords.length === 0 ? (
          <div className="song-builder__empty">
            <p>Click on chords below to add them to your song</p>
          </div>
        ) : (
          <div className="song-builder__chord-sequence">
            {selectedChords.map((chordId, index) => {
              const chord = getChordById(chordId)
              if (!chord) return null
              
              return (
                <div key={index} className="song-builder__sequence-item">
                  <div className="song-builder__sequence-chord">
                    <ChordChart chord={chord} size="small" />
                  </div>
                  <div className="song-builder__sequence-actions">
                    {index > 0 && (
                      <button
                        onClick={() => moveChord(index, index - 1)}
                        className="song-builder__sequence-button"
                        title="Move left"
                      >
                        ←
                      </button>
                    )}
                    <button
                      onClick={() => removeChord(index)}
                      className="song-builder__sequence-button song-builder__sequence-button--delete"
                      title="Remove chord"
                    >
                      ×
                    </button>
                    {index < selectedChords.length - 1 && (
                      <button
                        onClick={() => moveChord(index, index + 1)}
                        className="song-builder__sequence-button"
                        title="Move right"
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Chord Selection - Full Width */}
      <div className="song-builder__chord-picker">
        <div className="song-builder__chord-picker-header">
          <h3>Available Chords</h3>
          <div className="song-builder__chord-controls">
            <input
              type="text"
              placeholder="Search chords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="song-builder__search"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'custom' | 'major' | 'minor' | 'dominant7' | 'suspended' | 'major7' | 'power' | 'barre')}
              className="song-builder__filter"
              title="Filter chords by type"
            >
              <option value="all">All Chords</option>
              <option value="custom">Custom Chords</option>
              <option value="major">Major Chords</option>
              <option value="minor">Minor Chords</option>
              <option value="dominant7">Dominant 7th Chords</option>
              <option value="suspended">Suspended Chords</option>
              <option value="major7">Major 7th Chords</option>
              <option value="power">Power Chords</option>
              <option value="barre">Barre Chords</option>
            </select>
          </div>
        </div>
        <div className="song-builder__chord-grid">
          {getFilteredChords().map(chord => (
            <div
              key={chord.id}
              className="song-builder__chord-item"
              onClick={() => addChord(chord.id)}
            >
              <span className="song-builder__chord-name">{chord.name}</span>
              <ChordChart chord={chord} size="small" showName={false} variant="clean" />
            </div>
          ))}
        </div>
      </div>

      {/* Song Information - Full Width */}
      <div className="song-builder__metadata">
        <h3>Song Information</h3>
        <div className="song-builder__form">
          <div className="song-builder__form-row">
            <div className="song-builder__form-group">
              <label htmlFor="song-name">Song Name *</label>
              <input
                id="song-name"
                type="text"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                placeholder="Enter song name"
                className="song-builder__input"
              />
            </div>
            <div className="song-builder__form-group">
              <label htmlFor="artist">Artist</label>
              <input
                id="artist"
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Enter artist name"
                className="song-builder__input"
              />
            </div>
            <div className="song-builder__form-group">
              <label htmlFor="key">Key</label>
              <input
                id="key"
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g., C, Am, F#"
                className="song-builder__input"
              />
            </div>
          </div>

          <div className="song-builder__form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about the song..."
              className="song-builder__textarea"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="song-builder__actions">
        <button
          onClick={clearSong}
          className="song-builder__button song-builder__button--secondary"
        >
          Clear All
        </button>
        <button
          onClick={exportToFile}
          className="song-builder__button song-builder__button--secondary"
        >
          Export to File
        </button>
        <button
          onClick={handleSave}
          className="song-builder__button song-builder__button--primary"
        >
          Save Song
        </button>
      </div>
    </div>
  )
}

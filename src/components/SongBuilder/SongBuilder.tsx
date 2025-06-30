import { useState, useEffect, useRef } from 'react'
import { Chord, Song, StrummingPattern } from '../../types'
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
  
  // Strumming patterns state
  const [showStrummingPatterns, setShowStrummingPatterns] = useState(false)
  const [strummingPatterns, setStrummingPatterns] = useState<StrummingPattern[]>([
    { id: 'general', name: 'General', pattern: '' }
  ])
  const [activePatternId, setActivePatternId] = useState<string | null>(null)
  const patternInputRef = useRef<HTMLDivElement>(null)

  // Load editing song data when component mounts or editingSong changes
  useEffect(() => {
    if (editingSong) {
      setSongName(editingSong.name)
      setArtist(editingSong.artist || '')
      setKey(editingSong.metadata?.key || '')
      setNotes(editingSong.metadata?.notes || '')
      // Load strumming patterns if they exist
      if (editingSong.metadata?.strummingPatterns) {
        setStrummingPatterns(editingSong.metadata.strummingPatterns)
        setShowStrummingPatterns(editingSong.metadata.strummingPatterns.length > 1 || editingSong.metadata.strummingPatterns[0]?.pattern !== '')
      } else {
        setStrummingPatterns([{ id: 'general', name: 'General', pattern: '' }])
        setShowStrummingPatterns(false)
      }
    } else {
      // Reset form when not editing
      setSongName('')
      setArtist('')
      setKey('')
      setNotes('')
      setStrummingPatterns([{ id: 'general', name: 'General', pattern: '' }])
      setShowStrummingPatterns(false)
    }
    setActivePatternId(null)
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
    setStrummingPatterns([{ id: 'general', name: 'General', pattern: '' }])
    setShowStrummingPatterns(false)
    setActivePatternId(null)
  }

  // Strumming pattern functions
  const addStrummingPattern = () => {
    const newId = `pattern-${Date.now()}`
    const newPattern: StrummingPattern = {
      id: newId,
      name: `Pattern ${strummingPatterns.length + 1}`,
      pattern: ''
    }
    setStrummingPatterns([...strummingPatterns, newPattern])
  }

  const updatePatternName = (id: string, name: string) => {
    setStrummingPatterns(patterns => 
      patterns.map(p => p.id === id ? { ...p, name } : p)
    )
  }

  const updatePatternContent = (id: string, pattern: string) => {
    setStrummingPatterns(patterns => 
      patterns.map(p => p.id === id ? { ...p, pattern } : p)
    )
  }

  const removeStrummingPattern = (id: string) => {
    if (strummingPatterns.length > 1) {
      setStrummingPatterns(patterns => patterns.filter(p => p.id !== id))
      if (activePatternId === id) {
        setActivePatternId(null)
      }
    }
  }

  const handlePatternKeyDown = (e: React.KeyboardEvent, patternId: string) => {
    e.preventDefault()
    const pattern = strummingPatterns.find(p => p.id === patternId)
    if (!pattern) return

    let newChar = ''
    switch (e.key) {
      case 'ArrowUp':
        newChar = 'U'
        break
      case 'ArrowDown':
        newChar = 'D'
        break
      case 'x':
      case 'X':
        newChar = 'X'
        break
      case ' ':
        newChar = '-'
        break
      case 'Backspace':
        updatePatternContent(patternId, pattern.pattern.slice(0, -1))
        return
      case 'Delete':
        updatePatternContent(patternId, '')
        return
      default:
        return
    }

    if (newChar) {
      updatePatternContent(patternId, pattern.pattern + newChar)
    }
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
        notes: notes.trim() || undefined,
        strummingPatterns: strummingPatterns.filter(p => p.pattern.trim() !== '' || p.name !== 'General')
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
        <div className="song-builder__sequence-header">
          <h3>Chord Sequence</h3>
          <button
            onClick={() => setShowStrummingPatterns(!showStrummingPatterns)}
            className={`song-builder__toggle-button ${showStrummingPatterns ? 'song-builder__toggle-button--active' : ''}`}
          >
            {showStrummingPatterns ? 'Hide' : 'Show'} Strumming Patterns
          </button>
        </div>
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

      {/* Strumming Patterns Section */}
      {showStrummingPatterns && (
        <div className="song-builder__strumming">
          <div className="song-builder__strumming-header">
            <h3>Strumming Patterns</h3>
            <button
              onClick={addStrummingPattern}
              className="song-builder__add-pattern-button"
            >
              Add Pattern
            </button>
          </div>
          
          <div className="song-builder__patterns">
            {strummingPatterns.map(pattern => (
              <div key={pattern.id} className="song-builder__pattern">
                <div className="song-builder__pattern-header">
                  <input
                    type="text"
                    value={pattern.name}
                    onChange={(e) => updatePatternName(pattern.id, e.target.value)}
                    className="song-builder__pattern-name"
                    placeholder="Pattern name"
                  />
                  {strummingPatterns.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete the pattern "${pattern.name}"?`)) {
                          removeStrummingPattern(pattern.id)
                        }
                      }}
                      className="song-builder__remove-pattern-button"
                      title="Delete pattern"
                    >
                      ×
                    </button>
                  )}
                </div>
                
                <div
                  className={`song-builder__pattern-input ${activePatternId === pattern.id ? 'song-builder__pattern-input--active' : ''}`}
                  tabIndex={0}
                  onKeyDown={(e) => handlePatternKeyDown(e, pattern.id)}
                  onFocus={() => setActivePatternId(pattern.id)}
                  onBlur={() => setActivePatternId(null)}
                >
                  {pattern.pattern || (
                    <span className="song-builder__pattern-placeholder">
                      Use arrow keys and X for pattern...
                    </span>
                  )}
                </div>
                
                <div className="song-builder__pattern-display">
                  {pattern.pattern.split('').map((char, index) => (
                    <span
                      key={index}
                      className={`song-builder__pattern-char song-builder__pattern-char--${char.toLowerCase()}`}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="song-builder__pattern-legend">
            <h4>Pattern Legend:</h4>
            <div className="song-builder__legend-items">
              <span className="song-builder__legend-item">
                <kbd>↑</kbd> = U (Up strum)
              </span>
              <span className="song-builder__legend-item">
                <kbd>↓</kbd> = D (Down strum)
              </span>
              <span className="song-builder__legend-item">
                <kbd>X</kbd> = X (Muted strum)
              </span>
              <span className="song-builder__legend-item">
                <kbd>Space</kbd> = - (Pause/Rest)
              </span>
              <span className="song-builder__legend-item">
                <kbd>Backspace</kbd> = Remove last
              </span>
              <span className="song-builder__legend-item">
                <kbd>Delete</kbd> = Clear all
              </span>
            </div>
          </div>
        </div>
      )}

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

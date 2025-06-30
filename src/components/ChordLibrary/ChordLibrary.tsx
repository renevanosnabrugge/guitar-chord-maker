import { useState } from 'react'
import { Chord } from '../../types'
import { ChordChart } from '../ChordChart/ChordChart'
import './ChordLibrary.css'

interface ChordLibraryProps {
  chords: Chord[]
  onSelectChord: (chordId: string) => void
  onEditChord: (chord: Chord) => void
  onDeleteChord: (chordId: string) => void
}

export const ChordLibrary: React.FC<ChordLibraryProps> = ({
  chords,
  onSelectChord,
  onEditChord,
  onDeleteChord
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'default' | 'custom'>('all')

  const filteredChords = chords.filter(chord => {
    const matchesSearch = chord.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || 
      (filterType === 'default' && !chord.isCustom) ||
      (filterType === 'custom' && chord.isCustom)
    
    return matchesSearch && matchesFilter
  })

  const defaultChords = filteredChords.filter(chord => !chord.isCustom)
  const customChords = filteredChords.filter(chord => chord.isCustom)

  return (
    <div className="chord-library">
      <div className="chord-library__header">
        <h2>Chord Library</h2>
        <div className="chord-library__controls">
          <input
            type="text"
            placeholder="Search chords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="chord-library__search"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'default' | 'custom')}
            className="chord-library__filter"
          >
            <option value="all">All Chords</option>
            <option value="default">Default Chords</option>
            <option value="custom">Custom Chords</option>
          </select>
        </div>
      </div>

      {filterType !== 'custom' && defaultChords.length > 0 && (
        <div className="chord-library__section">
          <h3>Default Chords</h3>
          <div className="chord-library__grid">
            {defaultChords.map(chord => (
              <div key={chord.id} className="chord-library__item">
                <ChordChart chord={chord} size="small" />
                <div className="chord-library__actions">
                  <button
                    onClick={() => onSelectChord(chord.id)}
                    className="chord-library__action chord-library__action--select"
                  >
                    Add to Song
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filterType !== 'default' && customChords.length > 0 && (
        <div className="chord-library__section">
          <h3>Custom Chords</h3>
          <div className="chord-library__grid">
            {customChords.map(chord => (
              <div key={chord.id} className="chord-library__item">
                <ChordChart chord={chord} size="small" />
                <div className="chord-library__actions">
                  <button
                    onClick={() => onSelectChord(chord.id)}
                    className="chord-library__action chord-library__action--select"
                  >
                    Add to Song
                  </button>
                  <button
                    onClick={() => onEditChord(chord)}
                    className="chord-library__action chord-library__action--edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete the chord "${chord.name}"?`)) {
                        onDeleteChord(chord.id)
                      }
                    }}
                    className="chord-library__action chord-library__action--delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredChords.length === 0 && (
        <div className="chord-library__empty">
          <p>No chords found. {searchTerm && 'Try adjusting your search term or filter.'}</p>
        </div>
      )}
    </div>
  )
}

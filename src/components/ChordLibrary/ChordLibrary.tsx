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

interface ChordCategory {
  name: string
  chords: Chord[]
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

  const customChords = filteredChords.filter(chord => chord.isCustom)
  const defaultChords = filteredChords.filter(chord => !chord.isCustom)

  // Categorize default chords
  const getChordCategories = (): ChordCategory[] => {
    const categories: ChordCategory[] = [
      {
        name: 'Major Chords',
        chords: defaultChords.filter(chord => 
          /^[A-G]$/.test(chord.name) && !chord.name.includes('shape)')
        )
      },
      {
        name: 'Minor Chords',
        chords: defaultChords.filter(chord => 
          chord.name.includes('m') && !chord.name.includes('maj7') && !chord.name.includes('7') && !chord.name.includes('shape)')
        )
      },
      {
        name: 'Dominant 7th Chords',
        chords: defaultChords.filter(chord => 
          chord.name.includes('7') && !chord.name.includes('maj7') && !chord.name.includes('shape)')
        )
      },
      {
        name: 'Suspended Chords',
        chords: defaultChords.filter(chord => 
          chord.name.includes('sus')
        )
      },
      {
        name: 'Major 7th Chords',
        chords: defaultChords.filter(chord => 
          chord.name.includes('maj7')
        )
      },
      {
        name: 'Power Chords',
        chords: defaultChords.filter(chord => 
          chord.name.includes('5') && !chord.name.includes('sus') && !chord.name.includes('shape)')
        )
      },
      {
        name: 'Barre Chords',
        chords: defaultChords.filter(chord => 
          chord.name.includes('shape)')
        )
      }
    ]

    // Filter out empty categories
    return categories.filter(category => category.chords.length > 0)
  }

  const chordCategories = getChordCategories()

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
            title="Filter chords by type"
          >
            <option value="all">All Chords</option>
            <option value="default">Default Chords</option>
            <option value="custom">Custom Chords</option>
          </select>
        </div>
      </div>

      {filterType !== 'custom' && chordCategories.map(category => (
        <div key={category.name} className="chord-library__section">
          <h3>{category.name}</h3>
          <div className="chord-library__grid">
            {category.chords.map(chord => (
              <ChordChart 
                key={chord.id} 
                chord={chord} 
                size="small" 
              />
            ))}
          </div>
        </div>
      ))}

      {filterType !== 'default' && customChords.length > 0 && (
        <div className="chord-library__section">
          <h3>Custom Chords</h3>
          <div className="chord-library__grid">
            {customChords.map(chord => (
              <div key={chord.id} className="chord-library__custom-item">
                <ChordChart chord={chord} size="small" />
                <div className="chord-library__actions">
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

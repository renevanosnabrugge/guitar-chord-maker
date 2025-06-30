import { useState } from 'react'
import { Song, Chord } from '../../types'
import { ChordChart } from '../ChordChart/ChordChart'
import './SongLibrary.css'

interface SongLibraryProps {
  songs: Song[]
  chords: Chord[]
  onDeleteSong: (songId: string) => void
  onEditSong: (song: Song) => void
}

export const SongLibrary: React.FC<SongLibraryProps> = ({
  songs,
  chords,
  onDeleteSong,
  onEditSong
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'artist' | 'date'>('name')
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)

  const getChordById = (id: string) => chords.find(chord => chord.id === id)

  const filteredAndSortedSongs = songs
    .filter(song => 
      song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.artist && song.artist.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'artist':
          return (a.artist || '').localeCompare(b.artist || '')
        case 'date':
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        default:
          return 0
      }
    })

  const handleExportSong = (song: Song) => {
    const dataStr = JSON.stringify(song, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${song.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportSong = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const song: Song = JSON.parse(e.target?.result as string)
            // Validate the song structure
            if (song.name && song.chords && Array.isArray(song.chords)) {
              // Add imported song to library (this would need to be handled by parent component)
              alert('Song imported successfully! (Note: This demo doesn\'t persist imported songs)')
            } else {
              alert('Invalid song file format')
            }
          } catch (error) {
            alert('Error reading song file')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const getDifficultyText = (difficulty: number) => {
    const levels = ['Unknown', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert']
    return levels[difficulty] || 'Unknown'
  }

  if (selectedSong) {
    return (
      <div className="song-library">
        <div className="song-library__viewer">
          <div className="song-library__viewer-header">
            <div>
              <h2>{selectedSong.name}</h2>
              {selectedSong.artist && <p className="song-library__artist">{selectedSong.artist}</p>}
            </div>
            <button
              onClick={() => setSelectedSong(null)}
              className="song-library__button song-library__button--secondary"
            >
              Back to Library
            </button>
          </div>

          <div className="song-library__viewer-content">
            <div className="song-library__metadata">
              <h3>Song Information</h3>
              <div className="song-library__metadata-grid">
                {selectedSong.metadata.key && (
                  <div className="song-library__metadata-item">
                    <label>Key:</label>
                    <span>{selectedSong.metadata.key}</span>
                  </div>
                )}
                {selectedSong.metadata.tempo && (
                  <div className="song-library__metadata-item">
                    <label>Tempo:</label>
                    <span>{selectedSong.metadata.tempo} BPM</span>
                  </div>
                )}
                <div className="song-library__metadata-item">
                  <label>Difficulty:</label>
                  <span>{getDifficultyText(selectedSong.metadata.difficulty || 1)}</span>
                </div>
                {selectedSong.metadata.tags && selectedSong.metadata.tags.length > 0 && (
                  <div className="song-library__metadata-item">
                    <label>Tags:</label>
                    <span>{selectedSong.metadata.tags.join(', ')}</span>
                  </div>
                )}
              </div>
              {selectedSong.metadata.notes && (
                <div className="song-library__notes">
                  <label>Notes:</label>
                  <p>{selectedSong.metadata.notes}</p>
                </div>
              )}
            </div>

            <div className="song-library__chord-sequence">
              <h3>Chord Sequence</h3>
              <div className="song-library__chords">
                {selectedSong.chords.map((chordId, index) => {
                  const chord = getChordById(chordId)
                  if (!chord) return <div key={index}>Unknown chord</div>
                  
                  return (
                    <div key={index} className="song-library__chord-item">
                      <ChordChart chord={chord} size="medium" />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Strumming Patterns Section */}
            {selectedSong.metadata.strummingPatterns && selectedSong.metadata.strummingPatterns.length > 0 && (
              <div className="song-library__strumming-patterns">
                <h3>Strumming Patterns</h3>
                <div className="song-library__patterns">
                  {selectedSong.metadata.strummingPatterns.map((pattern) => (
                    <div key={pattern.id} className="song-library__pattern">
                      <div className="song-library__pattern-header">
                        <h4>{pattern.name}</h4>
                      </div>
                      <div className="song-library__pattern-display">
                        {pattern.pattern.split('').map((char, index) => (
                          <span
                            key={index}
                            className={`song-library__pattern-char song-library__pattern-char--${char.toLowerCase()}`}
                          >
                            {char}
                          </span>
                        ))}
                        {pattern.pattern === '' && (
                          <span className="song-library__pattern-empty">No pattern set</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="song-library__pattern-legend">
                  <div className="song-library__legend-items">
                    <span className="song-library__legend-item">
                      <span className="song-library__pattern-char song-library__pattern-char--u">U</span>
                      Up strum
                    </span>
                    <span className="song-library__legend-item">
                      <span className="song-library__pattern-char song-library__pattern-char--d">D</span>
                      Down strum
                    </span>
                    <span className="song-library__legend-item">
                      <span className="song-library__pattern-char song-library__pattern-char--x">X</span>
                      Muted strum
                    </span>
                    <span className="song-library__legend-item">
                      <span className="song-library__pattern-char song-library__pattern-char---">-</span>
                      Pause/Rest
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="song-library__viewer-actions">
              <button
                onClick={() => onEditSong(selectedSong)}
                className="song-library__button song-library__button--primary"
              >
                Edit Song
              </button>
              <button
                onClick={() => handleExportSong(selectedSong)}
                className="song-library__button song-library__button--secondary"
              >
                Export Song
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="song-library">
      <div className="song-library__header">
        <h2>Song Library</h2>
        <div className="song-library__controls">
          <input
            type="text"
            placeholder="Search songs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="song-library__search"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'artist' | 'date')}
            className="song-library__select"
            title="Sort songs by"
          >
            <option value="name">Sort by Name</option>
            <option value="artist">Sort by Artist</option>
            <option value="date">Sort by Date</option>
          </select>
          <button
            onClick={handleImportSong}
            className="song-library__button song-library__button--secondary"
          >
            Import Song
          </button>
        </div>
      </div>

      {filteredAndSortedSongs.length === 0 ? (
        <div className="song-library__empty">
          <p>
            {songs.length === 0 
              ? 'No songs in your library yet. Create your first song!' 
              : 'No songs match your search criteria.'
            }
          </p>
        </div>
      ) : (
        <div className="song-library__grid">
          {filteredAndSortedSongs.map(song => (
            <div key={song.id} className="song-library__card">
              <div className="song-library__card-header">
                <h3 className="song-library__song-name">{song.name}</h3>
                {song.artist && (
                  <p className="song-library__song-artist">{song.artist}</p>
                )}
              </div>

              <div className="song-library__card-content">
                <div className="song-library__song-info">
                  <div className="song-library__song-meta">
                    <span>{song.chords.length} chords</span>
                    {song.metadata.strummingPatterns && song.metadata.strummingPatterns.length > 0 && (
                      <span>• 🎵 Patterns</span>
                    )}
                    {song.metadata.difficulty && (
                      <span>• {getDifficultyText(song.metadata.difficulty)}</span>
                    )}
                    {song.metadata.key && (
                      <span>• Key: {song.metadata.key}</span>
                    )}
                  </div>
                  <div className="song-library__song-date">
                    Created: {new Date(song.createdDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="song-library__chord-preview">
                  {song.chords.slice(0, 6).map((chordId, index) => {
                    const chord = getChordById(chordId)
                    if (!chord) return null
                    
                    return (
                      <span key={index} className="song-library__chord-name">
                        {chord.name}
                      </span>
                    )
                  })}
                  {song.chords.length > 6 && (
                    <span className="song-library__chord-more">
                      +{song.chords.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              <div className="song-library__card-actions">
                <button
                  onClick={() => setSelectedSong(song)}
                  className="song-library__action song-library__action--view"
                >
                  View
                </button>
                <button
                  onClick={() => onEditSong(song)}
                  className="song-library__action song-library__action--edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleExportSong(song)}
                  className="song-library__action song-library__action--export"
                >
                  Export
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${song.name}"?`)) {
                      onDeleteSong(song.id)
                    }
                  }}
                  className="song-library__action song-library__action--delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

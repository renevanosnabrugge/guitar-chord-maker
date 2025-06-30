import { useState, useEffect } from 'react'
import { Chord } from '../../types'
import { ChordChart } from '../ChordChart/ChordChart'
import './ChordEditor.css'

interface ChordEditorProps {
  chord?: Chord | null
  onSave: (chord: Chord) => void
  onCancel: () => void
}

export const ChordEditor: React.FC<ChordEditorProps> = ({
  chord,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState('')
  const [frets, setFrets] = useState<number[]>([0, 0, 0, 0, 0, 0])
  const [fingers, setFingers] = useState<number[]>([0, 0, 0, 0, 0, 0])

  useEffect(() => {
    if (chord) {
      setName(chord.name)
      setFrets([...chord.frets])
      setFingers([...chord.fingers])
    } else {
      setName('')
      setFrets([0, 0, 0, 0, 0, 0])
      setFingers([0, 0, 0, 0, 0, 0])
    }
  }, [chord])

  const stringNames = ['E', 'A', 'D', 'G', 'B', 'E']
  const maxFrets = 12

  const handleFretChange = (stringIndex: number, fret: number) => {
    const newFrets = [...frets]
    newFrets[stringIndex] = fret
    setFrets(newFrets)
    
    // Auto-assign finger if not muted or open
    if (fret > 0) {
      const newFingers = [...fingers]
      if (newFingers[stringIndex] === 0) {
        newFingers[stringIndex] = 1 // Default to index finger
      }
      setFingers(newFingers)
    } else {
      const newFingers = [...fingers]
      newFingers[stringIndex] = 0
      setFingers(newFingers)
    }
  }

  const handleFingerChange = (stringIndex: number, finger: number) => {
    const newFingers = [...fingers]
    newFingers[stringIndex] = finger
    setFingers(newFingers)
  }

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a chord name')
      return
    }

    const newChord: Chord = {
      id: chord?.id || `chord-${Date.now()}`,
      name: name.trim(),
      frets,
      fingers,
      isCustom: true,
      createdDate: chord?.createdDate || new Date().toISOString().split('T')[0]
    }

    onSave(newChord)
  }

  const handleClear = () => {
    setFrets([0, 0, 0, 0, 0, 0])
    setFingers([0, 0, 0, 0, 0, 0])
  }

  const previewChord: Chord = {
    id: 'preview',
    name: name || 'Preview',
    frets,
    fingers,
    isCustom: true,
    createdDate: new Date().toISOString().split('T')[0]
  }

  return (
    <div className="chord-editor">
      <div className="chord-editor__header">
        <h2>{chord ? 'Edit Chord' : 'Create New Chord'}</h2>
      </div>

      <div className="chord-editor__content">
        <div className="chord-editor__controls">
          <div className="chord-editor__name-input">
            <label htmlFor="chord-name">Chord Name:</label>
            <input
              id="chord-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter chord name (e.g., Am7, F#m)"
              className="chord-editor__input"
            />
          </div>

          <div className="chord-editor__fretboard">
            <h3>Fretboard Editor</h3>
            <div className="chord-editor__strings">
              {stringNames.map((stringName, stringIndex) => (
                <div key={stringIndex} className="chord-editor__string">
                  <div className="chord-editor__string-header">
                    <span className="chord-editor__string-name">{stringName}</span>
                  </div>
                  
                  <div className="chord-editor__fret-controls">
                    <label>Fret:</label>
                    <select
                      value={frets[stringIndex]}
                      onChange={(e) => handleFretChange(stringIndex, parseInt(e.target.value))}
                      className="chord-editor__select"
                    >
                      <option value={-1}>× (Muted)</option>
                      <option value={0}>0 (Open)</option>
                      {Array.from({ length: maxFrets }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  {frets[stringIndex] > 0 && (
                    <div className="chord-editor__finger-controls">
                      <label>Finger:</label>
                      <select
                        value={fingers[stringIndex]}
                        onChange={(e) => handleFingerChange(stringIndex, parseInt(e.target.value))}
                        className="chord-editor__select"
                      >
                        <option value={0}>None</option>
                        <option value={1}>1 (Index)</option>
                        <option value={2}>2 (Middle)</option>
                        <option value={3}>3 (Ring)</option>
                        <option value={4}>4 (Pinky)</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="chord-editor__actions">
            <button onClick={handleClear} className="chord-editor__button chord-editor__button--secondary">
              Clear All
            </button>
            <button onClick={onCancel} className="chord-editor__button chord-editor__button--secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="chord-editor__button chord-editor__button--primary">
              {chord ? 'Update Chord' : 'Save Chord'}
            </button>
          </div>
        </div>

        <div className="chord-editor__preview">
          <h3>Preview</h3>
          <ChordChart chord={previewChord} size="large" />
        </div>
      </div>
    </div>
  )
}

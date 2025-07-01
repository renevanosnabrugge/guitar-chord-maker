import React, { useState, useEffect } from 'react'
import { Chord } from '../../types'
import './ChordEditor.css'

interface ChordEditorProps {
  chord?: Chord | null
  onSave: (_chord: Chord) => void
  onCancel: () => void
}

interface ClickableChordChartProps {
  chord: Chord
  onFretClick: (_stringIndex: number, _fret: number) => void
  startingFret: number
}

const ClickableChordChart: React.FC<ClickableChordChartProps> = ({ 
  chord, 
  onFretClick, 
  startingFret 
}) => {
  const stringNames = ['E', 'A', 'D', 'G', 'B', 'E']
  const fretCount = 4
  
  // Size settings for clickable SVG
  const width = 220
  const height = 180
  const cellWidth = 30
  const cellHeight = 30
  const fontSize = 14
  
  const showFretNumber = startingFret > 1

  const handleCellClick = (stringIndex: number, fretPosition: number) => {
    const actualFret = fretPosition === -1 ? 0 : startingFret + fretPosition
    onFretClick(stringIndex, actualFret)
  }

  return (
    <div className="chord-chart chord-chart--large clickable-chord-chart">
      <div className="chord-chart__diagram">
        <svg width={width} height={height} className="chord-chart__svg">
          {/* Background */}
          <rect width="100%" height="100%" fill="white" stroke="black" strokeWidth="1" />
          
          {/* String names */}
          {stringNames.map((string, index) => (
            <text
              key={`string-${index}`}
              x={30 + index * cellWidth}
              y={20}
              textAnchor="middle"
              fontSize={fontSize - 2}
              fill="black"
              fontWeight="normal"
            >
              {string}
            </text>
          ))}
          
          {/* Fret position indicator */}
          {showFretNumber && (
            <text
              x={15}
              y={45}
              fontSize={fontSize - 2}
              fill="black"
              fontWeight="bold"
              textAnchor="middle"
            >
              {startingFret}fr
            </text>
          )}
          
          {/* Grid lines - Vertical (strings) */}
          {stringNames.map((_, index) => (
            <line
              key={`vline-${index}`}
              x1={30 + index * cellWidth}
              y1={30}
              x2={30 + index * cellWidth}
              y2={30 + (fretCount + 1) * cellHeight}
              stroke="black"
              strokeWidth="1"
            />
          ))}
          
          {/* Grid lines - Horizontal (frets) */}
          {Array.from({ length: fretCount + 2 }, (_, index) => (
            <line
              key={`hline-${index}`}
              x1={30}
              y1={30 + index * cellHeight}
              x2={30 + 5 * cellWidth}
              y2={30 + index * cellHeight}
              stroke="black"
              strokeWidth={index === 0 ? "3" : "1"}
            />
          ))}
          
          {/* Clickable areas for open string / muted */}
          {stringNames.map((_, stringIndex) => {
            const x = 30 + stringIndex * cellWidth
            const y = 30
            return (
              <rect
                key={`open-click-${stringIndex}`}
                x={x - cellWidth/2}
                y={y - 15}
                width={cellWidth}
                height={15}
                fill="transparent"
                className="clickable-area"
                onClick={() => handleCellClick(stringIndex, -1)}
              >
                <title>{`Click to toggle open/muted for ${stringNames[stringIndex]} string`}</title>
              </rect>
            )
          })}
          
          {/* Clickable grid cells */}
          {Array.from({ length: fretCount }, (_, fretIndex) =>
            stringNames.map((_, stringIndex) => {
              const x = 30 + stringIndex * cellWidth
              const y = 30 + (fretIndex + 1) * cellHeight
              return (
                <rect
                  key={`cell-${stringIndex}-${fretIndex}`}
                  x={x - cellWidth/2}
                  y={y - cellHeight/2}
                  width={cellWidth}
                  height={cellHeight}
                  fill="transparent"
                  className="clickable-area"
                  onClick={() => handleCellClick(stringIndex, fretIndex)}
                >
                  <title>{`Click to set fret ${startingFret + fretIndex} on ${stringNames[stringIndex]} string`}</title>
                </rect>
              )
            })
          )}
          
          {/* Open/muted strings above nut */}
          {chord.frets.map((fret, stringIndex) => {
            const x = 30 + stringIndex * cellWidth
            const y = 30
            
            if (fret === 0) {
              // Open string
              return (
                <circle
                  key={`open-${stringIndex}`}
                  cx={x}
                  cy={y - 10}
                  r={6}
                  fill="white"
                  stroke="black"
                  strokeWidth="2"
                />
              )
            } else if (fret === -1) {
              // Muted string
              return (
                <text
                  key={`muted-${stringIndex}`}
                  x={x}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize={fontSize + 2}
                  fill="#ff4757"
                  fontWeight="bold"
                >
                  ×
                </text>
              )
            }
            return null
          })}
          
          {/* Finger positions */}
          {chord.frets.map((fret, stringIndex) => {
            if (fret <= 0) return null
            
            const fretPosition = fret - startingFret
            if (fretPosition < 0 || fretPosition >= fretCount) return null
            
            const x = 30 + stringIndex * cellWidth
            const y = 30 + (fretPosition + 0.5) * cellHeight
            
            return (
              <g key={`finger-${stringIndex}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={cellHeight * 0.3}
                  fill="black"
                />
                {chord.fingers[stringIndex] && (
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    fontSize={fontSize - 4}
                    fill="white"
                    fontWeight="bold"
                  >
                    {chord.fingers[stringIndex]}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export const ChordEditor: React.FC<ChordEditorProps> = ({
  chord,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState('')
  const [frets, setFrets] = useState<number[]>([0, 0, 0, 0, 0, 0])
  const [fingers, setFingers] = useState<number[]>([0, 0, 0, 0, 0, 0])
  const [startingFret, setStartingFret] = useState(1)

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

  const handleFretClick = (stringIndex: number, fret: number) => {
    if (fret === 0) {
      // Toggle between open (0) and muted (-1)
      const currentFret = frets[stringIndex]
      if (currentFret === 0) {
        handleFretChange(stringIndex, -1) // Set to muted
      } else if (currentFret === -1) {
        handleFretChange(stringIndex, 0) // Set to open
      } else {
        handleFretChange(stringIndex, 0) // Set to open from any fret
      }
    } else {
      // Check if clicking on the same fret to remove it
      if (frets[stringIndex] === fret) {
        handleFretChange(stringIndex, 0) // Remove fret (set to open)
      } else {
        handleFretChange(stringIndex, fret) // Set new fret
      }
    }
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
                      title={`Select fret for ${stringName} string`}
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
                        title={`Select finger for ${stringName} string`}
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
          <div className="chord-editor__preview-header">
            <label htmlFor="starting-fret">Starting Fret:</label>
            <select
              id="starting-fret"
              value={startingFret}
              onChange={(e) => setStartingFret(parseInt(e.target.value))}
              className="chord-editor__select"
              title="Select the starting fret for the chord diagram"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}fr
                </option>
              ))}
            </select>
          </div>
          <div className="chord-editor__preview-note">
            Click on the diagram to add/remove finger positions
          </div>
          <ClickableChordChart 
            chord={previewChord} 
            onFretClick={handleFretClick}
            startingFret={startingFret}
          />
        </div>
      </div>
    </div>
  )
}

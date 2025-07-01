import React from 'react'
import { Chord } from '../../types'
import './ChordChart.css'

interface ChordChartProps {
  chord: Chord
  size?: 'tiny' | 'small' | 'medium' | 'large'
  showName?: boolean
  variant?: 'default' | 'clean'
}

export const ChordChart: React.FC<ChordChartProps> = ({ 
  chord, 
  size = 'medium', 
  showName = true,
  variant = 'default'
}) => {
  const stringNames = ['E', 'A', 'D', 'G', 'B', 'E']
  const activeFrets = chord.frets.filter(fret => fret > 0)
  const minFret = activeFrets.length > 0 ? Math.min(...activeFrets) : 1
  const maxFret = activeFrets.length > 0 ? Math.max(...activeFrets) : 4
  
  // Determine the starting fret and number of frets to show (max 4)
  let startFret = 1
  let fretCount = 4
  
  if (minFret > 4) {
    // For higher position chords, start from the lowest fret
    startFret = minFret
    fretCount = Math.min(4, maxFret - minFret + 1)
  } else if (maxFret > 4) {
    // If chord spans beyond 4th fret, adjust to show relevant range
    startFret = Math.max(1, maxFret - 3)
    fretCount = 4
  }
  
  const showFretNumber = startFret > 1
  
  // Size settings for SVG
  const sizeSettings = {
    tiny: { width: 45, height: 36, cellWidth: 6, cellHeight: 6, fontSize: 6 },
    small: { width: 150, height: 120, cellWidth: 20, cellHeight: 20, fontSize: 10 },
    medium: { width: 180, height: 140, cellWidth: 24, cellHeight: 24, fontSize: 12 },
    large: { width: 220, height: 180, cellWidth: 30, cellHeight: 30, fontSize: 14 }
  }
  
  const { width, height, cellWidth, cellHeight, fontSize } = sizeSettings[size]
  
  const getSizeClass = () => {
    const sizeClass = size === 'tiny' ? 'chord-chart--tiny'
                    : size === 'small' ? 'chord-chart--small' 
                    : size === 'large' ? 'chord-chart--large'
                    : 'chord-chart--medium'
    const variantClass = variant === 'clean' ? 'chord-chart--clean' : ''
    return `${sizeClass} ${variantClass}`.trim()
  }

  return (
    <div className={`chord-chart ${getSizeClass()}`}>
      {showName && <div className="chord-chart__name">{chord.name}</div>}
      
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
              {startFret}fr
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
            
            const fretPosition = fret - startFret
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

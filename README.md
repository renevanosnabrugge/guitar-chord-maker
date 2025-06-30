# Guitar Chord Maker

A modern web application for creating, managing, and organizing guitar chords and songs. Built with React, TypeScript, and Vite.

## Features

### 🎸 Chord Management
- **Interactive Chord Editor**: Create custom chords using an interactive fretboard
- **Chord Library**: Browse default and custom chords with visual chord charts
- **Chord Visualization**: Display chords as standard guitar chord diagrams
- **Custom Chord Storage**: Save and organize your custom chord creations

### 🎵 Song Building
- **Song Builder**: Combine chords into sequences to create songs
- **Drag and Drop**: Easily arrange chord progressions
- **Song Metadata**: Add artist, key, tempo, difficulty, and notes
- **Song Preview**: Visual representation of your chord sequences

### 📚 Library Management
- **Song Library**: Personal collection of saved songs
- **Search and Filter**: Find songs and chords quickly
- **Import/Export**: Save songs as JSON files for backup and sharing
- **CRUD Operations**: Create, read, update, and delete songs and chords

## Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chordmaker.git
cd chordmaker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── ChordChart/          # Chord visualization component
│   │   ├── ChordChart.tsx
│   │   └── ChordChart.css
│   ├── ChordEditor/         # Interactive chord creation
│   │   ├── ChordEditor.tsx
│   │   └── ChordEditor.css
│   ├── ChordLibrary/        # Chord browsing and management
│   │   ├── ChordLibrary.tsx
│   │   └── ChordLibrary.css
│   ├── SongBuilder/         # Song creation interface
│   │   ├── SongBuilder.tsx
│   │   └── SongBuilder.css
│   └── SongLibrary/         # Song management and viewing
│       ├── SongLibrary.tsx
│       └── SongLibrary.css
├── data/
│   └── defaultChords.ts     # Default chord definitions
├── types.ts                 # TypeScript type definitions
├── App.tsx                  # Main application component
├── App.css                  # Application styles
├── main.tsx                 # Application entry point
└── index.css                # Global styles
```

## Usage Guide

### Creating Custom Chords

1. Navigate to the "Create Chord" tab
2. Enter a name for your chord
3. Use the fretboard editor to select fret positions for each string:
   - Select "× (Muted)" for strings that shouldn't be played
   - Select "0 (Open)" for open strings
   - Select fret numbers 1-12 for fretted positions
4. Assign finger numbers (1-4) for fretted positions
5. Preview your chord in real-time
6. Click "Save Chord" to add it to your library

### Building Songs

1. Go to the "Build Song" tab
2. Fill in song information (name, artist, key, etc.)
3. Click on chords from the left panel to add them to your sequence
4. Use the arrow buttons to reorder chords
5. Use the × button to remove unwanted chords
6. Click "Save Song" to add it to your library
7. Optionally, click "Export to File" to save as JSON

### Managing Your Library

- **Chord Library**: View all available chords, search, and filter by type
- **Song Library**: Browse saved songs, view details, edit, or delete
- **Import Songs**: Load previously exported JSON files
- **Search**: Use the search box to quickly find songs or chords

## Data Format

### Chord Structure
```typescript
interface Chord {
  id: string
  name: string
  frets: number[]     // Array of 6 numbers: fret positions (0=open, -1=muted)
  fingers: number[]   // Array of 6 numbers: finger positions (0=none, 1-4=fingers)
  isCustom: boolean
  createdDate: string
}
```

### Song Structure
```typescript
interface Song {
  id: string
  name: string
  artist?: string
  chords: string[]    // Array of chord IDs
  metadata: {
    key?: string
    tempo?: number
    difficulty?: number
    tags?: string[]
    notes?: string
  }
  createdDate: string
  modifiedDate: string
}
```

## Technologies Used

- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and development server
- **CSS**: Styling with modern CSS features
- **HTML5 File API**: Local file operations

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## Development Roadmap

### Phase 1: Core Features ✅
- [x] Basic chord creation and editing
- [x] Chord library management
- [x] Song building interface
- [x] Local file export/import

### Phase 2: Enhanced Features (Future)
- [ ] Audio playback for chords
- [ ] Chord progression suggestions
- [ ] Advanced chord types (7th, 9th, etc.)
- [ ] Rhythm notation
- [ ] Tab notation export
- [ ] Cloud storage integration

### Phase 3: Advanced Features (Future)
- [ ] Collaborative editing
- [ ] Public chord/song sharing
- [ ] Mobile app version
- [ ] MIDI integration
- [ ] Advanced music theory features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by traditional guitar chord charts and songbooks
- Built with modern web technologies for the best user experience
- Community-driven development for guitarists, by guitarists

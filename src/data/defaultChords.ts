import { Chord } from '../types'

export const defaultChords: Chord[] = [
  // MAJOR CHORDS
  {
    id: 'c-major',
    name: 'C',
    frets: [-1, 3, 2, 0, 1, 0],
    fingers: [0, 3, 2, 0, 1, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'd-major',
    name: 'D',
    frets: [-1, -1, 0, 2, 3, 2],
    fingers: [0, 0, 0, 1, 3, 2],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'e-major',
    name: 'E',
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'f-major',
    name: 'F',
    frets: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'g-major',
    name: 'G',
    frets: [3, 2, 0, 0, 3, 3],
    fingers: [3, 2, 0, 0, 4, 4],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'a-major',
    name: 'A',
    frets: [-1, 0, 2, 2, 2, 0],
    fingers: [0, 0, 1, 2, 3, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'b-major',
    name: 'B',
    frets: [-1, 2, 4, 4, 4, 2],
    fingers: [0, 1, 2, 3, 4, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },

  // MINOR CHORDS
  {
    id: 'a-minor',
    name: 'Am',
    frets: [-1, 0, 2, 2, 1, 0],
    fingers: [0, 0, 2, 3, 1, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'd-minor',
    name: 'Dm',
    frets: [-1, -1, 0, 2, 3, 1],
    fingers: [0, 0, 0, 2, 3, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'e-minor',
    name: 'Em',
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'f-minor',
    name: 'Fm',
    frets: [1, 3, 3, 1, 1, 1],
    fingers: [1, 3, 4, 1, 1, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'g-minor',
    name: 'Gm',
    frets: [3, 5, 5, 3, 3, 3],
    fingers: [1, 3, 4, 1, 1, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'c-minor',
    name: 'Cm',
    frets: [-1, 3, 5, 5, 4, 3],
    fingers: [0, 1, 3, 4, 2, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'b-minor',
    name: 'Bm',
    frets: [-1, 2, 4, 4, 3, 2],
    fingers: [0, 1, 3, 4, 2, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },

  // DOMINANT 7TH CHORDS
  {
    id: 'c7',
    name: 'C7',
    frets: [-1, 3, 2, 3, 1, 0],
    fingers: [0, 3, 2, 4, 1, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'd7',
    name: 'D7',
    frets: [-1, -1, 0, 2, 1, 2],
    fingers: [0, 0, 0, 3, 1, 2],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'e7',
    name: 'E7',
    frets: [0, 2, 0, 1, 0, 0],
    fingers: [0, 2, 0, 1, 0, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'f7',
    name: 'F7',
    frets: [1, 3, 1, 2, 1, 1],
    fingers: [1, 3, 1, 2, 1, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'g7',
    name: 'G7',
    frets: [3, 2, 0, 0, 0, 1],
    fingers: [3, 2, 0, 0, 0, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'a7',
    name: 'A7',
    frets: [-1, 0, 2, 0, 2, 0],
    fingers: [0, 0, 2, 0, 3, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'b7',
    name: 'B7',
    frets: [-1, 2, 1, 2, 0, 2],
    fingers: [0, 2, 1, 3, 0, 4],
    isCustom: false,
    createdDate: '2025-06-30'
  },

  // SUSPENDED CHORDS (sus2, sus4)
  {
    id: 'csus2',
    name: 'Csus2',
    frets: [-1, 3, 0, 0, 1, 0],
    fingers: [0, 3, 0, 0, 1, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'csus4',
    name: 'Csus4',
    frets: [-1, 3, 3, 0, 1, 0],
    fingers: [0, 3, 4, 0, 1, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'dsus2',
    name: 'Dsus2',
    frets: [-1, -1, 0, 2, 3, 0],
    fingers: [0, 0, 0, 1, 2, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'dsus4',
    name: 'Dsus4',
    frets: [-1, -1, 0, 2, 3, 3],
    fingers: [0, 0, 0, 1, 2, 3],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'esus2',
    name: 'Esus2',
    frets: [0, 2, 4, 4, 0, 0],
    fingers: [0, 1, 3, 4, 0, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'esus4',
    name: 'Esus4',
    frets: [0, 2, 2, 2, 0, 0],
    fingers: [0, 1, 2, 3, 0, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'asus2',
    name: 'Asus2',
    frets: [-1, 0, 2, 2, 0, 0],
    fingers: [0, 0, 1, 2, 0, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'asus4',
    name: 'Asus4',
    frets: [-1, 0, 2, 2, 3, 0],
    fingers: [0, 0, 1, 2, 3, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },

  // MAJOR 7TH CHORDS
  {
    id: 'cmaj7',
    name: 'Cmaj7',
    frets: [-1, 3, 2, 0, 0, 0],
    fingers: [0, 3, 2, 0, 0, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'dmaj7',
    name: 'Dmaj7',
    frets: [-1, -1, 0, 2, 2, 2],
    fingers: [0, 0, 0, 1, 2, 3],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'emaj7',
    name: 'Emaj7',
    frets: [0, 2, 1, 1, 0, 0],
    fingers: [0, 3, 1, 2, 0, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'fmaj7',
    name: 'Fmaj7',
    frets: [1, 3, 3, 2, 1, 0],
    fingers: [1, 3, 4, 2, 1, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'gmaj7',
    name: 'Gmaj7',
    frets: [3, 2, 0, 0, 0, 2],
    fingers: [3, 2, 0, 0, 0, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'amaj7',
    name: 'Amaj7',
    frets: [-1, 0, 2, 1, 2, 0],
    fingers: [0, 0, 3, 1, 2, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },

  // POWER CHORDS (5 chords)
  {
    id: 'c5',
    name: 'C5',
    frets: [-1, 3, 5, 5, -1, -1],
    fingers: [0, 1, 3, 4, 0, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'd5',
    name: 'D5',
    frets: [-1, -1, 0, 2, 3, -1],
    fingers: [0, 0, 0, 1, 2, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'e5',
    name: 'E5',
    frets: [0, 2, 2, -1, -1, -1],
    fingers: [0, 1, 2, 0, 0, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'f5',
    name: 'F5',
    frets: [1, 3, 3, -1, -1, -1],
    fingers: [1, 3, 4, 0, 0, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'g5',
    name: 'G5',
    frets: [3, 5, 5, -1, -1, -1],
    fingers: [1, 3, 4, 0, 0, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'a5',
    name: 'A5',
    frets: [-1, 0, 2, 2, -1, -1],
    fingers: [0, 0, 1, 2, 0, 0],
    isCustom: false,
    createdDate: '2025-06-30'
  },

  // BARRE CHORDS - E SHAPE
  {
    id: 'f-barre-e',
    name: 'F (E shape)',
    frets: [1, 3, 3, 2, 1, 1],
    fingers: [1, 3, 4, 2, 1, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'g-barre-e',
    name: 'G (E shape)',
    frets: [3, 5, 5, 4, 3, 3],
    fingers: [1, 3, 4, 2, 1, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'bb-barre-e',
    name: 'Bb (E shape)',
    frets: [6, 8, 8, 7, 6, 6],
    fingers: [1, 3, 4, 2, 1, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'fm-barre-e',
    name: 'Fm (E shape)',
    frets: [1, 3, 3, 1, 1, 1],
    fingers: [1, 3, 4, 1, 1, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'gm-barre-e',
    name: 'Gm (E shape)',
    frets: [3, 5, 5, 3, 3, 3],
    fingers: [1, 3, 4, 1, 1, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },

  // BARRE CHORDS - A SHAPE
  {
    id: 'c-barre-a',
    name: 'C (A shape)',
    frets: [-1, 3, 5, 5, 5, 3],
    fingers: [0, 1, 3, 4, 4, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'd-barre-a',
    name: 'D (A shape)',
    frets: [-1, 5, 7, 7, 7, 5],
    fingers: [0, 1, 3, 4, 4, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'e-barre-a',
    name: 'E (A shape)',
    frets: [-1, 7, 9, 9, 9, 7],
    fingers: [0, 1, 3, 4, 4, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'cm-barre-a',
    name: 'Cm (A shape)',
    frets: [-1, 3, 5, 5, 4, 3],
    fingers: [0, 1, 3, 4, 2, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  },
  {
    id: 'dm-barre-a',
    name: 'Dm (A shape)',
    frets: [-1, 5, 7, 7, 6, 5],
    fingers: [0, 1, 3, 4, 2, 1],
    isCustom: false,
    createdDate: '2025-06-30'
  }
]

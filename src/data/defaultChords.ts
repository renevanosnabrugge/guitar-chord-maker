import { Chord } from '../types'

export const defaultChords: Chord[] = [
  {
    id: 'c-major',
    name: 'C',
    frets: [-1, 3, 2, 0, 1, 0],
    fingers: [0, 3, 2, 0, 1, 0],
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
    id: 'a-minor',
    name: 'Am',
    frets: [-1, 0, 2, 2, 1, 0],
    fingers: [0, 0, 2, 3, 1, 0],
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
    id: 'e-minor',
    name: 'Em',
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
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
  }
]

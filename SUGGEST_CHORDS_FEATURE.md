# Suggest Chords Feature

## Overview
The **Suggest Chords** feature has been added to the Song Builder page, allowing users to search for chord progressions by song title and artist.

## How to Use

1. **Navigate to Song Builder**: Go to the Song Builder page in the application
2. **Find the Suggest Chords Button**: Next to the "Show Strumming Patterns" button, you'll see a new "Suggest Chords" button
3. **Click Suggest Chords**: This opens the chord suggestion panel
4. **Enter Song Details**: 
   - Fill in the "Song Title" field
   - Fill in the "Artist" field
5. **Search for Chords**: Click the "Search Chords" button to find chord suggestions
6. **Review Suggestions**: The system will display a suggested chord progression
7. **Apply Chords**: Click "Apply These Chords" to add the suggested chords to your song sequence

## Features

- **Mock Search Functionality**: Currently implements a demo search that returns common chord progressions
- **Chord Validation**: Shows which suggested chords are available in your chord library
- **Auto-fill Song Info**: Automatically fills the song name and artist fields when applying suggestions
- **Error Handling**: Displays helpful error messages for invalid inputs
- **Responsive Design**: Works well on both desktop and mobile devices

## Technical Notes

This is currently a **demo implementation** that uses mock data to simulate online chord searching. In a production environment, this would integrate with:

- Real chord progression APIs
- Music databases
- Online chord repositories
- AI-powered chord suggestion services

## Future Enhancements

- Integration with real music APIs (Ultimate Guitar, Songsterr, etc.)
- AI-powered chord progression generation
- User ratings and feedback for suggested progressions
- Community-sourced chord progressions
- Advanced filtering and customization options

## Files Modified

- `src/components/SongBuilder/SongBuilder.tsx` - Added suggest chords functionality
- `src/components/SongBuilder/SongBuilder.css` - Added styling for the new feature

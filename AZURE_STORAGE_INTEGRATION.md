# Azure Blob Storage Integration

This document explains how to set up and use the Azure Blob Storage integration for the ChordMaker application.

## Overview

The ChordMaker app now automatically syncs your custom chords and songs with Azure Blob Storage, providing:
- Cross-device synchronization
- Automatic backups
- Persistent data storage
- Real-time sync status

## Data Structure

### Azure Container Files
- **Song Files**: `song-{uuid}.json` - Individual files for each song
- **Custom Chords File**: `custom-chords.json` - Single file containing all custom chord definitions

### File Formats

#### Song File (`song-{uuid}.json`)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Amazing Grace",
  "artist": "Traditional",
  "key": "G",
  "tempo": 80,
  "timeSignature": "4/4",
  "sections": [
    {
      "id": "verse-1",
      "name": "Verse 1",
      "type": "verse",
      "chords": ["G", "C", "G", "D"],
      "lyrics": "Amazing grace how sweet the sound...",
      "measures": 4
    }
  ],
  "metadata": {
    "createdAt": "2025-07-01T10:30:00.000Z",
    "updatedAt": "2025-07-01T15:45:30.000Z",
    "version": 1
  }
}
```

#### Custom Chords File (`custom-chords.json`)
```json
{
  "chords": {
    "Cmaj7#11": {
      "name": "Cmaj7#11",
      "displayName": "Cmaj7♯11",
      "frets": [0, 3, 2, 4, 4, 3],
      "fingers": [0, 3, 1, 2, 4, 3],
      "baseFret": 1,
      "muted": [false, false, false, false, false, false]
    }
  },
  "metadata": {
    "updatedAt": "2025-07-01T12:15:00.000Z",
    "version": 2
  }
}
```

## Azure Setup

### 1. Create Azure Storage Account
1. Log into [Azure Portal](https://portal.azure.com)
2. Create a new **Storage Account**
3. Choose **Standard** performance tier
4. Select **Locally Redundant Storage (LRS)** for cost efficiency

### 2. Create Container
1. In your Storage Account, go to **Containers**
2. Create a new container named `chordmaker`
3. Set **Public access level** to **Private**

### 3. Generate SAS Token
1. In your Storage Account, go to **Shared Access Signature**
2. Select the following permissions:
   - **Allowed services**: Blob
   - **Allowed resource types**: Container, Object
   - **Allowed permissions**: Read, Write, Delete, List, Add, Create
3. Set appropriate **Start** and **Expiry** dates
4. Click **Generate SAS and connection string**
5. Copy the **Blob service SAS URL**

### 4. Configure Environment Variable
1. Create a `.env` file in your project root
2. Add your SAS URL:
   ```
   VITE_AZURE_SAS_URL=https://yourstorageaccount.blob.core.windows.net/chordmaker?sv=2022-11-02&ss=b&srt=co&sp=rwdlac&se=2025-12-31T23:59:59Z&st=2025-01-01T00:00:00Z&spr=https&sig=YourSASTokenSignature
   ```

## Application Features

### Automatic Sync
- **On App Load**: Downloads all existing data from Azure
- **On Create/Update**: Automatically uploads changes to Azure
- **On Delete**: Removes files from Azure storage

### Sync Status
The **StorageStatus** component shows:
- Current sync status (loading, syncing, success, error)
- Last sync timestamp
- Error details with retry options
- Manual sync button

### Error Handling
- **Network failures**: Automatic retry with exponential backoff
- **SAS token expiry**: Clear error message with instructions
- **Corrupted data**: Skips bad files, continues with others
- **Offline mode**: Uses localStorage as fallback

### Data Migration
The application supports both old and new data formats for backward compatibility:
- Old format songs are automatically converted
- localStorage data is used as fallback when cloud sync fails

## Development

### Local Development
1. Set `VITE_AZURE_SAS_URL` in your `.env` file
2. Run `npm run dev`
3. The app will attempt to connect to Azure on startup

### Testing Without Azure
- If no SAS URL is configured, the app falls back to localStorage
- All features work normally, just without cloud sync

### Building for Production
1. Ensure `VITE_AZURE_SAS_URL` is set in your production environment
2. Build with `npm run build`
3. Deploy static files to your hosting platform

## Security Considerations

### SAS Token Security
- Use appropriate expiry dates (not too long)
- Only grant necessary permissions
- Regenerate tokens regularly
- Never commit SAS tokens to version control

### CORS Configuration
Configure your Azure Storage account CORS settings to allow your domain:
```json
{
  "allowedOrigins": ["https://your-domain.com", "http://localhost:3000"],
  "allowedMethods": ["GET", "PUT", "DELETE", "HEAD"],
  "allowedHeaders": ["*"],
  "exposedHeaders": ["*"],
  "maxAgeInSeconds": 3600
}
```

## Troubleshooting

### Common Issues

**"Failed to list blobs" Error**
- Check if SAS URL is correct and not expired
- Verify container name is "chordmaker"
- Ensure SAS token has "List" permissions

**"CORS Error"**
- Configure CORS settings in Azure Storage
- Add your domain to allowed origins

**"Blob not found" for custom-chords.json**
- This is normal for new accounts
- The file will be created automatically when you add custom chords

**Sync Status Shows Errors**
- Click the sync button to retry manually
- Check browser console for detailed error messages
- Verify SAS token hasn't expired

### Debug Mode
Enable console logging by opening browser DevTools. The application logs all sync operations and errors.

## API Reference

### BlobStorageClient Methods
- `listBlobs()` - Get all files in container
- `downloadBlob(filename)` - Download and parse JSON file
- `uploadBlob(filename, data)` - Upload JSON data
- `deleteBlob(filename)` - Delete file from container
- `uploadSong(song)` - Upload song file
- `deleteSong(songId)` - Delete song file
- `uploadCustomChords(chords)` - Upload custom chords file

### Store Actions
#### Songs Store
- `loadSongs()` - Load all songs from Azure
- `createSong(songData)` - Create new song
- `updateSong(songId, updates)` - Update existing song
- `deleteSong(songId)` - Delete song
- `syncWithCloud()` - Manual sync with Azure

#### Chords Store
- `loadCustomChords()` - Load custom chords from Azure
- `saveCustomChord(chord)` - Save custom chord
- `deleteCustomChord(chordName)` - Delete custom chord
- `syncCustomChords()` - Manual sync custom chords

### Utility Functions
- `initializeFromCloud()` - Initialize app data from Azure
- `syncAllWithCloud()` - Sync all data manually
- `isSyncing()` - Check if any sync operation is in progress
- `hasSyncErrors()` - Check for sync errors
- `getSyncErrors()` - Get list of current errors
- `clearAllSyncErrors()` - Clear all error states

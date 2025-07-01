import { Song, CustomChordsData, BlobInfo } from '../types'

export class BlobStorageClient {
  private sasUrl: string
  private baseUrl: string

  constructor() {
    this.sasUrl = import.meta.env.VITE_AZURE_SAS_URL || ''
    if (!this.sasUrl) {
      throw new Error('VITE_AZURE_SAS_URL environment variable is required')
    }
    
    // Extract base URL without SAS parameters
    const url = new URL(this.sasUrl)
    this.baseUrl = `${url.protocol}//${url.host}${url.pathname}`
  }

  /**
   * List all blobs in the container
   */
  async listBlobs(): Promise<BlobInfo[]> {
    try {
      const url = new URL(this.sasUrl)
      url.searchParams.set('comp', 'list')
      url.searchParams.set('restype', 'container')

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/xml'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to list blobs: ${response.status} ${response.statusText}`)
      }

      const xmlText = await response.text()
      return this.parseXmlBlobList(xmlText)
    } catch (error) {
      console.error('Error listing blobs:', error)
      throw error
    }
  }

  /**
   * Download blob content and parse as JSON
   */
  async downloadBlob<T = unknown>(filename: string): Promise<T> {
    try {
      const blobUrl = this.getBlobUrl(filename)
      
      const response = await fetch(blobUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Blob not found: ${filename}`)
        }
        throw new Error(`Failed to download blob: ${response.status} ${response.statusText}`)
      }

      const jsonData = await response.json()
      return jsonData as T
    } catch (error) {
      console.error(`Error downloading blob ${filename}:`, error)
      throw error
    }
  }

  /**
   * Upload JSON data as a blob
   */
  async uploadBlob(filename: string, data: unknown): Promise<void> {
    try {
      const blobUrl = this.getBlobUrl(filename)
      const jsonContent = JSON.stringify(data, null, 2)

      const response = await fetch(blobUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'content-type': 'application/json',
          'content-length': new TextEncoder().encode(jsonContent).length.toString()
        },
        body: jsonContent
      })

      if (!response.ok) {
        throw new Error(`Failed to upload blob: ${response.status} ${response.statusText}`)
      }

      console.log(`Successfully uploaded ${filename}`)
    } catch (error) {
      console.error(`Error uploading blob ${filename}:`, error)
      throw error
    }
  }

  /**
   * Delete a blob from the container
   */
  async deleteBlob(filename: string): Promise<void> {
    try {
      const blobUrl = this.getBlobUrl(filename)

      const response = await fetch(blobUrl, {
        method: 'DELETE'
      })

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete blob: ${response.status} ${response.statusText}`)
      }

      console.log(`Successfully deleted ${filename}`)
    } catch (error) {
      console.error(`Error deleting blob ${filename}:`, error)
      throw error
    }
  }

  /**
   * Check if a blob exists in the container
   */
  async blobExists(filename: string): Promise<boolean> {
    try {
      const blobUrl = this.getBlobUrl(filename)

      const response = await fetch(blobUrl, {
        method: 'HEAD'
      })

      return response.ok
    } catch (error) {
      console.error(`Error checking blob existence ${filename}:`, error)
      return false
    }
  }

  /**
   * Upload a song file
   */
  async uploadSong(song: Song): Promise<void> {
    const filename = `song-${song.id}.json`
    await this.uploadBlob(filename, song)
  }

  /**
   * Upload custom chords file
   */
  async uploadCustomChords(chordsData: CustomChordsData): Promise<void> {
    await this.uploadBlob('custom-chords.json', chordsData)
  }

  /**
   * Delete a song file
   */
  async deleteSong(songId: string): Promise<void> {
    const filename = `song-${songId}.json`
    await this.deleteBlob(filename)
  }

  /**
   * Download all song files
   */
  async downloadAllSongs(): Promise<Song[]> {
    try {
      const blobs = await this.listBlobs()
      const songBlobs = blobs.filter(blob => blob.name.startsWith('song-') && blob.name.endsWith('.json'))
      
      const songs: Song[] = []
      
      for (const blob of songBlobs) {
        try {
          const song = await this.downloadBlob<Song>(blob.name)
          songs.push(song)
        } catch (error) {
          console.warn(`Failed to download song ${blob.name}:`, error)
          // Continue with other songs
        }
      }

      return songs
    } catch (error) {
      console.error('Error downloading all songs:', error)
      throw error
    }
  }

  /**
   * Download custom chords file
   */
  async downloadCustomChords(): Promise<CustomChordsData | null> {
    try {
      const exists = await this.blobExists('custom-chords.json')
      if (!exists) {
        return null
      }
      
      return await this.downloadBlob<CustomChordsData>('custom-chords.json')
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return null
      }
      console.error('Error downloading custom chords:', error)
      throw error
    }
  }

  /**
   * Generate blob URL with SAS token
   */
  private getBlobUrl(filename: string): string {
    const url = new URL(this.sasUrl)
    url.pathname = `${url.pathname}/${filename}`
    return url.toString()
  }

  /**
   * Parse XML blob list response
   */
  private parseXmlBlobList(xmlText: string): BlobInfo[] {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
    
    const blobs = xmlDoc.querySelectorAll('Blob')
    const blobInfos: BlobInfo[] = []

    blobs.forEach(blob => {
      const nameElement = blob.querySelector('Name')
      const lastModifiedElement = blob.querySelector('Properties Last-Modified')
      const sizeElement = blob.querySelector('Properties Content-Length')

      if (nameElement) {
        blobInfos.push({
          name: nameElement.textContent || '',
          lastModified: lastModifiedElement?.textContent || new Date().toISOString(),
          size: parseInt(sizeElement?.textContent || '0', 10)
        })
      }
    })

    return blobInfos
  }
}

// Singleton instance
export const blobStorageClient = new BlobStorageClient()

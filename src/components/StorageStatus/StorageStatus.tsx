import React from 'react'
import { CloudOff, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { useSongsStore } from '../../stores/songsStore'
import { useChordsStore } from '../../stores/chordsStore'
import { syncAllWithCloud, getLastSyncTime, getSyncErrors, clearAllSyncErrors } from '../../utils/syncUtils'
import './StorageStatus.css'

export const StorageStatus: React.FC = () => {
  const songsStatus = useSongsStore(state => state.syncStatus)
  const chordsStatus = useChordsStore(state => state.syncStatus)
  
  const isLoading = songsStatus.isLoading || chordsStatus.isLoading
  const isSyncing = songsStatus.isSyncing || chordsStatus.isSyncing
  const errors = getSyncErrors()
  const hasErrors = errors.length > 0
  const lastSync = getLastSyncTime()

  const handleSync = async () => {
    try {
      await syncAllWithCloud()
    } catch (error) {
      console.error('Manual sync failed:', error)
    }
  }

  const handleClearErrors = () => {
    clearAllSyncErrors()
  }

  const getStatusIcon = () => {
    if (isLoading || isSyncing) {
      return <Loader2 className="storage-status__icon storage-status__icon--loading" />
    }
    
    if (hasErrors) {
      return <AlertCircle className="storage-status__icon storage-status__icon--error" />
    }
    
    if (lastSync) {
      return <CheckCircle className="storage-status__icon storage-status__icon--success" />
    }
    
    return <CloudOff className="storage-status__icon storage-status__icon--offline" />
  }

  const getStatusText = () => {
    if (isLoading) {
      return 'Loading from cloud...'
    }
    
    if (isSyncing) {
      return 'Syncing...'
    }
    
    if (hasErrors) {
      return `Sync errors (${errors.length})`
    }
    
    if (lastSync) {
      const timeAgo = getTimeAgo(lastSync)
      return `Last synced ${timeAgo}`
    }
    
    return 'Not synced'
  }

  const getTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins === 1) return '1 minute ago'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  return (
    <div className={`storage-status ${hasErrors ? 'storage-status--error' : ''}`}>
      <div className="storage-status__main">
        {getStatusIcon()}
        <span className="storage-status__text">{getStatusText()}</span>
        
        {!isLoading && !isSyncing && (
          <button
            className="storage-status__sync-btn"
            onClick={handleSync}
            title="Sync with cloud"
          >
            <RefreshCw className="storage-status__sync-icon" />
          </button>
        )}
      </div>

      {hasErrors && (
        <div className="storage-status__errors">
          <div className="storage-status__errors-header">
            <span>Sync Errors:</span>
            <button
              className="storage-status__clear-btn"
              onClick={handleClearErrors}
              title="Clear errors"
            >
              ×
            </button>
          </div>
          <ul className="storage-status__errors-list">
            {errors.map((error, index) => (
              <li key={index} className="storage-status__error-item">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

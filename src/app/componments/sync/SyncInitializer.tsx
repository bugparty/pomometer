'use client'

import { useEffect } from 'react'
import { initUnifiedSyncIntegration } from './unifiedSyncIntegration'

export const SyncInitializer = () => {
  useEffect(() => {
    // Initialize sync functionality after the store provider is rendered
    if (typeof window !== 'undefined') {
      // Add a small delay to ensure the store is fully initialized
      setTimeout(() => {
        initUnifiedSyncIntegration()
      }, 100)
    }
  }, [])

  return null // This component doesn't render anything
}


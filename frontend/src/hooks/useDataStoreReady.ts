import { useEffect, useState } from 'react'
import { Hub } from 'aws-amplify/utils'
import { isDataStoreReady } from '@/services/datastore-sync'

/**
 * Hook to detect when DataStore is ready for queries
 * Useful in components that need to load data after cloud sync completes
 */
export const useDataStoreReady = (): boolean => {
  const [isReady, setIsReady] = useState<boolean>(() => isDataStoreReady())

  useEffect(() => {
    // Catch already-completed sync if the ready event fired before this hook mounted.
    if (isDataStoreReady()) {
      setIsReady(true)
    }

    const unsubscribe = Hub.listen('datastore', ({ payload }) => {
      const event = payload?.event
      if (event === 'ready' || event === 'syncQueriesReady' || event === 'modelSynced') {
        console.log('[DataStore Hook] Ready event received')
        setIsReady(true)
        return
      }

      if (event === 'syncQueriesStarted') {
        setIsReady(false)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return isReady
}

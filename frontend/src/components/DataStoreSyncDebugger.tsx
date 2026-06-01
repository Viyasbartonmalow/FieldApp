import { useState, useEffect } from 'react'
import {
  getDiagnostics,
  monitorDataStoreHub,
  forceFullResync,
  getSyncLog,
  testAppSyncConnectivity,
} from '@/services/datastore-debug'

export default function DataStoreSyncDebugger() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Start monitoring immediately
    const unsub = monitorDataStoreHub()
    return () => unsub?.()
  }, [])

  const runDiagnostics = async () => {
    setLoading(true)
    const diag = await getDiagnostics()
    setDiagnostics(diag)
    setLoading(false)
  }

  const testConnection = async () => {
    setLoading(true)
    const result = await testAppSyncConnectivity()
    console.log('AppSync test result:', result)
    setLoading(false)
  }

  const handleFullResync = async () => {
    setLoading(true)
    const success = await forceFullResync()
    alert(success ? 'Full resync completed. Check console for details.' : 'Full resync failed. See console.')
    setLoading(false)
  }

  const syncLog = getSyncLog()

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#1e1e1e', color: '#d4d4d4' }}>
      <h2>DataStore Sync Debugger</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={runDiagnostics} disabled={loading} style={{ marginRight: '10px', padding: '8px 16px' }}>
          {loading ? 'Running...' : 'Run Diagnostics'}
        </button>
        <button onClick={testConnection} disabled={loading} style={{ marginRight: '10px', padding: '8px 16px' }}>
          Test AppSync Connection
        </button>
        <button onClick={handleFullResync} disabled={loading} style={{ padding: '8px 16px', backgroundColor: '#d97706' }}>
          Force Full Resync
        </button>
      </div>

      {diagnostics && (
        <div style={{ marginBottom: '20px', backgroundColor: '#252526', padding: '10px', borderRadius: '4px' }}>
          <h3>Diagnostics Results:</h3>
          <p>AppSync Connected: {diagnostics.appSyncConnected ? '✓' : '✗'}</p>
          <p>DataStore Ready: {diagnostics.dataStoreReady ? '✓' : '✗'}</p>
          <p>Outbox Items: {diagnostics.outbox?.length || 0}</p>
        </div>
      )}

      <div style={{ backgroundColor: '#252526', padding: '10px', borderRadius: '4px', maxHeight: '400px', overflowY: 'auto' }}>
        <h3>Sync Log ({syncLog.length} entries):</h3>
        {syncLog.map((entry, idx) => (
          <div key={idx} style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#1e1e1e', borderRadius: '2px' }}>
            <div style={{ color: '#4ec9b0' }}>
              {new Date(entry.timestamp).toISOString()} | {entry.phase}
            </div>
            <div style={{ color: '#ce9178' }}>{entry.message}</div>
            {entry.error && <div style={{ color: '#f48771' }}>Error: {entry.error}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

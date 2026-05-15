import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Amplify } from 'aws-amplify'
import { DataStore } from 'aws-amplify/datastore'
import { LanguageProvider } from '@/context/LanguageContext'
import amplifyconfig from './amplifyconfiguration.json'
import App from './App'
import store from './store'
import 'typeface-d-din'
import '@/styles/globals.css'

// Use Amplify-generated config keys (aws_appsync_*) so DataStore can initialize cloud sync.
Amplify.configure(amplifyconfig)

const DATASTORE_SCHEMA_RESET_KEY = 'fieldapp_datastore_schema_reset'
const DATASTORE_SCHEMA_RESET_VERSION = '2026-05-14-sync-enabled'

const bootstrapDataStore = async () => {
  try {
    // Dev-only: clear stale local metadata once per schema reset version.
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      const appliedVersion = window.localStorage.getItem(DATASTORE_SCHEMA_RESET_KEY)
      if (appliedVersion !== DATASTORE_SCHEMA_RESET_VERSION) {
        await DataStore.clear()
        window.localStorage.setItem(DATASTORE_SCHEMA_RESET_KEY, DATASTORE_SCHEMA_RESET_VERSION)
      }
    }

    await DataStore.start()
  } catch (err) {
    console.error('Failed to start DataStore sync engine:', err)
  }
}

void bootstrapDataStore()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <LanguageProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LanguageProvider>
    </Provider>
  </React.StrictMode>,
)

import './amplify-init'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from '@/context/LanguageContext'
import App from './App'
import store from './store'
// import 'typeface-d-din'
import '@/styles/globals.css'

const mountApp = () => {
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
}

mountApp()

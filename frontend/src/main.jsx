import React, { useContext } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { LiveStrimingProvider } from './context/LiveStrimingController'
import { LiveStrimingContext } from './context/LiveStrimingController'
import { Welcome } from './Welcome'

ReactDOM.createRoot(document.getElementById('root')).render(
  <LiveStrimingProvider>
      <React.StrictMode>
    <Welcome />
    <App />
  </React.StrictMode>,
  </LiveStrimingProvider>

)

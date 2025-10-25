import React from 'react'
import ConversionInput from './components/ConversionInput'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>USD to wBTC Converter</h1>
        <p className="subtitle">Convert your USD to Wrapped Bitcoin (wBTC)</p>
      </header>
      
      <main className="app-main">
        <ConversionInput />
      </main>
      
      <footer className="app-footer">
        <p>Price data provided by CoinGecko API</p>
      </footer>
    </div>
  )
}

export default App


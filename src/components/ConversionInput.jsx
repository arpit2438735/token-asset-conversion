import React, { useState, useEffect } from 'react'
import './ConversionInput.css'

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
const WBTC_CONTRACT_ADDRESS = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'

function ConversionInput() {
  const [usdAmount, setUsdAmount] = useState('')
  const [wbtcAmount, setWbtcAmount] = useState(null)
  const [btcPrice, setBtcPrice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Fetch Bitcoin price on component mount
  useEffect(() => {
    void fetchBitcoinPrice()
  }, [])

  const fetchBitcoinPrice = async () => {
    try {
      setError(null)
      const response = await fetch(COINGECKO_API)
      
      if (!response.ok) {
        throw new Error('Failed to fetch Bitcoin price')
      }
      
      const data = await response.json()
      const price = data.bitcoin.usd
      setBtcPrice(price)
      setLastUpdated(new Date())
      
      return price
    } catch (err) {
      setError('Failed to fetch current Bitcoin price. Please try again.')
      console.error('Error fetching Bitcoin price:', err)
      return null
    }
  }

  const handleConvert = async () => {
    // Validate input
    const amount = parseFloat(usdAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid USD amount greater than 0')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch latest Bitcoin price
      let currentPrice = btcPrice
      
      // Refresh price if it's more than 1 minute old or not available
      if (!currentPrice || !lastUpdated || (Date.now() - lastUpdated.getTime()) > 60000) {
        currentPrice = await fetchBitcoinPrice()
      }

      if (!currentPrice) {
        throw new Error('Unable to get Bitcoin price')
      }

      // Calculate wBTC amount (wBTC has 1:1 value with BTC)
      // Formula: USD amount / BTC price in USD = BTC amount = wBTC amount
      const calculatedWbtc = amount / currentPrice
      setWbtcAmount(calculatedWbtc)
    } catch (err) {
      setError('Conversion failed. Please try again.')
      console.error('Error during conversion:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setUsdAmount(e.target.value)
    setError(null)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      void handleConvert()
    }
  }

  const formatWbtcAmount = (amount) => {
    if (amount === null) return null
    
    // Format with appropriate decimal places
    if (amount < 0.00000001) {
      return amount.toExponential(8)
    } else if (amount < 0.0001) {
      return amount.toFixed(8)
    } else {
      return amount.toFixed(6)
    }
  }

  return (
    <div className="conversion-container">
      <div className="conversion-card">
        <div className="input-section">
          <label htmlFor="usd-input" className="input-label">
            Enter USD Amount
          </label>
          <div className="input-wrapper">
            <span className="currency-symbol">$</span>
            <input
              id="usd-input"
              type="number"
              min="0"
              step="0.01"
              value={usdAmount}
              onChange={handleInputChange}
              placeholder="0.00"
              className="usd-input"
              disabled={loading}
            />
          </div>
        </div>

        <button
          onClick={handleConvert}
          disabled={loading || !usdAmount}
          className="convert-button"
        >
          {loading ? 'Converting...' : 'Convert to wBTC'}
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {wbtcAmount !== null && !error && (
          <div className="result-section">
            <div className="result-card">
              <h3>Amount of wBTC:</h3>
              <p className="wbtc-amount">
                {formatWbtcAmount(wbtcAmount)} tokens
              </p>
            </div>
            
            <div className="price-info">
              <p>Current BTC Price: ${btcPrice?.toLocaleString()}</p>
              {lastUpdated && (
                <p className="last-updated">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="technical-note">
        <h4>🔧 Smart Contract Integration</h4>
        <p>
          This application could be enhanced with Web3 integration to interact
          directly with the wBTC ERC-20 contract at:
        </p>
        <code className="contract-address">{WBTC_CONTRACT_ADDRESS}</code>
      </div>
    </div>
  )
}

export default ConversionInput


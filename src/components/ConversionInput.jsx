import React, { useState, useEffect } from 'react'
import './ConversionInput.css'

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
const WBTC_CONTRACT_ADDRESS = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'

function ConversionInput() {
  const [inputAmount, setInputAmount] = useState('')
  const [convertedAmount, setConvertedAmount] = useState(null)
  const [btcPrice, setBtcPrice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [inputCurrency, setInputCurrency] = useState('USD') // 'USD' or 'wBTC'

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
    const amount = parseFloat(inputAmount)
    if (isNaN(amount) || amount <= 0) {
      setError(`Please enter a valid ${inputCurrency} amount greater than 0`)
      return
    }

    // Validate decimal precision
    if (inputAmount.includes('.')) {
      const [, decimal] = inputAmount.split('.')
      const maxDecimals = inputCurrency === 'USD' ? 2 : 8
      if (decimal && decimal.length > maxDecimals) {
        setError(`${inputCurrency} allows a maximum of ${maxDecimals} decimal places`)
        return
      }
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

      // Calculate conversion based on input currency
      let result
      if (inputCurrency === 'USD') {
        // USD to wBTC: USD amount / BTC price in USD = wBTC amount
        result = amount / currentPrice
      } else {
        // wBTC to USD: wBTC amount * BTC price in USD = USD amount
        result = amount * currentPrice
      }
      
      setConvertedAmount(result)
    } catch (err) {
      setError('Conversion failed. Please try again.')
      console.error('Error during conversion:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchCurrencies = () => {
    setInputCurrency(prev => prev === 'USD' ? 'wBTC' : 'USD')
    setInputAmount('')
    setConvertedAmount(null)
    setError(null)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    
    // Enforce decimal precision limits
    if (value.includes('.')) {
      const [, decimal] = value.split('.')
      const maxDecimals = inputCurrency === 'USD' ? 2 : 8
      
      // If decimal places exceed the limit, don't update the value
      if (decimal && decimal.length > maxDecimals) {
        return
      }
    }
    
    setInputAmount(value)
    setError(null)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      void handleConvert()
    }
  }

  const formatAmount = (amount, currency) => {
    if (amount === null) return null
    
    if (currency === 'wBTC') {
      // Format wBTC with appropriate decimal places
      if (amount < 0.00000001) {
        return amount.toExponential(8)
      } else if (amount < 0.0001) {
        return amount.toFixed(8)
      } else {
        return amount.toFixed(6)
      }
    } else {
      // Format USD with 2 decimal places
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }

  const getOutputCurrency = () => {
    return inputCurrency === 'USD' ? 'wBTC' : 'USD'
  }

  const getOutputLabel = () => {
    return inputCurrency === 'USD' ? 'Amount of wBTC' : 'Amount of USD'
  }

  const getOutputUnit = () => {
    return inputCurrency === 'USD' ? 'tokens' : ''
  }

  return (
    <div className="conversion-container">
      <div className="conversion-card">
        <div className="input-section">
          <label htmlFor="amount-input" className="input-label">
            Enter {inputCurrency} Amount
          </label>
          <div className="input-wrapper">
            {inputCurrency === 'USD' ? (
              <span className="currency-symbol">$</span>
            ) : (
              <img 
                src="https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png?1696507857" 
                alt="wBTC token" 
                className="token-icon-left"
              />
            )}
            <input
              id="amount-input"
              type="number"
              min="0"
              step={inputCurrency === 'USD' ? '0.01' : '0.00000001'}
              value={inputAmount}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={inputCurrency === 'USD' ? '0.00' : '0.00000000'}
              className="amount-input"
              disabled={loading}
            />
          </div>
          <p className="precision-hint">
            Maximum {inputCurrency === 'USD' ? '2' : '8'} decimal places
          </p>
        </div>

        <div className="button-group">
          <button
            onClick={handleSwitchCurrencies}
            className="switch-button"
            disabled={loading}
          >
            ⇄ Switch Currencies
          </button>
          
          <button
            onClick={handleConvert}
            disabled={loading || !inputAmount}
            className="convert-button"
          >
            {loading ? 'Converting...' : `Convert to ${getOutputCurrency()}`}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {convertedAmount !== null && !error && (
          <div className="result-section">
            <div className="result-card">
              <p className="conversion-result">
                {getOutputLabel()}: {inputCurrency === 'USD' ? '' : '$'}{formatAmount(convertedAmount, getOutputCurrency())} {getOutputUnit()}
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


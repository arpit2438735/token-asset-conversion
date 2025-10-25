/**
 * Error types for different scenarios
 */
export const ErrorTypes = {
  NETWORK: 'network',
  API_RATE_LIMIT: 'api_rate_limit',
  API_SERVICE: 'api_service',
  API_DATA: 'api_data',
  VALIDATION: 'validation',
  CONVERSION: 'conversion',
  UNKNOWN: 'unknown'
}

/**
 * Creates a structured error object
 * @param {string} type - Error type from ErrorTypes
 * @param {string} message - User-friendly error message
 * @param {boolean} recoverable - Whether the error can be retried
 * @returns {Object} Error object
 */
export const createError = (type, message, recoverable = true) => {
  return {
    type,
    message,
    recoverable
  }
}

/**
 * Handles API fetch errors and returns appropriate error object
 * @param {Error} error - The caught error
 * @param {Response} response - The fetch response (if available)
 * @returns {Object} Structured error object
 */
export const handleApiError = (error, response = null) => {
  // Handle HTTP response errors
  if (response && !response.ok) {
    if (response.status === 429) {
      return createError(
        ErrorTypes.API_RATE_LIMIT,
        'CoinGecko API rate limit reached. Please wait a moment and try again.'
      )
    } else if (response.status >= 500) {
      return createError(
        ErrorTypes.API_SERVICE,
        'CoinGecko service is temporarily unavailable. Please try again in a few minutes.'
      )
    } else {
      return createError(
        ErrorTypes.API_SERVICE,
        'Failed to fetch Bitcoin price. Please try again.'
      )
    }
  }

  // Handle specific error types
  if (error.message === 'RATE_LIMIT') {
    return createError(
      ErrorTypes.API_RATE_LIMIT,
      'CoinGecko API rate limit reached. Please wait a moment and try again.'
    )
  }
  
  if (error.message === 'SERVICE_UNAVAILABLE') {
    return createError(
      ErrorTypes.API_SERVICE,
      'CoinGecko service is temporarily unavailable. Please try again in a few minutes.'
    )
  }
  
  if (error.message === 'INVALID_RESPONSE') {
    return createError(
      ErrorTypes.API_DATA,
      'Received invalid data from price service. Please try again.'
    )
  }

  // Handle network errors
  if (error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('network')) {
    return createError(
      ErrorTypes.NETWORK,
      'Network connection error. Please check your internet connection and try again.'
    )
  }

  // Default unknown error
  return createError(
    ErrorTypes.UNKNOWN,
    'An unexpected error occurred while fetching Bitcoin price. Please try again.'
  )
}

/**
 * Creates a validation error
 * @param {string} message - Validation error message
 * @returns {Object} Structured error object
 */
export const createValidationError = (message) => {
  return createError(ErrorTypes.VALIDATION, message)
}

/**
 * Creates a conversion error
 * @param {string} message - Conversion error message
 * @returns {Object} Structured error object
 */
export const createConversionError = (message = 'Conversion failed. Please try again.') => {
  return createError(ErrorTypes.CONVERSION, message)
}


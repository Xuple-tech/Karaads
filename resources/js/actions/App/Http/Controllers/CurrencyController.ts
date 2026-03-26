import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CurrencyController::getExchangeRate
 * @see app/Http/Controllers/CurrencyController.php:18
 * @route '/api/currency/exchange-rate'
 */
export const getExchangeRate = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getExchangeRate.url(options),
    method: 'get',
})

getExchangeRate.definition = {
    methods: ["get","head"],
    url: '/api/currency/exchange-rate',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CurrencyController::getExchangeRate
 * @see app/Http/Controllers/CurrencyController.php:18
 * @route '/api/currency/exchange-rate'
 */
getExchangeRate.url = (options?: RouteQueryOptions) => {
    return getExchangeRate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::getExchangeRate
 * @see app/Http/Controllers/CurrencyController.php:18
 * @route '/api/currency/exchange-rate'
 */
getExchangeRate.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getExchangeRate.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CurrencyController::getExchangeRate
 * @see app/Http/Controllers/CurrencyController.php:18
 * @route '/api/currency/exchange-rate'
 */
getExchangeRate.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getExchangeRate.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CurrencyController::convertPrice
 * @see app/Http/Controllers/CurrencyController.php:45
 * @route '/api/currency/convert'
 */
export const convertPrice = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: convertPrice.url(options),
    method: 'post',
})

convertPrice.definition = {
    methods: ["post"],
    url: '/api/currency/convert',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CurrencyController::convertPrice
 * @see app/Http/Controllers/CurrencyController.php:45
 * @route '/api/currency/convert'
 */
convertPrice.url = (options?: RouteQueryOptions) => {
    return convertPrice.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::convertPrice
 * @see app/Http/Controllers/CurrencyController.php:45
 * @route '/api/currency/convert'
 */
convertPrice.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: convertPrice.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CurrencyController::detectUserCurrency
 * @see app/Http/Controllers/CurrencyController.php:87
 * @route '/api/currency/detect'
 */
export const detectUserCurrency = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: detectUserCurrency.url(options),
    method: 'get',
})

detectUserCurrency.definition = {
    methods: ["get","head"],
    url: '/api/currency/detect',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CurrencyController::detectUserCurrency
 * @see app/Http/Controllers/CurrencyController.php:87
 * @route '/api/currency/detect'
 */
detectUserCurrency.url = (options?: RouteQueryOptions) => {
    return detectUserCurrency.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::detectUserCurrency
 * @see app/Http/Controllers/CurrencyController.php:87
 * @route '/api/currency/detect'
 */
detectUserCurrency.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: detectUserCurrency.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CurrencyController::detectUserCurrency
 * @see app/Http/Controllers/CurrencyController.php:87
 * @route '/api/currency/detect'
 */
detectUserCurrency.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: detectUserCurrency.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CurrencyController::getSupportedCurrencies
 * @see app/Http/Controllers/CurrencyController.php:179
 * @route '/api/currency/supported'
 */
export const getSupportedCurrencies = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSupportedCurrencies.url(options),
    method: 'get',
})

getSupportedCurrencies.definition = {
    methods: ["get","head"],
    url: '/api/currency/supported',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CurrencyController::getSupportedCurrencies
 * @see app/Http/Controllers/CurrencyController.php:179
 * @route '/api/currency/supported'
 */
getSupportedCurrencies.url = (options?: RouteQueryOptions) => {
    return getSupportedCurrencies.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::getSupportedCurrencies
 * @see app/Http/Controllers/CurrencyController.php:179
 * @route '/api/currency/supported'
 */
getSupportedCurrencies.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSupportedCurrencies.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CurrencyController::getSupportedCurrencies
 * @see app/Http/Controllers/CurrencyController.php:179
 * @route '/api/currency/supported'
 */
getSupportedCurrencies.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getSupportedCurrencies.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CurrencyController::getSubscriptionPrices
 * @see app/Http/Controllers/CurrencyController.php:152
 * @route '/api/currency/subscription-prices'
 */
export const getSubscriptionPrices = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSubscriptionPrices.url(options),
    method: 'get',
})

getSubscriptionPrices.definition = {
    methods: ["get","head"],
    url: '/api/currency/subscription-prices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CurrencyController::getSubscriptionPrices
 * @see app/Http/Controllers/CurrencyController.php:152
 * @route '/api/currency/subscription-prices'
 */
getSubscriptionPrices.url = (options?: RouteQueryOptions) => {
    return getSubscriptionPrices.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::getSubscriptionPrices
 * @see app/Http/Controllers/CurrencyController.php:152
 * @route '/api/currency/subscription-prices'
 */
getSubscriptionPrices.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getSubscriptionPrices.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CurrencyController::getSubscriptionPrices
 * @see app/Http/Controllers/CurrencyController.php:152
 * @route '/api/currency/subscription-prices'
 */
getSubscriptionPrices.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getSubscriptionPrices.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CurrencyController::getUserCurrency
 * @see app/Http/Controllers/CurrencyController.php:102
 * @route '/api/currency/user-currency'
 */
export const getUserCurrency = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getUserCurrency.url(options),
    method: 'get',
})

getUserCurrency.definition = {
    methods: ["get","head"],
    url: '/api/currency/user-currency',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CurrencyController::getUserCurrency
 * @see app/Http/Controllers/CurrencyController.php:102
 * @route '/api/currency/user-currency'
 */
getUserCurrency.url = (options?: RouteQueryOptions) => {
    return getUserCurrency.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::getUserCurrency
 * @see app/Http/Controllers/CurrencyController.php:102
 * @route '/api/currency/user-currency'
 */
getUserCurrency.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getUserCurrency.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CurrencyController::getUserCurrency
 * @see app/Http/Controllers/CurrencyController.php:102
 * @route '/api/currency/user-currency'
 */
getUserCurrency.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getUserCurrency.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CurrencyController::setUserCurrency
 * @see app/Http/Controllers/CurrencyController.php:121
 * @route '/api/currency/user-currency'
 */
export const setUserCurrency = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setUserCurrency.url(options),
    method: 'post',
})

setUserCurrency.definition = {
    methods: ["post"],
    url: '/api/currency/user-currency',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CurrencyController::setUserCurrency
 * @see app/Http/Controllers/CurrencyController.php:121
 * @route '/api/currency/user-currency'
 */
setUserCurrency.url = (options?: RouteQueryOptions) => {
    return setUserCurrency.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::setUserCurrency
 * @see app/Http/Controllers/CurrencyController.php:121
 * @route '/api/currency/user-currency'
 */
setUserCurrency.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setUserCurrency.url(options),
    method: 'post',
})
const CurrencyController = { getExchangeRate, convertPrice, detectUserCurrency, getSupportedCurrencies, getSubscriptionPrices, getUserCurrency, setUserCurrency }

export default CurrencyController
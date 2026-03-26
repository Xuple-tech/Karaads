import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\CurrencyController::exchangeRate
* @see app/Http/Controllers/CurrencyController.php:18
* @route '/api/currency/exchange-rate'
*/
export const exchangeRate = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exchangeRate.url(options),
    method: 'get',
})

exchangeRate.definition = {
    methods: ["get","head"],
    url: '/api/currency/exchange-rate',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CurrencyController::exchangeRate
* @see app/Http/Controllers/CurrencyController.php:18
* @route '/api/currency/exchange-rate'
*/
exchangeRate.url = (options?: RouteQueryOptions) => {
    return exchangeRate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::exchangeRate
* @see app/Http/Controllers/CurrencyController.php:18
* @route '/api/currency/exchange-rate'
*/
exchangeRate.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exchangeRate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CurrencyController::exchangeRate
* @see app/Http/Controllers/CurrencyController.php:18
* @route '/api/currency/exchange-rate'
*/
exchangeRate.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exchangeRate.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CurrencyController::convert
* @see app/Http/Controllers/CurrencyController.php:45
* @route '/api/currency/convert'
*/
export const convert = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: convert.url(options),
    method: 'post',
})

convert.definition = {
    methods: ["post"],
    url: '/api/currency/convert',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CurrencyController::convert
* @see app/Http/Controllers/CurrencyController.php:45
* @route '/api/currency/convert'
*/
convert.url = (options?: RouteQueryOptions) => {
    return convert.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::convert
* @see app/Http/Controllers/CurrencyController.php:45
* @route '/api/currency/convert'
*/
convert.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: convert.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CurrencyController::detect
* @see app/Http/Controllers/CurrencyController.php:87
* @route '/api/currency/detect'
*/
export const detect = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: detect.url(options),
    method: 'get',
})

detect.definition = {
    methods: ["get","head"],
    url: '/api/currency/detect',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CurrencyController::detect
* @see app/Http/Controllers/CurrencyController.php:87
* @route '/api/currency/detect'
*/
detect.url = (options?: RouteQueryOptions) => {
    return detect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::detect
* @see app/Http/Controllers/CurrencyController.php:87
* @route '/api/currency/detect'
*/
detect.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: detect.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CurrencyController::detect
* @see app/Http/Controllers/CurrencyController.php:87
* @route '/api/currency/detect'
*/
detect.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: detect.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CurrencyController::supported
* @see app/Http/Controllers/CurrencyController.php:179
* @route '/api/currency/supported'
*/
export const supported = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: supported.url(options),
    method: 'get',
})

supported.definition = {
    methods: ["get","head"],
    url: '/api/currency/supported',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CurrencyController::supported
* @see app/Http/Controllers/CurrencyController.php:179
* @route '/api/currency/supported'
*/
supported.url = (options?: RouteQueryOptions) => {
    return supported.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::supported
* @see app/Http/Controllers/CurrencyController.php:179
* @route '/api/currency/supported'
*/
supported.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: supported.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CurrencyController::supported
* @see app/Http/Controllers/CurrencyController.php:179
* @route '/api/currency/supported'
*/
supported.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: supported.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CurrencyController::subscriptionPrices
* @see app/Http/Controllers/CurrencyController.php:152
* @route '/api/currency/subscription-prices'
*/
export const subscriptionPrices = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscriptionPrices.url(options),
    method: 'get',
})

subscriptionPrices.definition = {
    methods: ["get","head"],
    url: '/api/currency/subscription-prices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CurrencyController::subscriptionPrices
* @see app/Http/Controllers/CurrencyController.php:152
* @route '/api/currency/subscription-prices'
*/
subscriptionPrices.url = (options?: RouteQueryOptions) => {
    return subscriptionPrices.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::subscriptionPrices
* @see app/Http/Controllers/CurrencyController.php:152
* @route '/api/currency/subscription-prices'
*/
subscriptionPrices.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: subscriptionPrices.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CurrencyController::subscriptionPrices
* @see app/Http/Controllers/CurrencyController.php:152
* @route '/api/currency/subscription-prices'
*/
subscriptionPrices.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: subscriptionPrices.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CurrencyController::userCurrency
* @see app/Http/Controllers/CurrencyController.php:102
* @route '/api/currency/user-currency'
*/
export const userCurrency = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userCurrency.url(options),
    method: 'get',
})

userCurrency.definition = {
    methods: ["get","head"],
    url: '/api/currency/user-currency',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CurrencyController::userCurrency
* @see app/Http/Controllers/CurrencyController.php:102
* @route '/api/currency/user-currency'
*/
userCurrency.url = (options?: RouteQueryOptions) => {
    return userCurrency.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CurrencyController::userCurrency
* @see app/Http/Controllers/CurrencyController.php:102
* @route '/api/currency/user-currency'
*/
userCurrency.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userCurrency.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CurrencyController::userCurrency
* @see app/Http/Controllers/CurrencyController.php:102
* @route '/api/currency/user-currency'
*/
userCurrency.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: userCurrency.url(options),
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

const currency = {
    exchangeRate: Object.assign(exchangeRate, exchangeRate),
    convert: Object.assign(convert, convert),
    detect: Object.assign(detect, detect),
    supported: Object.assign(supported, supported),
    subscriptionPrices: Object.assign(subscriptionPrices, subscriptionPrices),
    userCurrency: Object.assign(userCurrency, userCurrency),
    setUserCurrency: Object.assign(setUserCurrency, setUserCurrency),
}

export default currency
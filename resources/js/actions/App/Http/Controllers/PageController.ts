import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PageController::privacy
* @see app/Http/Controllers/PageController.php:13
* @route '/privacy'
*/
export const privacy = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: privacy.url(options),
    method: 'get',
})

privacy.definition = {
    methods: ["get","head"],
    url: '/privacy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PageController::privacy
* @see app/Http/Controllers/PageController.php:13
* @route '/privacy'
*/
privacy.url = (options?: RouteQueryOptions) => {
    return privacy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PageController::privacy
* @see app/Http/Controllers/PageController.php:13
* @route '/privacy'
*/
privacy.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: privacy.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PageController::privacy
* @see app/Http/Controllers/PageController.php:13
* @route '/privacy'
*/
privacy.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: privacy.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PageController::terms
* @see app/Http/Controllers/PageController.php:25
* @route '/terms'
*/
const terms619dc3a99425f668ea9cab64e6648cb4 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: terms619dc3a99425f668ea9cab64e6648cb4.url(options),
    method: 'get',
})

terms619dc3a99425f668ea9cab64e6648cb4.definition = {
    methods: ["get","head"],
    url: '/terms',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PageController::terms
* @see app/Http/Controllers/PageController.php:25
* @route '/terms'
*/
terms619dc3a99425f668ea9cab64e6648cb4.url = (options?: RouteQueryOptions) => {
    return terms619dc3a99425f668ea9cab64e6648cb4.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PageController::terms
* @see app/Http/Controllers/PageController.php:25
* @route '/terms'
*/
terms619dc3a99425f668ea9cab64e6648cb4.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: terms619dc3a99425f668ea9cab64e6648cb4.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PageController::terms
* @see app/Http/Controllers/PageController.php:25
* @route '/terms'
*/
terms619dc3a99425f668ea9cab64e6648cb4.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: terms619dc3a99425f668ea9cab64e6648cb4.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PageController::terms
* @see app/Http/Controllers/PageController.php:25
* @route '/terms-of-service'
*/
const termsafc93a7f43b9c83b4fdbb5592321e7c9 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: termsafc93a7f43b9c83b4fdbb5592321e7c9.url(options),
    method: 'get',
})

termsafc93a7f43b9c83b4fdbb5592321e7c9.definition = {
    methods: ["get","head"],
    url: '/terms-of-service',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PageController::terms
* @see app/Http/Controllers/PageController.php:25
* @route '/terms-of-service'
*/
termsafc93a7f43b9c83b4fdbb5592321e7c9.url = (options?: RouteQueryOptions) => {
    return termsafc93a7f43b9c83b4fdbb5592321e7c9.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PageController::terms
* @see app/Http/Controllers/PageController.php:25
* @route '/terms-of-service'
*/
termsafc93a7f43b9c83b4fdbb5592321e7c9.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: termsafc93a7f43b9c83b4fdbb5592321e7c9.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PageController::terms
* @see app/Http/Controllers/PageController.php:25
* @route '/terms-of-service'
*/
termsafc93a7f43b9c83b4fdbb5592321e7c9.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: termsafc93a7f43b9c83b4fdbb5592321e7c9.url(options),
    method: 'head',
})

export const terms = {
    '/terms': terms619dc3a99425f668ea9cab64e6648cb4,
    '/terms-of-service': termsafc93a7f43b9c83b4fdbb5592321e7c9,
}

const PageController = { privacy, terms }

export default PageController
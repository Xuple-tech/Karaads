import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Meta\MetaAccountController::initiate
* @see app/Http/Controllers/Meta/MetaAccountController.php:147
* @route '/meta/accounts/initiate-oauth'
*/
export const initiate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: initiate.url(options),
    method: 'post',
})

initiate.definition = {
    methods: ["post"],
    url: '/meta/accounts/initiate-oauth',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::initiate
* @see app/Http/Controllers/Meta/MetaAccountController.php:147
* @route '/meta/accounts/initiate-oauth'
*/
initiate.url = (options?: RouteQueryOptions) => {
    return initiate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::initiate
* @see app/Http/Controllers/Meta/MetaAccountController.php:147
* @route '/meta/accounts/initiate-oauth'
*/
initiate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: initiate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::callback
* @see app/Http/Controllers/Meta/MetaAccountController.php:170
* @route '/meta/oauth/callback'
*/
export const callback = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: callback.url(options),
    method: 'get',
})

callback.definition = {
    methods: ["get","head"],
    url: '/meta/oauth/callback',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::callback
* @see app/Http/Controllers/Meta/MetaAccountController.php:170
* @route '/meta/oauth/callback'
*/
callback.url = (options?: RouteQueryOptions) => {
    return callback.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::callback
* @see app/Http/Controllers/Meta/MetaAccountController.php:170
* @route '/meta/oauth/callback'
*/
callback.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: callback.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Meta\MetaAccountController::callback
* @see app/Http/Controllers/Meta/MetaAccountController.php:170
* @route '/meta/oauth/callback'
*/
callback.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: callback.url(options),
    method: 'head',
})

const oauth = {
    initiate: Object.assign(initiate, initiate),
    callback: Object.assign(callback, callback),
}

export default oauth
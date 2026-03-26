import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AuthController::login
* @see app/Http/Controllers/Api/AuthController.php:15
* @route '/api/auth/x7k9m2p4/login'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

login.definition = {
    methods: ["post"],
    url: '/api/auth/x7k9m2p4/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::login
* @see app/Http/Controllers/Api/AuthController.php:15
* @route '/api/auth/x7k9m2p4/login'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::login
* @see app/Http/Controllers/Api/AuthController.php:15
* @route '/api/auth/x7k9m2p4/login'
*/
login.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AuthController::register
* @see app/Http/Controllers/Api/AuthController.php:47
* @route '/api/auth/q3w8r5t1/register'
*/
export const register = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(options),
    method: 'post',
})

register.definition = {
    methods: ["post"],
    url: '/api/auth/q3w8r5t1/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::register
* @see app/Http/Controllers/Api/AuthController.php:47
* @route '/api/auth/q3w8r5t1/register'
*/
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::register
* @see app/Http/Controllers/Api/AuthController.php:47
* @route '/api/auth/q3w8r5t1/register'
*/
register.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AuthController::logout
* @see app/Http/Controllers/Api/AuthController.php:78
* @route '/api/auth/secure/n8m4k7j2/logout'
*/
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/api/auth/secure/n8m4k7j2/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::logout
* @see app/Http/Controllers/Api/AuthController.php:78
* @route '/api/auth/secure/n8m4k7j2/logout'
*/
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::logout
* @see app/Http/Controllers/Api/AuthController.php:78
* @route '/api/auth/secure/n8m4k7j2/logout'
*/
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AuthController::user
* @see app/Http/Controllers/Api/AuthController.php:88
* @route '/api/auth/secure/p9l6h3v5/user'
*/
export const user = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: user.url(options),
    method: 'get',
})

user.definition = {
    methods: ["get","head"],
    url: '/api/auth/secure/p9l6h3v5/user',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AuthController::user
* @see app/Http/Controllers/Api/AuthController.php:88
* @route '/api/auth/secure/p9l6h3v5/user'
*/
user.url = (options?: RouteQueryOptions) => {
    return user.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::user
* @see app/Http/Controllers/Api/AuthController.php:88
* @route '/api/auth/secure/p9l6h3v5/user'
*/
user.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: user.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\AuthController::user
* @see app/Http/Controllers/Api/AuthController.php:88
* @route '/api/auth/secure/p9l6h3v5/user'
*/
user.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: user.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\AuthController::refresh
* @see app/Http/Controllers/Api/AuthController.php:96
* @route '/api/auth/secure/r2t8y4u1/refresh'
*/
export const refresh = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refresh.url(options),
    method: 'post',
})

refresh.definition = {
    methods: ["post"],
    url: '/api/auth/secure/r2t8y4u1/refresh',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::refresh
* @see app/Http/Controllers/Api/AuthController.php:96
* @route '/api/auth/secure/r2t8y4u1/refresh'
*/
refresh.url = (options?: RouteQueryOptions) => {
    return refresh.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::refresh
* @see app/Http/Controllers/Api/AuthController.php:96
* @route '/api/auth/secure/r2t8y4u1/refresh'
*/
refresh.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: refresh.url(options),
    method: 'post',
})

const auth = {
    login: Object.assign(login, login),
    register: Object.assign(register, register),
    logout: Object.assign(logout, logout),
    user: Object.assign(user, user),
    refresh: Object.assign(refresh, refresh),
}

export default auth
import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\AuthenticatedSessionController::destroy
 * @see app/Http/Controllers/Auth/AuthenticatedSessionController.php:54
 * @route '/console/logout'
 */
const destroyc9b21414370297c8c41e66c625a4283a = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: destroyc9b21414370297c8c41e66c625a4283a.url(options),
    method: 'post',
})

destroyc9b21414370297c8c41e66c625a4283a.definition = {
    methods: ["post"],
    url: '/console/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\AuthenticatedSessionController::destroy
 * @see app/Http/Controllers/Auth/AuthenticatedSessionController.php:54
 * @route '/console/logout'
 */
destroyc9b21414370297c8c41e66c625a4283a.url = (options?: RouteQueryOptions) => {
    return destroyc9b21414370297c8c41e66c625a4283a.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\AuthenticatedSessionController::destroy
 * @see app/Http/Controllers/Auth/AuthenticatedSessionController.php:54
 * @route '/console/logout'
 */
destroyc9b21414370297c8c41e66c625a4283a.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: destroyc9b21414370297c8c41e66c625a4283a.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Auth\AuthenticatedSessionController::destroy
 * @see app/Http/Controllers/Auth/AuthenticatedSessionController.php:54
 * @route '/logout'
 */
const destroyf732b903d9f8919b4c24bef1f8bb897a = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: destroyf732b903d9f8919b4c24bef1f8bb897a.url(options),
    method: 'get',
})

destroyf732b903d9f8919b4c24bef1f8bb897a.definition = {
    methods: ["get","head"],
    url: '/logout',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\AuthenticatedSessionController::destroy
 * @see app/Http/Controllers/Auth/AuthenticatedSessionController.php:54
 * @route '/logout'
 */
destroyf732b903d9f8919b4c24bef1f8bb897a.url = (options?: RouteQueryOptions) => {
    return destroyf732b903d9f8919b4c24bef1f8bb897a.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\AuthenticatedSessionController::destroy
 * @see app/Http/Controllers/Auth/AuthenticatedSessionController.php:54
 * @route '/logout'
 */
destroyf732b903d9f8919b4c24bef1f8bb897a.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: destroyf732b903d9f8919b4c24bef1f8bb897a.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Auth\AuthenticatedSessionController::destroy
 * @see app/Http/Controllers/Auth/AuthenticatedSessionController.php:54
 * @route '/logout'
 */
destroyf732b903d9f8919b4c24bef1f8bb897a.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: destroyf732b903d9f8919b4c24bef1f8bb897a.url(options),
    method: 'head',
})

export const destroy = {
    '/console/logout': destroyc9b21414370297c8c41e66c625a4283a,
    '/logout': destroyf732b903d9f8919b4c24bef1f8bb897a,
}

/**
* @see \App\Http\Controllers\Auth\AuthenticatedSessionController::create
 * @see app/Http/Controllers/Auth/AuthenticatedSessionController.php:20
 * @route '/login'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\AuthenticatedSessionController::create
 * @see app/Http/Controllers/Auth/AuthenticatedSessionController.php:20
 * @route '/login'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\AuthenticatedSessionController::create
 * @see app/Http/Controllers/Auth/AuthenticatedSessionController.php:20
 * @route '/login'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Auth\AuthenticatedSessionController::create
 * @see app/Http/Controllers/Auth/AuthenticatedSessionController.php:20
 * @route '/login'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\AuthenticatedSessionController::store
 * @see app/Http/Controllers/Auth/AuthenticatedSessionController.php:34
 * @route '/login'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\AuthenticatedSessionController::store
 * @see app/Http/Controllers/Auth/AuthenticatedSessionController.php:34
 * @route '/login'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\AuthenticatedSessionController::store
 * @see app/Http/Controllers/Auth/AuthenticatedSessionController.php:34
 * @route '/login'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})
const AuthenticatedSessionController = { destroy, create, store }

export default AuthenticatedSessionController
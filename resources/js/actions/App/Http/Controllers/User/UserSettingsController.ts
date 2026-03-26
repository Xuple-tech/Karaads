import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\User\UserSettingsController::index
* @see app/Http/Controllers/User/UserSettingsController.php:18
* @route '/user/settings'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/user/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\UserSettingsController::index
* @see app/Http/Controllers/User/UserSettingsController.php:18
* @route '/user/settings'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\UserSettingsController::index
* @see app/Http/Controllers/User/UserSettingsController.php:18
* @route '/user/settings'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\User\UserSettingsController::index
* @see app/Http/Controllers/User/UserSettingsController.php:18
* @route '/user/settings'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const UserSettingsController = { index }

export default UserSettingsController
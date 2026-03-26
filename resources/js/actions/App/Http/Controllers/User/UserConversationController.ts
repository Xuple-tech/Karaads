import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\User\UserConversationController::index
* @see app/Http/Controllers/User/UserConversationController.php:19
* @route '/user/conversations'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/user/conversations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\User\UserConversationController::index
* @see app/Http/Controllers/User/UserConversationController.php:19
* @route '/user/conversations'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\User\UserConversationController::index
* @see app/Http/Controllers/User/UserConversationController.php:19
* @route '/user/conversations'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\User\UserConversationController::index
* @see app/Http/Controllers/User/UserConversationController.php:19
* @route '/user/conversations'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const UserConversationController = { index }

export default UserConversationController
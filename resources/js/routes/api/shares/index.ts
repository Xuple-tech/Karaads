import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ConversationShareController::list
* @see app/Http/Controllers/ConversationShareController.php:236
* @route '/api/shares/list'
*/
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/shares/list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ConversationShareController::list
* @see app/Http/Controllers/ConversationShareController.php:236
* @route '/api/shares/list'
*/
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ConversationShareController::list
* @see app/Http/Controllers/ConversationShareController.php:236
* @route '/api/shares/list'
*/
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ConversationShareController::list
* @see app/Http/Controllers/ConversationShareController.php:236
* @route '/api/shares/list'
*/
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

const shares = {
    list: Object.assign(list, list),
}

export default shares
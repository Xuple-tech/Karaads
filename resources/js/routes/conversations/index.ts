import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/new-api-new-users0request'
 */
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/conversations/new-api-new-users0request',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/new-api-new-users0request'
 */
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/new-api-new-users0request'
 */
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/new-api-new-users0request'
 */
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::create
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/api/conversations/c-sdnsnd-smmsm'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/conversations/c-sdnsnd-smmsm',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::create
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/api/conversations/c-sdnsnd-smmsm'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::create
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/api/conversations/c-sdnsnd-smmsm'
 */
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ChatController::update
 * @see app/Http/Controllers/ChatController.php:158
 * @route '/api/conversations/{id}'
 */
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/conversations/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\ChatController::update
 * @see app/Http/Controllers/ChatController.php:158
 * @route '/api/conversations/{id}'
 */
update.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return update.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::update
 * @see app/Http/Controllers/ChatController.php:158
 * @route '/api/conversations/{id}'
 */
update.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ChatController::deleteMethod
 * @see app/Http/Controllers/ChatController.php:188
 * @route '/api/conversations/{id}'
 */
export const deleteMethod = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/conversations/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ChatController::deleteMethod
 * @see app/Http/Controllers/ChatController.php:188
 * @route '/api/conversations/{id}'
 */
deleteMethod.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return deleteMethod.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::deleteMethod
 * @see app/Http/Controllers/ChatController.php:188
 * @route '/api/conversations/{id}'
 */
deleteMethod.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ChatController::clear
 * @see app/Http/Controllers/ChatController.php:218
 * @route '/api/conversations/clear'
 */
export const clear = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clear.url(options),
    method: 'delete',
})

clear.definition = {
    methods: ["delete"],
    url: '/api/conversations/clear',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ChatController::clear
 * @see app/Http/Controllers/ChatController.php:218
 * @route '/api/conversations/clear'
 */
clear.url = (options?: RouteQueryOptions) => {
    return clear.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::clear
 * @see app/Http/Controllers/ChatController.php:218
 * @route '/api/conversations/clear'
 */
clear.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clear.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ChatController::exportMethod
 * @see app/Http/Controllers/ChatController.php:982
 * @route '/api/conversations/{id}/export'
 */
export const exportMethod = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/api/conversations/{id}/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::exportMethod
 * @see app/Http/Controllers/ChatController.php:982
 * @route '/api/conversations/{id}/export'
 */
exportMethod.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return exportMethod.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::exportMethod
 * @see app/Http/Controllers/ChatController.php:982
 * @route '/api/conversations/{id}/export'
 */
exportMethod.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::exportMethod
 * @see app/Http/Controllers/ChatController.php:982
 * @route '/api/conversations/{id}/export'
 */
exportMethod.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::statistics
 * @see app/Http/Controllers/ChatController.php:924
 * @route '/api/conversations/statistics'
 */
export const statistics = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(options),
    method: 'get',
})

statistics.definition = {
    methods: ["get","head"],
    url: '/api/conversations/statistics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::statistics
 * @see app/Http/Controllers/ChatController.php:924
 * @route '/api/conversations/statistics'
 */
statistics.url = (options?: RouteQueryOptions) => {
    return statistics.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::statistics
 * @see app/Http/Controllers/ChatController.php:924
 * @route '/api/conversations/statistics'
 */
statistics.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statistics.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::statistics
 * @see app/Http/Controllers/ChatController.php:924
 * @route '/api/conversations/statistics'
 */
statistics.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: statistics.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::search
 * @see app/Http/Controllers/ChatController.php:0
 * @route '/api/conversations/search'
 */
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/api/conversations/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::search
 * @see app/Http/Controllers/ChatController.php:0
 * @route '/api/conversations/search'
 */
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::search
 * @see app/Http/Controllers/ChatController.php:0
 * @route '/api/conversations/search'
 */
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::search
 * @see app/Http/Controllers/ChatController.php:0
 * @route '/api/conversations/search'
 */
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::search
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/list'
 */
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/api/conversations/list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::search
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/list'
 */
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::search
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/list'
 */
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::search
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/list'
 */
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})
const conversations = {
    list: Object.assign(list, list),
create: Object.assign(create, create),
update: Object.assign(update, update),
delete: Object.assign(deleteMethod, deleteMethod),
clear: Object.assign(clear, clear),
export: Object.assign(exportMethod, exportMethod),
statistics: Object.assign(statistics, statistics),
search: Object.assign(search, search),
}

export default conversations
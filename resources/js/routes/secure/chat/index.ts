import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ChatController::create
 * @see app/Http/Controllers/Api/ChatController.php:23
 * @route '/api/chat/x9k2m7p4/conv/create/h5j8n3q1'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

create.definition = {
    methods: ["post"],
    url: '/api/chat/x9k2m7p4/conv/create/h5j8n3q1',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ChatController::create
 * @see app/Http/Controllers/Api/ChatController.php:23
 * @route '/api/chat/x9k2m7p4/conv/create/h5j8n3q1'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::create
 * @see app/Http/Controllers/Api/ChatController.php:23
 * @route '/api/chat/x9k2m7p4/conv/create/h5j8n3q1'
 */
create.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ChatController::list
 * @see app/Http/Controllers/Api/ChatController.php:53
 * @route '/api/chat/x9k2m7p4/conv/list/w6r9t2y5'
 */
export const list = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})

list.definition = {
    methods: ["get","head"],
    url: '/api/chat/x9k2m7p4/conv/list/w6r9t2y5',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ChatController::list
 * @see app/Http/Controllers/Api/ChatController.php:53
 * @route '/api/chat/x9k2m7p4/conv/list/w6r9t2y5'
 */
list.url = (options?: RouteQueryOptions) => {
    return list.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::list
 * @see app/Http/Controllers/Api/ChatController.php:53
 * @route '/api/chat/x9k2m7p4/conv/list/w6r9t2y5'
 */
list.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: list.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ChatController::list
 * @see app/Http/Controllers/Api/ChatController.php:53
 * @route '/api/chat/x9k2m7p4/conv/list/w6r9t2y5'
 */
list.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: list.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ChatController::show
 * @see app/Http/Controllers/Api/ChatController.php:88
 * @route '/api/chat/x9k2m7p4/conv/show/{uuid}/m4k7l9p2'
 */
export const show = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/chat/x9k2m7p4/conv/show/{uuid}/m4k7l9p2',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ChatController::show
 * @see app/Http/Controllers/Api/ChatController.php:88
 * @route '/api/chat/x9k2m7p4/conv/show/{uuid}/m4k7l9p2'
 */
show.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    uuid: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        uuid: args.uuid,
                }

    return show.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::show
 * @see app/Http/Controllers/Api/ChatController.php:88
 * @route '/api/chat/x9k2m7p4/conv/show/{uuid}/m4k7l9p2'
 */
show.get = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ChatController::show
 * @see app/Http/Controllers/Api/ChatController.php:88
 * @route '/api/chat/x9k2m7p4/conv/show/{uuid}/m4k7l9p2'
 */
show.head = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ChatController::update
 * @see app/Http/Controllers/Api/ChatController.php:110
 * @route '/api/chat/x9k2m7p4/conv/update/{uuid}/q3w8e5r1'
 */
export const update = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/chat/x9k2m7p4/conv/update/{uuid}/q3w8e5r1',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\ChatController::update
 * @see app/Http/Controllers/Api/ChatController.php:110
 * @route '/api/chat/x9k2m7p4/conv/update/{uuid}/q3w8e5r1'
 */
update.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    uuid: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        uuid: args.uuid,
                }

    return update.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::update
 * @see app/Http/Controllers/Api/ChatController.php:110
 * @route '/api/chat/x9k2m7p4/conv/update/{uuid}/q3w8e5r1'
 */
update.put = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\ChatController::deleteMethod
 * @see app/Http/Controllers/Api/ChatController.php:136
 * @route '/api/chat/x9k2m7p4/conv/delete/{uuid}/z7x4c6v8'
 */
export const deleteMethod = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

deleteMethod.definition = {
    methods: ["delete"],
    url: '/api/chat/x9k2m7p4/conv/delete/{uuid}/z7x4c6v8',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ChatController::deleteMethod
 * @see app/Http/Controllers/Api/ChatController.php:136
 * @route '/api/chat/x9k2m7p4/conv/delete/{uuid}/z7x4c6v8'
 */
deleteMethod.url = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { uuid: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    uuid: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        uuid: args.uuid,
                }

    return deleteMethod.definition.url
            .replace('{uuid}', parsedArgs.uuid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::deleteMethod
 * @see app/Http/Controllers/Api/ChatController.php:136
 * @route '/api/chat/x9k2m7p4/conv/delete/{uuid}/z7x4c6v8'
 */
deleteMethod.delete = (args: { uuid: string | number } | [uuid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteMethod.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\ChatController::message
 * @see app/Http/Controllers/Api/ChatController.php:156
 * @route '/api/chat/x9k2m7p4/msg/send/a2s5d8f1'
 */
export const message = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: message.url(options),
    method: 'post',
})

message.definition = {
    methods: ["post"],
    url: '/api/chat/x9k2m7p4/msg/send/a2s5d8f1',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ChatController::message
 * @see app/Http/Controllers/Api/ChatController.php:156
 * @route '/api/chat/x9k2m7p4/msg/send/a2s5d8f1'
 */
message.url = (options?: RouteQueryOptions) => {
    return message.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ChatController::message
 * @see app/Http/Controllers/Api/ChatController.php:156
 * @route '/api/chat/x9k2m7p4/msg/send/a2s5d8f1'
 */
message.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: message.url(options),
    method: 'post',
})
const chat = {
    create: Object.assign(create, create),
list: Object.assign(list, list),
show: Object.assign(show, show),
update: Object.assign(update, update),
delete: Object.assign(deleteMethod, deleteMethod),
message: Object.assign(message, message),
}

export default chat
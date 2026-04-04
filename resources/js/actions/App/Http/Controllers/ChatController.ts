import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:31
 * @route '/'
 */
const index980bb49ee7ae63891f1d891d2fbcf1c9 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'get',
})

index980bb49ee7ae63891f1d891d2fbcf1c9.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:31
 * @route '/'
 */
index980bb49ee7ae63891f1d891d2fbcf1c9.url = (options?: RouteQueryOptions) => {
    return index980bb49ee7ae63891f1d891d2fbcf1c9.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:31
 * @route '/'
 */
index980bb49ee7ae63891f1d891d2fbcf1c9.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:31
 * @route '/'
 */
index980bb49ee7ae63891f1d891d2fbcf1c9.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index980bb49ee7ae63891f1d891d2fbcf1c9.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:31
 * @route '/app'
 */
const index66c7f35ef69d84111bb599576cd05b30 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index66c7f35ef69d84111bb599576cd05b30.url(options),
    method: 'get',
})

index66c7f35ef69d84111bb599576cd05b30.definition = {
    methods: ["get","head"],
    url: '/app',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:31
 * @route '/app'
 */
index66c7f35ef69d84111bb599576cd05b30.url = (options?: RouteQueryOptions) => {
    return index66c7f35ef69d84111bb599576cd05b30.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:31
 * @route '/app'
 */
index66c7f35ef69d84111bb599576cd05b30.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index66c7f35ef69d84111bb599576cd05b30.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:31
 * @route '/app'
 */
index66c7f35ef69d84111bb599576cd05b30.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index66c7f35ef69d84111bb599576cd05b30.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:31
 * @route '/new'
 */
const index7a022a9b96cb47bd7a175c7742311b98 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index7a022a9b96cb47bd7a175c7742311b98.url(options),
    method: 'get',
})

index7a022a9b96cb47bd7a175c7742311b98.definition = {
    methods: ["get","head"],
    url: '/new',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:31
 * @route '/new'
 */
index7a022a9b96cb47bd7a175c7742311b98.url = (options?: RouteQueryOptions) => {
    return index7a022a9b96cb47bd7a175c7742311b98.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:31
 * @route '/new'
 */
index7a022a9b96cb47bd7a175c7742311b98.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index7a022a9b96cb47bd7a175c7742311b98.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::index
 * @see app/Http/Controllers/ChatController.php:31
 * @route '/new'
 */
index7a022a9b96cb47bd7a175c7742311b98.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index7a022a9b96cb47bd7a175c7742311b98.url(options),
    method: 'head',
})

export const index = {
    '/': index980bb49ee7ae63891f1d891d2fbcf1c9,
    '/app': index66c7f35ef69d84111bb599576cd05b30,
    '/new': index7a022a9b96cb47bd7a175c7742311b98,
}

/**
* @see \App\Http\Controllers\ChatController::privacyPolicy
 * @see app/Http/Controllers/ChatController.php:52
 * @route '/privacy-policy'
 */
export const privacyPolicy = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: privacyPolicy.url(options),
    method: 'get',
})

privacyPolicy.definition = {
    methods: ["get","head"],
    url: '/privacy-policy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::privacyPolicy
 * @see app/Http/Controllers/ChatController.php:52
 * @route '/privacy-policy'
 */
privacyPolicy.url = (options?: RouteQueryOptions) => {
    return privacyPolicy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::privacyPolicy
 * @see app/Http/Controllers/ChatController.php:52
 * @route '/privacy-policy'
 */
privacyPolicy.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: privacyPolicy.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::privacyPolicy
 * @see app/Http/Controllers/ChatController.php:52
 * @route '/privacy-policy'
 */
privacyPolicy.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: privacyPolicy.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/new-api-new-users0request'
 */
const listbbb70c82437ce45affa5741480c58d20 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listbbb70c82437ce45affa5741480c58d20.url(options),
    method: 'get',
})

listbbb70c82437ce45affa5741480c58d20.definition = {
    methods: ["get","head"],
    url: '/api/conversations/new-api-new-users0request',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/new-api-new-users0request'
 */
listbbb70c82437ce45affa5741480c58d20.url = (options?: RouteQueryOptions) => {
    return listbbb70c82437ce45affa5741480c58d20.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/new-api-new-users0request'
 */
listbbb70c82437ce45affa5741480c58d20.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listbbb70c82437ce45affa5741480c58d20.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/new-api-new-users0request'
 */
listbbb70c82437ce45affa5741480c58d20.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listbbb70c82437ce45affa5741480c58d20.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/list'
 */
const listc657702fdf6e10a7ec5be12f0f45f280 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listc657702fdf6e10a7ec5be12f0f45f280.url(options),
    method: 'get',
})

listc657702fdf6e10a7ec5be12f0f45f280.definition = {
    methods: ["get","head"],
    url: '/api/conversations/list',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/list'
 */
listc657702fdf6e10a7ec5be12f0f45f280.url = (options?: RouteQueryOptions) => {
    return listc657702fdf6e10a7ec5be12f0f45f280.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/list'
 */
listc657702fdf6e10a7ec5be12f0f45f280.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listc657702fdf6e10a7ec5be12f0f45f280.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::list
 * @see app/Http/Controllers/ChatController.php:137
 * @route '/api/conversations/list'
 */
listc657702fdf6e10a7ec5be12f0f45f280.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listc657702fdf6e10a7ec5be12f0f45f280.url(options),
    method: 'head',
})

export const list = {
    '/api/conversations/new-api-new-users0request': listbbb70c82437ce45affa5741480c58d20,
    '/api/conversations/list': listc657702fdf6e10a7ec5be12f0f45f280,
}

/**
* @see \App\Http\Controllers\ChatController::create
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/api/conversations/c-sdnsnd-smmsm'
 */
const create8514a20e67f8436407d8b923f9880924 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create8514a20e67f8436407d8b923f9880924.url(options),
    method: 'post',
})

create8514a20e67f8436407d8b923f9880924.definition = {
    methods: ["post"],
    url: '/api/conversations/c-sdnsnd-smmsm',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::create
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/api/conversations/c-sdnsnd-smmsm'
 */
create8514a20e67f8436407d8b923f9880924.url = (options?: RouteQueryOptions) => {
    return create8514a20e67f8436407d8b923f9880924.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::create
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/api/conversations/c-sdnsnd-smmsm'
 */
create8514a20e67f8436407d8b923f9880924.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: create8514a20e67f8436407d8b923f9880924.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ChatController::create
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/c/new'
 */
const createc7bc79bc93669ce210dffd0b836367d8 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createc7bc79bc93669ce210dffd0b836367d8.url(options),
    method: 'get',
})

createc7bc79bc93669ce210dffd0b836367d8.definition = {
    methods: ["get","head"],
    url: '/c/new',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::create
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/c/new'
 */
createc7bc79bc93669ce210dffd0b836367d8.url = (options?: RouteQueryOptions) => {
    return createc7bc79bc93669ce210dffd0b836367d8.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::create
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/c/new'
 */
createc7bc79bc93669ce210dffd0b836367d8.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createc7bc79bc93669ce210dffd0b836367d8.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::create
 * @see app/Http/Controllers/ChatController.php:60
 * @route '/c/new'
 */
createc7bc79bc93669ce210dffd0b836367d8.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: createc7bc79bc93669ce210dffd0b836367d8.url(options),
    method: 'head',
})

export const create = {
    '/api/conversations/c-sdnsnd-smmsm': create8514a20e67f8436407d8b923f9880924,
    '/c/new': createc7bc79bc93669ce210dffd0b836367d8,
}

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
* @see \App\Http\Controllers\ChatController::destroy
 * @see app/Http/Controllers/ChatController.php:188
 * @route '/api/conversations/{id}'
 */
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/conversations/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ChatController::destroy
 * @see app/Http/Controllers/ChatController.php:188
 * @route '/api/conversations/{id}'
 */
destroy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::destroy
 * @see app/Http/Controllers/ChatController.php:188
 * @route '/api/conversations/{id}'
 */
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\ChatController::clearAll
 * @see app/Http/Controllers/ChatController.php:218
 * @route '/api/conversations/clear'
 */
export const clearAll = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clearAll.url(options),
    method: 'delete',
})

clearAll.definition = {
    methods: ["delete"],
    url: '/api/conversations/clear',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ChatController::clearAll
 * @see app/Http/Controllers/ChatController.php:218
 * @route '/api/conversations/clear'
 */
clearAll.url = (options?: RouteQueryOptions) => {
    return clearAll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::clearAll
 * @see app/Http/Controllers/ChatController.php:218
 * @route '/api/conversations/clear'
 */
clearAll.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clearAll.url(options),
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
* @see \App\Http\Controllers\ChatController::chat
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/api/create/challenge/message'
 */
const chat4471953a02b2058754c28dca30a0f064 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat4471953a02b2058754c28dca30a0f064.url(options),
    method: 'post',
})

chat4471953a02b2058754c28dca30a0f064.definition = {
    methods: ["post"],
    url: '/api/create/challenge/message',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::chat
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/api/create/challenge/message'
 */
chat4471953a02b2058754c28dca30a0f064.url = (options?: RouteQueryOptions) => {
    return chat4471953a02b2058754c28dca30a0f064.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::chat
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/api/create/challenge/message'
 */
chat4471953a02b2058754c28dca30a0f064.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chat4471953a02b2058754c28dca30a0f064.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ChatController::chat
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/create-two-step-challagene'
 */
const chata079fca5f78406da3f809c4458862471 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chata079fca5f78406da3f809c4458862471.url(options),
    method: 'post',
})

chata079fca5f78406da3f809c4458862471.definition = {
    methods: ["post"],
    url: '/create-two-step-challagene',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::chat
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/create-two-step-challagene'
 */
chata079fca5f78406da3f809c4458862471.url = (options?: RouteQueryOptions) => {
    return chata079fca5f78406da3f809c4458862471.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::chat
 * @see app/Http/Controllers/ChatController.php:246
 * @route '/create-two-step-challagene'
 */
chata079fca5f78406da3f809c4458862471.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: chata079fca5f78406da3f809c4458862471.url(options),
    method: 'post',
})

export const chat = {
    '/api/create/challenge/message': chat4471953a02b2058754c28dca30a0f064,
    '/create-two-step-challagene': chata079fca5f78406da3f809c4458862471,
}

/**
* @see \App\Http\Controllers\ChatController::generateCanvasContent
 * @see app/Http/Controllers/ChatController.php:953
 * @route '/api/generate-canvas-content'
 */
export const generateCanvasContent = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateCanvasContent.url(options),
    method: 'post',
})

generateCanvasContent.definition = {
    methods: ["post"],
    url: '/api/generate-canvas-content',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::generateCanvasContent
 * @see app/Http/Controllers/ChatController.php:953
 * @route '/api/generate-canvas-content'
 */
generateCanvasContent.url = (options?: RouteQueryOptions) => {
    return generateCanvasContent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::generateCanvasContent
 * @see app/Http/Controllers/ChatController.php:953
 * @route '/api/generate-canvas-content'
 */
generateCanvasContent.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateCanvasContent.url(options),
    method: 'post',
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
* @see \App\Http\Controllers\ChatController::show
 * @see app/Http/Controllers/ChatController.php:98
 * @route '/c/{conversation}'
 */
export const show = (args: { conversation: string | number | { id: string | number } } | [conversation: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/c/{conversation}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::show
 * @see app/Http/Controllers/ChatController.php:98
 * @route '/c/{conversation}'
 */
show.url = (args: { conversation: string | number | { id: string | number } } | [conversation: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { conversation: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    conversation: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        conversation: typeof args.conversation === 'object'
                ? args.conversation.id
                : args.conversation,
                }

    return show.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::show
 * @see app/Http/Controllers/ChatController.php:98
 * @route '/c/{conversation}'
 */
show.get = (args: { conversation: string | number | { id: string | number } } | [conversation: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ChatController::show
 * @see app/Http/Controllers/ChatController.php:98
 * @route '/c/{conversation}'
 */
show.head = (args: { conversation: string | number | { id: string | number } } | [conversation: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::regenerateMessage
 * @see app/Http/Controllers/ChatController.php:858
 * @route '/c/{messageId}/regenerate'
 */
export const regenerateMessage = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateMessage.url(args, options),
    method: 'post',
})

regenerateMessage.definition = {
    methods: ["post"],
    url: '/c/{messageId}/regenerate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::regenerateMessage
 * @see app/Http/Controllers/ChatController.php:858
 * @route '/c/{messageId}/regenerate'
 */
regenerateMessage.url = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { messageId: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    messageId: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        messageId: args.messageId,
                }

    return regenerateMessage.definition.url
            .replace('{messageId}', parsedArgs.messageId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::regenerateMessage
 * @see app/Http/Controllers/ChatController.php:858
 * @route '/c/{messageId}/regenerate'
 */
regenerateMessage.post = (args: { messageId: string | number } | [messageId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateMessage.url(args, options),
    method: 'post',
})
const ChatController = { index, privacyPolicy, list, create, update, destroy, clearAll, exportMethod, statistics, chat, generateCanvasContent, search, show, regenerateMessage, export: exportMethod }

export default ChatController
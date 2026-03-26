import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::index
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:17
* @route '/admin/agent-api-keys'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/agent-api-keys',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::index
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:17
* @route '/admin/agent-api-keys'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::index
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:17
* @route '/admin/agent-api-keys'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::index
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:17
* @route '/admin/agent-api-keys'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::create
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:50
* @route '/admin/agent-api-keys/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/agent-api-keys/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::create
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:50
* @route '/admin/agent-api-keys/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::create
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:50
* @route '/admin/agent-api-keys/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::create
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:50
* @route '/admin/agent-api-keys/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::store
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:67
* @route '/admin/agent-api-keys'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/agent-api-keys',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::store
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:67
* @route '/admin/agent-api-keys'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::store
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:67
* @route '/admin/agent-api-keys'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::show
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:98
* @route '/admin/agent-api-keys/{agentApiKey}'
*/
export const show = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/agent-api-keys/{agentApiKey}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::show
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:98
* @route '/admin/agent-api-keys/{agentApiKey}'
*/
show.url = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentApiKey: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentApiKey: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentApiKey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentApiKey: typeof args.agentApiKey === 'object'
        ? args.agentApiKey.id
        : args.agentApiKey,
    }

    return show.definition.url
            .replace('{agentApiKey}', parsedArgs.agentApiKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::show
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:98
* @route '/admin/agent-api-keys/{agentApiKey}'
*/
show.get = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::show
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:98
* @route '/admin/agent-api-keys/{agentApiKey}'
*/
show.head = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::edit
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:117
* @route '/admin/agent-api-keys/{agentApiKey}/edit'
*/
export const edit = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/agent-api-keys/{agentApiKey}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::edit
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:117
* @route '/admin/agent-api-keys/{agentApiKey}/edit'
*/
edit.url = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentApiKey: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentApiKey: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentApiKey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentApiKey: typeof args.agentApiKey === 'object'
        ? args.agentApiKey.id
        : args.agentApiKey,
    }

    return edit.definition.url
            .replace('{agentApiKey}', parsedArgs.agentApiKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::edit
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:117
* @route '/admin/agent-api-keys/{agentApiKey}/edit'
*/
edit.get = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::edit
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:117
* @route '/admin/agent-api-keys/{agentApiKey}/edit'
*/
edit.head = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::update
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:137
* @route '/admin/agent-api-keys/{agentApiKey}'
*/
export const update = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/agent-api-keys/{agentApiKey}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::update
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:137
* @route '/admin/agent-api-keys/{agentApiKey}'
*/
update.url = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentApiKey: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentApiKey: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentApiKey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentApiKey: typeof args.agentApiKey === 'object'
        ? args.agentApiKey.id
        : args.agentApiKey,
    }

    return update.definition.url
            .replace('{agentApiKey}', parsedArgs.agentApiKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::update
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:137
* @route '/admin/agent-api-keys/{agentApiKey}'
*/
update.put = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::destroy
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:156
* @route '/admin/agent-api-keys/{agentApiKey}'
*/
export const destroy = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/agent-api-keys/{agentApiKey}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::destroy
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:156
* @route '/admin/agent-api-keys/{agentApiKey}'
*/
destroy.url = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentApiKey: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentApiKey: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentApiKey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentApiKey: typeof args.agentApiKey === 'object'
        ? args.agentApiKey.id
        : args.agentApiKey,
    }

    return destroy.definition.url
            .replace('{agentApiKey}', parsedArgs.agentApiKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::destroy
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:156
* @route '/admin/agent-api-keys/{agentApiKey}'
*/
destroy.delete = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::regenerate
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:167
* @route '/admin/agent-api-keys/{agentApiKey}/regenerate'
*/
export const regenerate = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerate.url(args, options),
    method: 'post',
})

regenerate.definition = {
    methods: ["post"],
    url: '/admin/agent-api-keys/{agentApiKey}/regenerate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::regenerate
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:167
* @route '/admin/agent-api-keys/{agentApiKey}/regenerate'
*/
regenerate.url = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentApiKey: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentApiKey: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentApiKey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentApiKey: typeof args.agentApiKey === 'object'
        ? args.agentApiKey.id
        : args.agentApiKey,
    }

    return regenerate.definition.url
            .replace('{agentApiKey}', parsedArgs.agentApiKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::regenerate
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:167
* @route '/admin/agent-api-keys/{agentApiKey}/regenerate'
*/
regenerate.post = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::regenerateSecret
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:188
* @route '/admin/agent-api-keys/{agentApiKey}/regenerate-secret'
*/
export const regenerateSecret = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateSecret.url(args, options),
    method: 'post',
})

regenerateSecret.definition = {
    methods: ["post"],
    url: '/admin/agent-api-keys/{agentApiKey}/regenerate-secret',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::regenerateSecret
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:188
* @route '/admin/agent-api-keys/{agentApiKey}/regenerate-secret'
*/
regenerateSecret.url = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentApiKey: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentApiKey: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentApiKey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentApiKey: typeof args.agentApiKey === 'object'
        ? args.agentApiKey.id
        : args.agentApiKey,
    }

    return regenerateSecret.definition.url
            .replace('{agentApiKey}', parsedArgs.agentApiKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::regenerateSecret
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:188
* @route '/admin/agent-api-keys/{agentApiKey}/regenerate-secret'
*/
regenerateSecret.post = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: regenerateSecret.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::revoke
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:209
* @route '/admin/agent-api-keys/{agentApiKey}/revoke'
*/
export const revoke = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revoke.url(args, options),
    method: 'post',
})

revoke.definition = {
    methods: ["post"],
    url: '/admin/agent-api-keys/{agentApiKey}/revoke',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::revoke
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:209
* @route '/admin/agent-api-keys/{agentApiKey}/revoke'
*/
revoke.url = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentApiKey: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentApiKey: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentApiKey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentApiKey: typeof args.agentApiKey === 'object'
        ? args.agentApiKey.id
        : args.agentApiKey,
    }

    return revoke.definition.url
            .replace('{agentApiKey}', parsedArgs.agentApiKey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentApiKeyController::revoke
* @see app/Http/Controllers/Admin/AgentApiKeyController.php:209
* @route '/admin/agent-api-keys/{agentApiKey}/revoke'
*/
revoke.post = (args: { agentApiKey: string | { id: string } } | [agentApiKey: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revoke.url(args, options),
    method: 'post',
})

const agentApiKeys = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    regenerate: Object.assign(regenerate, regenerate),
    regenerateSecret: Object.assign(regenerateSecret, regenerateSecret),
    revoke: Object.assign(revoke, revoke),
}

export default agentApiKeys
import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AIAgentController::index
 * @see app/Http/Controllers/Admin/AIAgentController.php:18
 * @route '/admin/ai-agents'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/ai-agents',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AIAgentController::index
 * @see app/Http/Controllers/Admin/AIAgentController.php:18
 * @route '/admin/ai-agents'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIAgentController::index
 * @see app/Http/Controllers/Admin/AIAgentController.php:18
 * @route '/admin/ai-agents'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AIAgentController::index
 * @see app/Http/Controllers/Admin/AIAgentController.php:18
 * @route '/admin/ai-agents'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AIAgentController::create
 * @see app/Http/Controllers/Admin/AIAgentController.php:61
 * @route '/admin/ai-agents/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/ai-agents/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AIAgentController::create
 * @see app/Http/Controllers/Admin/AIAgentController.php:61
 * @route '/admin/ai-agents/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIAgentController::create
 * @see app/Http/Controllers/Admin/AIAgentController.php:61
 * @route '/admin/ai-agents/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AIAgentController::create
 * @see app/Http/Controllers/Admin/AIAgentController.php:61
 * @route '/admin/ai-agents/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AIAgentController::store
 * @see app/Http/Controllers/Admin/AIAgentController.php:76
 * @route '/admin/ai-agents'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/ai-agents',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AIAgentController::store
 * @see app/Http/Controllers/Admin/AIAgentController.php:76
 * @route '/admin/ai-agents'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIAgentController::store
 * @see app/Http/Controllers/Admin/AIAgentController.php:76
 * @route '/admin/ai-agents'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AIAgentController::show
 * @see app/Http/Controllers/Admin/AIAgentController.php:126
 * @route '/admin/ai-agents/{aiAgent}'
 */
export const show = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/ai-agents/{aiAgent}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AIAgentController::show
 * @see app/Http/Controllers/Admin/AIAgentController.php:126
 * @route '/admin/ai-agents/{aiAgent}'
 */
show.url = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { aiAgent: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { aiAgent: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    aiAgent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        aiAgent: typeof args.aiAgent === 'object'
                ? args.aiAgent.id
                : args.aiAgent,
                }

    return show.definition.url
            .replace('{aiAgent}', parsedArgs.aiAgent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIAgentController::show
 * @see app/Http/Controllers/Admin/AIAgentController.php:126
 * @route '/admin/ai-agents/{aiAgent}'
 */
show.get = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AIAgentController::show
 * @see app/Http/Controllers/Admin/AIAgentController.php:126
 * @route '/admin/ai-agents/{aiAgent}'
 */
show.head = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AIAgentController::edit
 * @see app/Http/Controllers/Admin/AIAgentController.php:164
 * @route '/admin/ai-agents/{aiAgent}/edit'
 */
export const edit = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/ai-agents/{aiAgent}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AIAgentController::edit
 * @see app/Http/Controllers/Admin/AIAgentController.php:164
 * @route '/admin/ai-agents/{aiAgent}/edit'
 */
edit.url = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { aiAgent: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { aiAgent: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    aiAgent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        aiAgent: typeof args.aiAgent === 'object'
                ? args.aiAgent.id
                : args.aiAgent,
                }

    return edit.definition.url
            .replace('{aiAgent}', parsedArgs.aiAgent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIAgentController::edit
 * @see app/Http/Controllers/Admin/AIAgentController.php:164
 * @route '/admin/ai-agents/{aiAgent}/edit'
 */
edit.get = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AIAgentController::edit
 * @see app/Http/Controllers/Admin/AIAgentController.php:164
 * @route '/admin/ai-agents/{aiAgent}/edit'
 */
edit.head = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AIAgentController::update
 * @see app/Http/Controllers/Admin/AIAgentController.php:182
 * @route '/admin/ai-agents/{aiAgent}'
 */
export const update = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/ai-agents/{aiAgent}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AIAgentController::update
 * @see app/Http/Controllers/Admin/AIAgentController.php:182
 * @route '/admin/ai-agents/{aiAgent}'
 */
update.url = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { aiAgent: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { aiAgent: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    aiAgent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        aiAgent: typeof args.aiAgent === 'object'
                ? args.aiAgent.id
                : args.aiAgent,
                }

    return update.definition.url
            .replace('{aiAgent}', parsedArgs.aiAgent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIAgentController::update
 * @see app/Http/Controllers/Admin/AIAgentController.php:182
 * @route '/admin/ai-agents/{aiAgent}'
 */
update.put = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AIAgentController::destroy
 * @see app/Http/Controllers/Admin/AIAgentController.php:229
 * @route '/admin/ai-agents/{aiAgent}'
 */
export const destroy = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/ai-agents/{aiAgent}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AIAgentController::destroy
 * @see app/Http/Controllers/Admin/AIAgentController.php:229
 * @route '/admin/ai-agents/{aiAgent}'
 */
destroy.url = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { aiAgent: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { aiAgent: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    aiAgent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        aiAgent: typeof args.aiAgent === 'object'
                ? args.aiAgent.id
                : args.aiAgent,
                }

    return destroy.definition.url
            .replace('{aiAgent}', parsedArgs.aiAgent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIAgentController::destroy
 * @see app/Http/Controllers/Admin/AIAgentController.php:229
 * @route '/admin/ai-agents/{aiAgent}'
 */
destroy.delete = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AIAgentController::toggle
 * @see app/Http/Controllers/Admin/AIAgentController.php:249
 * @route '/admin/ai-agents/{aiAgent}/toggle'
 */
export const toggle = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggle.url(args, options),
    method: 'patch',
})

toggle.definition = {
    methods: ["patch"],
    url: '/admin/ai-agents/{aiAgent}/toggle',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\AIAgentController::toggle
 * @see app/Http/Controllers/Admin/AIAgentController.php:249
 * @route '/admin/ai-agents/{aiAgent}/toggle'
 */
toggle.url = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { aiAgent: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { aiAgent: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    aiAgent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        aiAgent: typeof args.aiAgent === 'object'
                ? args.aiAgent.id
                : args.aiAgent,
                }

    return toggle.definition.url
            .replace('{aiAgent}', parsedArgs.aiAgent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIAgentController::toggle
 * @see app/Http/Controllers/Admin/AIAgentController.php:249
 * @route '/admin/ai-agents/{aiAgent}/toggle'
 */
toggle.patch = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggle.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\AIAgentController::clone
 * @see app/Http/Controllers/Admin/AIAgentController.php:265
 * @route '/admin/ai-agents/{aiAgent}/clone'
 */
export const clone = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: clone.url(args, options),
    method: 'post',
})

clone.definition = {
    methods: ["post"],
    url: '/admin/ai-agents/{aiAgent}/clone',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AIAgentController::clone
 * @see app/Http/Controllers/Admin/AIAgentController.php:265
 * @route '/admin/ai-agents/{aiAgent}/clone'
 */
clone.url = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { aiAgent: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { aiAgent: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    aiAgent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        aiAgent: typeof args.aiAgent === 'object'
                ? args.aiAgent.id
                : args.aiAgent,
                }

    return clone.definition.url
            .replace('{aiAgent}', parsedArgs.aiAgent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIAgentController::clone
 * @see app/Http/Controllers/Admin/AIAgentController.php:265
 * @route '/admin/ai-agents/{aiAgent}/clone'
 */
clone.post = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: clone.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AIAgentController::exportMethod
 * @see app/Http/Controllers/Admin/AIAgentController.php:294
 * @route '/admin/ai-agents/{aiAgent}/export'
 */
export const exportMethod = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/admin/ai-agents/{aiAgent}/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AIAgentController::exportMethod
 * @see app/Http/Controllers/Admin/AIAgentController.php:294
 * @route '/admin/ai-agents/{aiAgent}/export'
 */
exportMethod.url = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { aiAgent: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { aiAgent: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    aiAgent: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        aiAgent: typeof args.aiAgent === 'object'
                ? args.aiAgent.id
                : args.aiAgent,
                }

    return exportMethod.definition.url
            .replace('{aiAgent}', parsedArgs.aiAgent.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIAgentController::exportMethod
 * @see app/Http/Controllers/Admin/AIAgentController.php:294
 * @route '/admin/ai-agents/{aiAgent}/export'
 */
exportMethod.get = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AIAgentController::exportMethod
 * @see app/Http/Controllers/Admin/AIAgentController.php:294
 * @route '/admin/ai-agents/{aiAgent}/export'
 */
exportMethod.head = (args: { aiAgent: string | number | { id: string | number } } | [aiAgent: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AIAgentController::importMethod
 * @see app/Http/Controllers/Admin/AIAgentController.php:307
 * @route '/admin/ai-agents/import'
 */
export const importMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

importMethod.definition = {
    methods: ["post"],
    url: '/admin/ai-agents/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AIAgentController::importMethod
 * @see app/Http/Controllers/Admin/AIAgentController.php:307
 * @route '/admin/ai-agents/import'
 */
importMethod.url = (options?: RouteQueryOptions) => {
    return importMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIAgentController::importMethod
 * @see app/Http/Controllers/Admin/AIAgentController.php:307
 * @route '/admin/ai-agents/import'
 */
importMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})
const aiAgents = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
show: Object.assign(show, show),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
toggle: Object.assign(toggle, toggle),
clone: Object.assign(clone, clone),
export: Object.assign(exportMethod, exportMethod),
import: Object.assign(importMethod, importMethod),
}

export default aiAgents
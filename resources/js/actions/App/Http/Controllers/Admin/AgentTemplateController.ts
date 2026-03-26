import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::index
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:15
 * @route '/admin/agent-templates'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/agent-templates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::index
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:15
 * @route '/admin/agent-templates'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::index
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:15
 * @route '/admin/agent-templates'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::index
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:15
 * @route '/admin/agent-templates'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::create
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:29
 * @route '/admin/agent-templates/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/agent-templates/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::create
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:29
 * @route '/admin/agent-templates/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::create
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:29
 * @route '/admin/agent-templates/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::create
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:29
 * @route '/admin/agent-templates/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::store
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:43
 * @route '/admin/agent-templates'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/agent-templates',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::store
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:43
 * @route '/admin/agent-templates'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::store
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:43
 * @route '/admin/agent-templates'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::show
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:72
 * @route '/admin/agent-templates/{agentTemplate}'
 */
export const show = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/agent-templates/{agentTemplate}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::show
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:72
 * @route '/admin/agent-templates/{agentTemplate}'
 */
show.url = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentTemplate: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { agentTemplate: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    agentTemplate: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agentTemplate: typeof args.agentTemplate === 'object'
                ? args.agentTemplate.id
                : args.agentTemplate,
                }

    return show.definition.url
            .replace('{agentTemplate}', parsedArgs.agentTemplate.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::show
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:72
 * @route '/admin/agent-templates/{agentTemplate}'
 */
show.get = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::show
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:72
 * @route '/admin/agent-templates/{agentTemplate}'
 */
show.head = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::edit
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:84
 * @route '/admin/agent-templates/{agentTemplate}/edit'
 */
export const edit = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/agent-templates/{agentTemplate}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::edit
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:84
 * @route '/admin/agent-templates/{agentTemplate}/edit'
 */
edit.url = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentTemplate: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { agentTemplate: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    agentTemplate: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agentTemplate: typeof args.agentTemplate === 'object'
                ? args.agentTemplate.id
                : args.agentTemplate,
                }

    return edit.definition.url
            .replace('{agentTemplate}', parsedArgs.agentTemplate.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::edit
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:84
 * @route '/admin/agent-templates/{agentTemplate}/edit'
 */
edit.get = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::edit
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:84
 * @route '/admin/agent-templates/{agentTemplate}/edit'
 */
edit.head = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::update
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:99
 * @route '/admin/agent-templates/{agentTemplate}'
 */
export const update = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/agent-templates/{agentTemplate}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::update
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:99
 * @route '/admin/agent-templates/{agentTemplate}'
 */
update.url = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentTemplate: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { agentTemplate: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    agentTemplate: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agentTemplate: typeof args.agentTemplate === 'object'
                ? args.agentTemplate.id
                : args.agentTemplate,
                }

    return update.definition.url
            .replace('{agentTemplate}', parsedArgs.agentTemplate.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::update
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:99
 * @route '/admin/agent-templates/{agentTemplate}'
 */
update.put = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::destroy
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:126
 * @route '/admin/agent-templates/{agentTemplate}'
 */
export const destroy = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/agent-templates/{agentTemplate}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::destroy
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:126
 * @route '/admin/agent-templates/{agentTemplate}'
 */
destroy.url = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentTemplate: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { agentTemplate: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    agentTemplate: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agentTemplate: typeof args.agentTemplate === 'object'
                ? args.agentTemplate.id
                : args.agentTemplate,
                }

    return destroy.definition.url
            .replace('{agentTemplate}', parsedArgs.agentTemplate.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::destroy
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:126
 * @route '/admin/agent-templates/{agentTemplate}'
 */
destroy.delete = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::toggleStatus
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:142
 * @route '/admin/agent-templates/{agentTemplate}/toggle'
 */
export const toggleStatus = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleStatus.url(args, options),
    method: 'patch',
})

toggleStatus.definition = {
    methods: ["patch"],
    url: '/admin/agent-templates/{agentTemplate}/toggle',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::toggleStatus
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:142
 * @route '/admin/agent-templates/{agentTemplate}/toggle'
 */
toggleStatus.url = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentTemplate: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { agentTemplate: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    agentTemplate: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        agentTemplate: typeof args.agentTemplate === 'object'
                ? args.agentTemplate.id
                : args.agentTemplate,
                }

    return toggleStatus.definition.url
            .replace('{agentTemplate}', parsedArgs.agentTemplate.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentTemplateController::toggleStatus
 * @see app/Http/Controllers/Admin/AgentTemplateController.php:142
 * @route '/admin/agent-templates/{agentTemplate}/toggle'
 */
toggleStatus.patch = (args: { agentTemplate: string | { id: string } } | [agentTemplate: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleStatus.url(args, options),
    method: 'patch',
})
const AgentTemplateController = { index, create, store, show, edit, update, destroy, toggleStatus }

export default AgentTemplateController
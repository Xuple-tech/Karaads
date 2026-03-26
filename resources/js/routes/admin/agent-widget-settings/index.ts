import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::index
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:16
* @route '/admin/agent-widget-settings'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/agent-widget-settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::index
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:16
* @route '/admin/agent-widget-settings'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::index
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:16
* @route '/admin/agent-widget-settings'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::index
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:16
* @route '/admin/agent-widget-settings'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::create
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:41
* @route '/admin/agent-widget-settings/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/agent-widget-settings/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::create
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:41
* @route '/admin/agent-widget-settings/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::create
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:41
* @route '/admin/agent-widget-settings/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::create
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:41
* @route '/admin/agent-widget-settings/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::store
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:53
* @route '/admin/agent-widget-settings'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/agent-widget-settings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::store
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:53
* @route '/admin/agent-widget-settings'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::store
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:53
* @route '/admin/agent-widget-settings'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::show
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:80
* @route '/admin/agent-widget-settings/{agentWidgetSetting}'
*/
export const show = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/agent-widget-settings/{agentWidgetSetting}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::show
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:80
* @route '/admin/agent-widget-settings/{agentWidgetSetting}'
*/
show.url = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentWidgetSetting: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentWidgetSetting: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentWidgetSetting: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentWidgetSetting: typeof args.agentWidgetSetting === 'object'
        ? args.agentWidgetSetting.id
        : args.agentWidgetSetting,
    }

    return show.definition.url
            .replace('{agentWidgetSetting}', parsedArgs.agentWidgetSetting.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::show
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:80
* @route '/admin/agent-widget-settings/{agentWidgetSetting}'
*/
show.get = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::show
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:80
* @route '/admin/agent-widget-settings/{agentWidgetSetting}'
*/
show.head = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::edit
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:92
* @route '/admin/agent-widget-settings/{agentWidgetSetting}/edit'
*/
export const edit = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/agent-widget-settings/{agentWidgetSetting}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::edit
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:92
* @route '/admin/agent-widget-settings/{agentWidgetSetting}/edit'
*/
edit.url = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentWidgetSetting: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentWidgetSetting: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentWidgetSetting: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentWidgetSetting: typeof args.agentWidgetSetting === 'object'
        ? args.agentWidgetSetting.id
        : args.agentWidgetSetting,
    }

    return edit.definition.url
            .replace('{agentWidgetSetting}', parsedArgs.agentWidgetSetting.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::edit
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:92
* @route '/admin/agent-widget-settings/{agentWidgetSetting}/edit'
*/
edit.get = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::edit
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:92
* @route '/admin/agent-widget-settings/{agentWidgetSetting}/edit'
*/
edit.head = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::update
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:105
* @route '/admin/agent-widget-settings/{agentWidgetSetting}'
*/
export const update = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/agent-widget-settings/{agentWidgetSetting}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::update
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:105
* @route '/admin/agent-widget-settings/{agentWidgetSetting}'
*/
update.url = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentWidgetSetting: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentWidgetSetting: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentWidgetSetting: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentWidgetSetting: typeof args.agentWidgetSetting === 'object'
        ? args.agentWidgetSetting.id
        : args.agentWidgetSetting,
    }

    return update.definition.url
            .replace('{agentWidgetSetting}', parsedArgs.agentWidgetSetting.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::update
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:105
* @route '/admin/agent-widget-settings/{agentWidgetSetting}'
*/
update.put = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::destroy
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:132
* @route '/admin/agent-widget-settings/{agentWidgetSetting}'
*/
export const destroy = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/agent-widget-settings/{agentWidgetSetting}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::destroy
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:132
* @route '/admin/agent-widget-settings/{agentWidgetSetting}'
*/
destroy.url = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentWidgetSetting: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentWidgetSetting: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentWidgetSetting: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentWidgetSetting: typeof args.agentWidgetSetting === 'object'
        ? args.agentWidgetSetting.id
        : args.agentWidgetSetting,
    }

    return destroy.definition.url
            .replace('{agentWidgetSetting}', parsedArgs.agentWidgetSetting.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::destroy
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:132
* @route '/admin/agent-widget-settings/{agentWidgetSetting}'
*/
destroy.delete = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::script
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:143
* @route '/admin/agent-widget-settings/{agentWidgetSetting}/script'
*/
export const script = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: script.url(args, options),
    method: 'get',
})

script.definition = {
    methods: ["get","head"],
    url: '/admin/agent-widget-settings/{agentWidgetSetting}/script',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::script
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:143
* @route '/admin/agent-widget-settings/{agentWidgetSetting}/script'
*/
script.url = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentWidgetSetting: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentWidgetSetting: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentWidgetSetting: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentWidgetSetting: typeof args.agentWidgetSetting === 'object'
        ? args.agentWidgetSetting.id
        : args.agentWidgetSetting,
    }

    return script.definition.url
            .replace('{agentWidgetSetting}', parsedArgs.agentWidgetSetting.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::script
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:143
* @route '/admin/agent-widget-settings/{agentWidgetSetting}/script'
*/
script.get = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: script.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::script
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:143
* @route '/admin/agent-widget-settings/{agentWidgetSetting}/script'
*/
script.head = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: script.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::preview
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:173
* @route '/admin/agent-widget-settings/{agentWidgetSetting}/preview'
*/
export const preview = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(args, options),
    method: 'get',
})

preview.definition = {
    methods: ["get","head"],
    url: '/admin/agent-widget-settings/{agentWidgetSetting}/preview',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::preview
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:173
* @route '/admin/agent-widget-settings/{agentWidgetSetting}/preview'
*/
preview.url = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { agentWidgetSetting: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { agentWidgetSetting: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            agentWidgetSetting: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        agentWidgetSetting: typeof args.agentWidgetSetting === 'object'
        ? args.agentWidgetSetting.id
        : args.agentWidgetSetting,
    }

    return preview.definition.url
            .replace('{agentWidgetSetting}', parsedArgs.agentWidgetSetting.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::preview
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:173
* @route '/admin/agent-widget-settings/{agentWidgetSetting}/preview'
*/
preview.get = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AgentWidgetSettingsController::preview
* @see app/Http/Controllers/Admin/AgentWidgetSettingsController.php:173
* @route '/admin/agent-widget-settings/{agentWidgetSetting}/preview'
*/
preview.head = (args: { agentWidgetSetting: string | { id: string } } | [agentWidgetSetting: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: preview.url(args, options),
    method: 'head',
})

const agentWidgetSettings = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    script: Object.assign(script, script),
    preview: Object.assign(preview, preview),
}

export default agentWidgetSettings
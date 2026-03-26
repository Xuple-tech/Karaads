import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AIModeController::index
* @see app/Http/Controllers/Admin/AIModeController.php:16
* @route '/admin/ai-modes'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/ai-modes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::index
* @see app/Http/Controllers/Admin/AIModeController.php:16
* @route '/admin/ai-modes'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::index
* @see app/Http/Controllers/Admin/AIModeController.php:16
* @route '/admin/ai-modes'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::index
* @see app/Http/Controllers/Admin/AIModeController.php:16
* @route '/admin/ai-modes'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::create
* @see app/Http/Controllers/Admin/AIModeController.php:50
* @route '/admin/ai-modes/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/ai-modes/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::create
* @see app/Http/Controllers/Admin/AIModeController.php:50
* @route '/admin/ai-modes/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::create
* @see app/Http/Controllers/Admin/AIModeController.php:50
* @route '/admin/ai-modes/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::create
* @see app/Http/Controllers/Admin/AIModeController.php:50
* @route '/admin/ai-modes/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::store
* @see app/Http/Controllers/Admin/AIModeController.php:107
* @route '/admin/ai-modes'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/ai-modes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::store
* @see app/Http/Controllers/Admin/AIModeController.php:107
* @route '/admin/ai-modes'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::store
* @see app/Http/Controllers/Admin/AIModeController.php:107
* @route '/admin/ai-modes'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::show
* @see app/Http/Controllers/Admin/AIModeController.php:58
* @route '/admin/ai-modes/{mode}'
*/
export const show = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/ai-modes/{mode}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::show
* @see app/Http/Controllers/Admin/AIModeController.php:58
* @route '/admin/ai-modes/{mode}'
*/
show.url = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { mode: args }
    }

    if (Array.isArray(args)) {
        args = {
            mode: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        mode: args.mode,
    }

    return show.definition.url
            .replace('{mode}', parsedArgs.mode.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::show
* @see app/Http/Controllers/Admin/AIModeController.php:58
* @route '/admin/ai-modes/{mode}'
*/
show.get = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::show
* @see app/Http/Controllers/Admin/AIModeController.php:58
* @route '/admin/ai-modes/{mode}'
*/
show.head = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::edit
* @see app/Http/Controllers/Admin/AIModeController.php:90
* @route '/admin/ai-modes/{mode}/edit'
*/
export const edit = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/ai-modes/{mode}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::edit
* @see app/Http/Controllers/Admin/AIModeController.php:90
* @route '/admin/ai-modes/{mode}/edit'
*/
edit.url = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { mode: args }
    }

    if (Array.isArray(args)) {
        args = {
            mode: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        mode: args.mode,
    }

    return edit.definition.url
            .replace('{mode}', parsedArgs.mode.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::edit
* @see app/Http/Controllers/Admin/AIModeController.php:90
* @route '/admin/ai-modes/{mode}/edit'
*/
edit.get = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::edit
* @see app/Http/Controllers/Admin/AIModeController.php:90
* @route '/admin/ai-modes/{mode}/edit'
*/
edit.head = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::update
* @see app/Http/Controllers/Admin/AIModeController.php:156
* @route '/admin/ai-modes/{mode}'
*/
export const update = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/ai-modes/{mode}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::update
* @see app/Http/Controllers/Admin/AIModeController.php:156
* @route '/admin/ai-modes/{mode}'
*/
update.url = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { mode: args }
    }

    if (Array.isArray(args)) {
        args = {
            mode: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        mode: args.mode,
    }

    return update.definition.url
            .replace('{mode}', parsedArgs.mode.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::update
* @see app/Http/Controllers/Admin/AIModeController.php:156
* @route '/admin/ai-modes/{mode}'
*/
update.put = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::destroy
* @see app/Http/Controllers/Admin/AIModeController.php:199
* @route '/admin/ai-modes/{mode}'
*/
export const destroy = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/ai-modes/{mode}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::destroy
* @see app/Http/Controllers/Admin/AIModeController.php:199
* @route '/admin/ai-modes/{mode}'
*/
destroy.url = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { mode: args }
    }

    if (Array.isArray(args)) {
        args = {
            mode: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        mode: args.mode,
    }

    return destroy.definition.url
            .replace('{mode}', parsedArgs.mode.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::destroy
* @see app/Http/Controllers/Admin/AIModeController.php:199
* @route '/admin/ai-modes/{mode}'
*/
destroy.delete = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\AIModeController::toggle
* @see app/Http/Controllers/Admin/AIModeController.php:243
* @route '/admin/ai-modes/{mode}/toggle'
*/
export const toggle = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggle.url(args, options),
    method: 'patch',
})

toggle.definition = {
    methods: ["patch"],
    url: '/admin/ai-modes/{mode}/toggle',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::toggle
* @see app/Http/Controllers/Admin/AIModeController.php:243
* @route '/admin/ai-modes/{mode}/toggle'
*/
toggle.url = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { mode: args }
    }

    if (Array.isArray(args)) {
        args = {
            mode: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        mode: args.mode,
    }

    return toggle.definition.url
            .replace('{mode}', parsedArgs.mode.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::toggle
* @see app/Http/Controllers/Admin/AIModeController.php:243
* @route '/admin/ai-modes/{mode}/toggle'
*/
toggle.patch = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggle.url(args, options),
    method: 'patch',
})

const aiModes = {
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    toggle: Object.assign(toggle, toggle),
}

export default aiModes
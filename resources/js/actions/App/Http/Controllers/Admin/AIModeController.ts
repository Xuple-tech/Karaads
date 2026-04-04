import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AIModeController::index
 * @see app/Http/Controllers/Admin/AIModeController.php:16
 * @route '/api/admin/ai-modes'
 */
const index1c86c04afa17b554551c5e8fcbacde73 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index1c86c04afa17b554551c5e8fcbacde73.url(options),
    method: 'get',
})

index1c86c04afa17b554551c5e8fcbacde73.definition = {
    methods: ["get","head"],
    url: '/api/admin/ai-modes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::index
 * @see app/Http/Controllers/Admin/AIModeController.php:16
 * @route '/api/admin/ai-modes'
 */
index1c86c04afa17b554551c5e8fcbacde73.url = (options?: RouteQueryOptions) => {
    return index1c86c04afa17b554551c5e8fcbacde73.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::index
 * @see app/Http/Controllers/Admin/AIModeController.php:16
 * @route '/api/admin/ai-modes'
 */
index1c86c04afa17b554551c5e8fcbacde73.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index1c86c04afa17b554551c5e8fcbacde73.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AIModeController::index
 * @see app/Http/Controllers/Admin/AIModeController.php:16
 * @route '/api/admin/ai-modes'
 */
index1c86c04afa17b554551c5e8fcbacde73.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index1c86c04afa17b554551c5e8fcbacde73.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AIModeController::index
 * @see app/Http/Controllers/Admin/AIModeController.php:16
 * @route '/admin/ai-modes'
 */
const index6b0dcc86fd5ba0fb8433f3ed3fecf46b = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index6b0dcc86fd5ba0fb8433f3ed3fecf46b.url(options),
    method: 'get',
})

index6b0dcc86fd5ba0fb8433f3ed3fecf46b.definition = {
    methods: ["get","head"],
    url: '/admin/ai-modes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::index
 * @see app/Http/Controllers/Admin/AIModeController.php:16
 * @route '/admin/ai-modes'
 */
index6b0dcc86fd5ba0fb8433f3ed3fecf46b.url = (options?: RouteQueryOptions) => {
    return index6b0dcc86fd5ba0fb8433f3ed3fecf46b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::index
 * @see app/Http/Controllers/Admin/AIModeController.php:16
 * @route '/admin/ai-modes'
 */
index6b0dcc86fd5ba0fb8433f3ed3fecf46b.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index6b0dcc86fd5ba0fb8433f3ed3fecf46b.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AIModeController::index
 * @see app/Http/Controllers/Admin/AIModeController.php:16
 * @route '/admin/ai-modes'
 */
index6b0dcc86fd5ba0fb8433f3ed3fecf46b.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index6b0dcc86fd5ba0fb8433f3ed3fecf46b.url(options),
    method: 'head',
})

export const index = {
    '/api/admin/ai-modes': index1c86c04afa17b554551c5e8fcbacde73,
    '/admin/ai-modes': index6b0dcc86fd5ba0fb8433f3ed3fecf46b,
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::store
 * @see app/Http/Controllers/Admin/AIModeController.php:107
 * @route '/api/admin/ai-modes'
 */
const store1c86c04afa17b554551c5e8fcbacde73 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store1c86c04afa17b554551c5e8fcbacde73.url(options),
    method: 'post',
})

store1c86c04afa17b554551c5e8fcbacde73.definition = {
    methods: ["post"],
    url: '/api/admin/ai-modes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::store
 * @see app/Http/Controllers/Admin/AIModeController.php:107
 * @route '/api/admin/ai-modes'
 */
store1c86c04afa17b554551c5e8fcbacde73.url = (options?: RouteQueryOptions) => {
    return store1c86c04afa17b554551c5e8fcbacde73.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::store
 * @see app/Http/Controllers/Admin/AIModeController.php:107
 * @route '/api/admin/ai-modes'
 */
store1c86c04afa17b554551c5e8fcbacde73.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store1c86c04afa17b554551c5e8fcbacde73.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AIModeController::store
 * @see app/Http/Controllers/Admin/AIModeController.php:107
 * @route '/admin/ai-modes'
 */
const store6b0dcc86fd5ba0fb8433f3ed3fecf46b = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store6b0dcc86fd5ba0fb8433f3ed3fecf46b.url(options),
    method: 'post',
})

store6b0dcc86fd5ba0fb8433f3ed3fecf46b.definition = {
    methods: ["post"],
    url: '/admin/ai-modes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::store
 * @see app/Http/Controllers/Admin/AIModeController.php:107
 * @route '/admin/ai-modes'
 */
store6b0dcc86fd5ba0fb8433f3ed3fecf46b.url = (options?: RouteQueryOptions) => {
    return store6b0dcc86fd5ba0fb8433f3ed3fecf46b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::store
 * @see app/Http/Controllers/Admin/AIModeController.php:107
 * @route '/admin/ai-modes'
 */
store6b0dcc86fd5ba0fb8433f3ed3fecf46b.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store6b0dcc86fd5ba0fb8433f3ed3fecf46b.url(options),
    method: 'post',
})

export const store = {
    '/api/admin/ai-modes': store1c86c04afa17b554551c5e8fcbacde73,
    '/admin/ai-modes': store6b0dcc86fd5ba0fb8433f3ed3fecf46b,
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::show
 * @see app/Http/Controllers/Admin/AIModeController.php:58
 * @route '/api/admin/ai-modes/{id}'
 */
const show4b410dc683be2dd3cf70c2b839889dc6 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show4b410dc683be2dd3cf70c2b839889dc6.url(args, options),
    method: 'get',
})

show4b410dc683be2dd3cf70c2b839889dc6.definition = {
    methods: ["get","head"],
    url: '/api/admin/ai-modes/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::show
 * @see app/Http/Controllers/Admin/AIModeController.php:58
 * @route '/api/admin/ai-modes/{id}'
 */
show4b410dc683be2dd3cf70c2b839889dc6.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return show4b410dc683be2dd3cf70c2b839889dc6.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::show
 * @see app/Http/Controllers/Admin/AIModeController.php:58
 * @route '/api/admin/ai-modes/{id}'
 */
show4b410dc683be2dd3cf70c2b839889dc6.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show4b410dc683be2dd3cf70c2b839889dc6.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AIModeController::show
 * @see app/Http/Controllers/Admin/AIModeController.php:58
 * @route '/api/admin/ai-modes/{id}'
 */
show4b410dc683be2dd3cf70c2b839889dc6.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show4b410dc683be2dd3cf70c2b839889dc6.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AIModeController::show
 * @see app/Http/Controllers/Admin/AIModeController.php:58
 * @route '/admin/ai-modes/{mode}'
 */
const showd10de2e8bbbc6fff94bcfbd84a490d74 = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showd10de2e8bbbc6fff94bcfbd84a490d74.url(args, options),
    method: 'get',
})

showd10de2e8bbbc6fff94bcfbd84a490d74.definition = {
    methods: ["get","head"],
    url: '/admin/ai-modes/{mode}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::show
 * @see app/Http/Controllers/Admin/AIModeController.php:58
 * @route '/admin/ai-modes/{mode}'
 */
showd10de2e8bbbc6fff94bcfbd84a490d74.url = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showd10de2e8bbbc6fff94bcfbd84a490d74.definition.url
            .replace('{mode}', parsedArgs.mode.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::show
 * @see app/Http/Controllers/Admin/AIModeController.php:58
 * @route '/admin/ai-modes/{mode}'
 */
showd10de2e8bbbc6fff94bcfbd84a490d74.get = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showd10de2e8bbbc6fff94bcfbd84a490d74.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AIModeController::show
 * @see app/Http/Controllers/Admin/AIModeController.php:58
 * @route '/admin/ai-modes/{mode}'
 */
showd10de2e8bbbc6fff94bcfbd84a490d74.head = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showd10de2e8bbbc6fff94bcfbd84a490d74.url(args, options),
    method: 'head',
})

export const show = {
    '/api/admin/ai-modes/{id}': show4b410dc683be2dd3cf70c2b839889dc6,
    '/admin/ai-modes/{mode}': showd10de2e8bbbc6fff94bcfbd84a490d74,
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::update
 * @see app/Http/Controllers/Admin/AIModeController.php:156
 * @route '/api/admin/ai-modes/{id}'
 */
const update4b410dc683be2dd3cf70c2b839889dc6 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update4b410dc683be2dd3cf70c2b839889dc6.url(args, options),
    method: 'put',
})

update4b410dc683be2dd3cf70c2b839889dc6.definition = {
    methods: ["put"],
    url: '/api/admin/ai-modes/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::update
 * @see app/Http/Controllers/Admin/AIModeController.php:156
 * @route '/api/admin/ai-modes/{id}'
 */
update4b410dc683be2dd3cf70c2b839889dc6.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update4b410dc683be2dd3cf70c2b839889dc6.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::update
 * @see app/Http/Controllers/Admin/AIModeController.php:156
 * @route '/api/admin/ai-modes/{id}'
 */
update4b410dc683be2dd3cf70c2b839889dc6.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update4b410dc683be2dd3cf70c2b839889dc6.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\AIModeController::update
 * @see app/Http/Controllers/Admin/AIModeController.php:156
 * @route '/admin/ai-modes/{mode}'
 */
const updated10de2e8bbbc6fff94bcfbd84a490d74 = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updated10de2e8bbbc6fff94bcfbd84a490d74.url(args, options),
    method: 'put',
})

updated10de2e8bbbc6fff94bcfbd84a490d74.definition = {
    methods: ["put"],
    url: '/admin/ai-modes/{mode}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::update
 * @see app/Http/Controllers/Admin/AIModeController.php:156
 * @route '/admin/ai-modes/{mode}'
 */
updated10de2e8bbbc6fff94bcfbd84a490d74.url = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updated10de2e8bbbc6fff94bcfbd84a490d74.definition.url
            .replace('{mode}', parsedArgs.mode.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::update
 * @see app/Http/Controllers/Admin/AIModeController.php:156
 * @route '/admin/ai-modes/{mode}'
 */
updated10de2e8bbbc6fff94bcfbd84a490d74.put = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updated10de2e8bbbc6fff94bcfbd84a490d74.url(args, options),
    method: 'put',
})

export const update = {
    '/api/admin/ai-modes/{id}': update4b410dc683be2dd3cf70c2b839889dc6,
    '/admin/ai-modes/{mode}': updated10de2e8bbbc6fff94bcfbd84a490d74,
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::destroy
 * @see app/Http/Controllers/Admin/AIModeController.php:199
 * @route '/api/admin/ai-modes/{id}'
 */
const destroy4b410dc683be2dd3cf70c2b839889dc6 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy4b410dc683be2dd3cf70c2b839889dc6.url(args, options),
    method: 'delete',
})

destroy4b410dc683be2dd3cf70c2b839889dc6.definition = {
    methods: ["delete"],
    url: '/api/admin/ai-modes/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::destroy
 * @see app/Http/Controllers/Admin/AIModeController.php:199
 * @route '/api/admin/ai-modes/{id}'
 */
destroy4b410dc683be2dd3cf70c2b839889dc6.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy4b410dc683be2dd3cf70c2b839889dc6.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::destroy
 * @see app/Http/Controllers/Admin/AIModeController.php:199
 * @route '/api/admin/ai-modes/{id}'
 */
destroy4b410dc683be2dd3cf70c2b839889dc6.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy4b410dc683be2dd3cf70c2b839889dc6.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\AIModeController::destroy
 * @see app/Http/Controllers/Admin/AIModeController.php:199
 * @route '/admin/ai-modes/{mode}'
 */
const destroyd10de2e8bbbc6fff94bcfbd84a490d74 = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyd10de2e8bbbc6fff94bcfbd84a490d74.url(args, options),
    method: 'delete',
})

destroyd10de2e8bbbc6fff94bcfbd84a490d74.definition = {
    methods: ["delete"],
    url: '/admin/ai-modes/{mode}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::destroy
 * @see app/Http/Controllers/Admin/AIModeController.php:199
 * @route '/admin/ai-modes/{mode}'
 */
destroyd10de2e8bbbc6fff94bcfbd84a490d74.url = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroyd10de2e8bbbc6fff94bcfbd84a490d74.definition.url
            .replace('{mode}', parsedArgs.mode.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::destroy
 * @see app/Http/Controllers/Admin/AIModeController.php:199
 * @route '/admin/ai-modes/{mode}'
 */
destroyd10de2e8bbbc6fff94bcfbd84a490d74.delete = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyd10de2e8bbbc6fff94bcfbd84a490d74.url(args, options),
    method: 'delete',
})

export const destroy = {
    '/api/admin/ai-modes/{id}': destroy4b410dc683be2dd3cf70c2b839889dc6,
    '/admin/ai-modes/{mode}': destroyd10de2e8bbbc6fff94bcfbd84a490d74,
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::toggleStatus
 * @see app/Http/Controllers/Admin/AIModeController.php:243
 * @route '/api/admin/ai-modes/{id}/toggle'
 */
const toggleStatus8939bbd1253be4e5f4d46c6ddb5bd7e8 = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleStatus8939bbd1253be4e5f4d46c6ddb5bd7e8.url(args, options),
    method: 'patch',
})

toggleStatus8939bbd1253be4e5f4d46c6ddb5bd7e8.definition = {
    methods: ["patch"],
    url: '/api/admin/ai-modes/{id}/toggle',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::toggleStatus
 * @see app/Http/Controllers/Admin/AIModeController.php:243
 * @route '/api/admin/ai-modes/{id}/toggle'
 */
toggleStatus8939bbd1253be4e5f4d46c6ddb5bd7e8.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return toggleStatus8939bbd1253be4e5f4d46c6ddb5bd7e8.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::toggleStatus
 * @see app/Http/Controllers/Admin/AIModeController.php:243
 * @route '/api/admin/ai-modes/{id}/toggle'
 */
toggleStatus8939bbd1253be4e5f4d46c6ddb5bd7e8.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleStatus8939bbd1253be4e5f4d46c6ddb5bd7e8.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Admin\AIModeController::toggleStatus
 * @see app/Http/Controllers/Admin/AIModeController.php:243
 * @route '/admin/ai-modes/{mode}/toggle'
 */
const toggleStatus0da42d6b7284c6cbafbc7c4c50bf7792 = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleStatus0da42d6b7284c6cbafbc7c4c50bf7792.url(args, options),
    method: 'patch',
})

toggleStatus0da42d6b7284c6cbafbc7c4c50bf7792.definition = {
    methods: ["patch"],
    url: '/admin/ai-modes/{mode}/toggle',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::toggleStatus
 * @see app/Http/Controllers/Admin/AIModeController.php:243
 * @route '/admin/ai-modes/{mode}/toggle'
 */
toggleStatus0da42d6b7284c6cbafbc7c4c50bf7792.url = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return toggleStatus0da42d6b7284c6cbafbc7c4c50bf7792.definition.url
            .replace('{mode}', parsedArgs.mode.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::toggleStatus
 * @see app/Http/Controllers/Admin/AIModeController.php:243
 * @route '/admin/ai-modes/{mode}/toggle'
 */
toggleStatus0da42d6b7284c6cbafbc7c4c50bf7792.patch = (args: { mode: string | number } | [mode: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleStatus0da42d6b7284c6cbafbc7c4c50bf7792.url(args, options),
    method: 'patch',
})

export const toggleStatus = {
    '/api/admin/ai-modes/{id}/toggle': toggleStatus8939bbd1253be4e5f4d46c6ddb5bd7e8,
    '/admin/ai-modes/{mode}/toggle': toggleStatus0da42d6b7284c6cbafbc7c4c50bf7792,
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::reorder
 * @see app/Http/Controllers/Admin/AIModeController.php:275
 * @route '/api/admin/ai-modes/reorder'
 */
export const reorder = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(options),
    method: 'post',
})

reorder.definition = {
    methods: ["post"],
    url: '/api/admin/ai-modes/reorder',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AIModeController::reorder
 * @see app/Http/Controllers/Admin/AIModeController.php:275
 * @route '/api/admin/ai-modes/reorder'
 */
reorder.url = (options?: RouteQueryOptions) => {
    return reorder.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AIModeController::reorder
 * @see app/Http/Controllers/Admin/AIModeController.php:275
 * @route '/api/admin/ai-modes/reorder'
 */
reorder.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reorder.url(options),
    method: 'post',
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
const AIModeController = { index, store, show, update, destroy, toggleStatus, reorder, create, edit }

export default AIModeController
import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::index
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:20
 * @route '/saas-owner/prompts'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/saas-owner/prompts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::index
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:20
 * @route '/saas-owner/prompts'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::index
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:20
 * @route '/saas-owner/prompts'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::index
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:20
 * @route '/saas-owner/prompts'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::create
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:56
 * @route '/saas-owner/prompts/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/saas-owner/prompts/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::create
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:56
 * @route '/saas-owner/prompts/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::create
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:56
 * @route '/saas-owner/prompts/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::create
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:56
 * @route '/saas-owner/prompts/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::store
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:66
 * @route '/saas-owner/prompts'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/saas-owner/prompts',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::store
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:66
 * @route '/saas-owner/prompts'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::store
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:66
 * @route '/saas-owner/prompts'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::show
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:89
 * @route '/saas-owner/prompts/{prompt}'
 */
export const show = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/saas-owner/prompts/{prompt}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::show
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:89
 * @route '/saas-owner/prompts/{prompt}'
 */
show.url = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { prompt: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { prompt: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    prompt: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        prompt: typeof args.prompt === 'object'
                ? args.prompt.id
                : args.prompt,
                }

    return show.definition.url
            .replace('{prompt}', parsedArgs.prompt.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::show
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:89
 * @route '/saas-owner/prompts/{prompt}'
 */
show.get = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::show
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:89
 * @route '/saas-owner/prompts/{prompt}'
 */
show.head = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::edit
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:101
 * @route '/saas-owner/prompts/{prompt}/edit'
 */
export const edit = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/saas-owner/prompts/{prompt}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::edit
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:101
 * @route '/saas-owner/prompts/{prompt}/edit'
 */
edit.url = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { prompt: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { prompt: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    prompt: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        prompt: typeof args.prompt === 'object'
                ? args.prompt.id
                : args.prompt,
                }

    return edit.definition.url
            .replace('{prompt}', parsedArgs.prompt.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::edit
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:101
 * @route '/saas-owner/prompts/{prompt}/edit'
 */
edit.get = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::edit
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:101
 * @route '/saas-owner/prompts/{prompt}/edit'
 */
edit.head = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::update
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:113
 * @route '/saas-owner/prompts/{prompt}'
 */
export const update = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/saas-owner/prompts/{prompt}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::update
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:113
 * @route '/saas-owner/prompts/{prompt}'
 */
update.url = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { prompt: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { prompt: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    prompt: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        prompt: typeof args.prompt === 'object'
                ? args.prompt.id
                : args.prompt,
                }

    return update.definition.url
            .replace('{prompt}', parsedArgs.prompt.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::update
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:113
 * @route '/saas-owner/prompts/{prompt}'
 */
update.put = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::test
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:137
 * @route '/saas-owner/prompts/{prompt}/test'
 */
export const test = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

test.definition = {
    methods: ["post"],
    url: '/saas-owner/prompts/{prompt}/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::test
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:137
 * @route '/saas-owner/prompts/{prompt}/test'
 */
test.url = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { prompt: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { prompt: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    prompt: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        prompt: typeof args.prompt === 'object'
                ? args.prompt.id
                : args.prompt,
                }

    return test.definition.url
            .replace('{prompt}', parsedArgs.prompt.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::test
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:137
 * @route '/saas-owner/prompts/{prompt}/test'
 */
test.post = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::destroy
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:157
 * @route '/saas-owner/prompts/{prompt}'
 */
export const destroy = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/saas-owner/prompts/{prompt}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::destroy
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:157
 * @route '/saas-owner/prompts/{prompt}'
 */
destroy.url = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { prompt: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { prompt: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    prompt: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        prompt: typeof args.prompt === 'object'
                ? args.prompt.id
                : args.prompt,
                }

    return destroy.definition.url
            .replace('{prompt}', parsedArgs.prompt.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\CustomPromptController::destroy
 * @see app/Http/Controllers/SaasOwner/CustomPromptController.php:157
 * @route '/saas-owner/prompts/{prompt}'
 */
destroy.delete = (args: { prompt: string | { id: string } } | [prompt: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const prompts = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
show: Object.assign(show, show),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
test: Object.assign(test, test),
destroy: Object.assign(destroy, destroy),
}

export default prompts
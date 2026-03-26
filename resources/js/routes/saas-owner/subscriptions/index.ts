import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::index
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:25
 * @route '/saas-owner/subscriptions'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/saas-owner/subscriptions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::index
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:25
 * @route '/saas-owner/subscriptions'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::index
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:25
 * @route '/saas-owner/subscriptions'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::index
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:25
 * @route '/saas-owner/subscriptions'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::create
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:101
 * @route '/saas-owner/subscriptions/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/saas-owner/subscriptions/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::create
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:101
 * @route '/saas-owner/subscriptions/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::create
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:101
 * @route '/saas-owner/subscriptions/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::create
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:101
 * @route '/saas-owner/subscriptions/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::store
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:118
 * @route '/saas-owner/subscriptions'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/saas-owner/subscriptions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::store
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:118
 * @route '/saas-owner/subscriptions'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::store
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:118
 * @route '/saas-owner/subscriptions'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::show
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:180
 * @route '/saas-owner/subscriptions/{subscription}'
 */
export const show = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/saas-owner/subscriptions/{subscription}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::show
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:180
 * @route '/saas-owner/subscriptions/{subscription}'
 */
show.url = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return show.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::show
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:180
 * @route '/saas-owner/subscriptions/{subscription}'
 */
show.get = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::show
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:180
 * @route '/saas-owner/subscriptions/{subscription}'
 */
show.head = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::edit
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:213
 * @route '/saas-owner/subscriptions/{subscription}/edit'
 */
export const edit = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/saas-owner/subscriptions/{subscription}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::edit
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:213
 * @route '/saas-owner/subscriptions/{subscription}/edit'
 */
edit.url = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return edit.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::edit
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:213
 * @route '/saas-owner/subscriptions/{subscription}/edit'
 */
edit.get = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::edit
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:213
 * @route '/saas-owner/subscriptions/{subscription}/edit'
 */
edit.head = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::update
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:227
 * @route '/saas-owner/subscriptions/{subscription}'
 */
export const update = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/saas-owner/subscriptions/{subscription}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::update
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:227
 * @route '/saas-owner/subscriptions/{subscription}'
 */
update.url = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return update.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::update
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:227
 * @route '/saas-owner/subscriptions/{subscription}'
 */
update.put = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::cancel
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:273
 * @route '/saas-owner/subscriptions/{subscription}/cancel'
 */
export const cancel = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/saas-owner/subscriptions/{subscription}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::cancel
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:273
 * @route '/saas-owner/subscriptions/{subscription}/cancel'
 */
cancel.url = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return cancel.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::cancel
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:273
 * @route '/saas-owner/subscriptions/{subscription}/cancel'
 */
cancel.post = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::pause
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:303
 * @route '/saas-owner/subscriptions/{subscription}/pause'
 */
export const pause = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pause.url(args, options),
    method: 'post',
})

pause.definition = {
    methods: ["post"],
    url: '/saas-owner/subscriptions/{subscription}/pause',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::pause
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:303
 * @route '/saas-owner/subscriptions/{subscription}/pause'
 */
pause.url = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return pause.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::pause
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:303
 * @route '/saas-owner/subscriptions/{subscription}/pause'
 */
pause.post = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pause.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::resume
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:330
 * @route '/saas-owner/subscriptions/{subscription}/resume'
 */
export const resume = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resume.url(args, options),
    method: 'post',
})

resume.definition = {
    methods: ["post"],
    url: '/saas-owner/subscriptions/{subscription}/resume',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::resume
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:330
 * @route '/saas-owner/subscriptions/{subscription}/resume'
 */
resume.url = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscription: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { subscription: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    subscription: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        subscription: typeof args.subscription === 'object'
                ? args.subscription.id
                : args.subscription,
                }

    return resume.definition.url
            .replace('{subscription}', parsedArgs.subscription.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::resume
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:330
 * @route '/saas-owner/subscriptions/{subscription}/resume'
 */
resume.post = (args: { subscription: string | { id: string } } | [subscription: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resume.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::exportMethod
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:364
 * @route '/saas-owner/subscriptions/export/csv'
 */
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/saas-owner/subscriptions/export/csv',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::exportMethod
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:364
 * @route '/saas-owner/subscriptions/export/csv'
 */
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::exportMethod
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:364
 * @route '/saas-owner/subscriptions/export/csv'
 */
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\SubscriptionManagementController::exportMethod
 * @see app/Http/Controllers/SaasOwner/SubscriptionManagementController.php:364
 * @route '/saas-owner/subscriptions/export/csv'
 */
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})
const subscriptions = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
show: Object.assign(show, show),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
cancel: Object.assign(cancel, cancel),
pause: Object.assign(pause, pause),
resume: Object.assign(resume, resume),
export: Object.assign(exportMethod, exportMethod),
}

export default subscriptions
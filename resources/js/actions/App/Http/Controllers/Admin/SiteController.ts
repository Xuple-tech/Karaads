import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SiteController::index
 * @see app/Http/Controllers/Admin/SiteController.php:19
 * @route '/admin/sites'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/sites',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SiteController::index
 * @see app/Http/Controllers/Admin/SiteController.php:19
 * @route '/admin/sites'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteController::index
 * @see app/Http/Controllers/Admin/SiteController.php:19
 * @route '/admin/sites'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SiteController::index
 * @see app/Http/Controllers/Admin/SiteController.php:19
 * @route '/admin/sites'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SiteController::create
 * @see app/Http/Controllers/Admin/SiteController.php:65
 * @route '/admin/sites/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/sites/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SiteController::create
 * @see app/Http/Controllers/Admin/SiteController.php:65
 * @route '/admin/sites/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteController::create
 * @see app/Http/Controllers/Admin/SiteController.php:65
 * @route '/admin/sites/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SiteController::create
 * @see app/Http/Controllers/Admin/SiteController.php:65
 * @route '/admin/sites/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SiteController::store
 * @see app/Http/Controllers/Admin/SiteController.php:81
 * @route '/admin/sites'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/sites',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SiteController::store
 * @see app/Http/Controllers/Admin/SiteController.php:81
 * @route '/admin/sites'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteController::store
 * @see app/Http/Controllers/Admin/SiteController.php:81
 * @route '/admin/sites'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SiteController::show
 * @see app/Http/Controllers/Admin/SiteController.php:121
 * @route '/admin/sites/{site}'
 */
export const show = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/admin/sites/{site}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SiteController::show
 * @see app/Http/Controllers/Admin/SiteController.php:121
 * @route '/admin/sites/{site}'
 */
show.url = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return show.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteController::show
 * @see app/Http/Controllers/Admin/SiteController.php:121
 * @route '/admin/sites/{site}'
 */
show.get = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SiteController::show
 * @see app/Http/Controllers/Admin/SiteController.php:121
 * @route '/admin/sites/{site}'
 */
show.head = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SiteController::edit
 * @see app/Http/Controllers/Admin/SiteController.php:152
 * @route '/admin/sites/{site}/edit'
 */
export const edit = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/sites/{site}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SiteController::edit
 * @see app/Http/Controllers/Admin/SiteController.php:152
 * @route '/admin/sites/{site}/edit'
 */
edit.url = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return edit.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteController::edit
 * @see app/Http/Controllers/Admin/SiteController.php:152
 * @route '/admin/sites/{site}/edit'
 */
edit.get = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SiteController::edit
 * @see app/Http/Controllers/Admin/SiteController.php:152
 * @route '/admin/sites/{site}/edit'
 */
edit.head = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SiteController::update
 * @see app/Http/Controllers/Admin/SiteController.php:171
 * @route '/admin/sites/{site}'
 */
export const update = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/sites/{site}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SiteController::update
 * @see app/Http/Controllers/Admin/SiteController.php:171
 * @route '/admin/sites/{site}'
 */
update.url = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return update.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteController::update
 * @see app/Http/Controllers/Admin/SiteController.php:171
 * @route '/admin/sites/{site}'
 */
update.put = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\SiteController::destroy
 * @see app/Http/Controllers/Admin/SiteController.php:204
 * @route '/admin/sites/{site}'
 */
export const destroy = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/sites/{site}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\SiteController::destroy
 * @see app/Http/Controllers/Admin/SiteController.php:204
 * @route '/admin/sites/{site}'
 */
destroy.url = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return destroy.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteController::destroy
 * @see app/Http/Controllers/Admin/SiteController.php:204
 * @route '/admin/sites/{site}'
 */
destroy.delete = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\SiteController::toggleStatus
 * @see app/Http/Controllers/Admin/SiteController.php:221
 * @route '/admin/sites/{site}/toggle'
 */
export const toggleStatus = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleStatus.url(args, options),
    method: 'patch',
})

toggleStatus.definition = {
    methods: ["patch"],
    url: '/admin/sites/{site}/toggle',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\SiteController::toggleStatus
 * @see app/Http/Controllers/Admin/SiteController.php:221
 * @route '/admin/sites/{site}/toggle'
 */
toggleStatus.url = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return toggleStatus.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteController::toggleStatus
 * @see app/Http/Controllers/Admin/SiteController.php:221
 * @route '/admin/sites/{site}/toggle'
 */
toggleStatus.patch = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleStatus.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\SiteController::toggleWidget
 * @see app/Http/Controllers/Admin/SiteController.php:237
 * @route '/admin/sites/{site}/toggle-widget'
 */
export const toggleWidget = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleWidget.url(args, options),
    method: 'patch',
})

toggleWidget.definition = {
    methods: ["patch"],
    url: '/admin/sites/{site}/toggle-widget',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\SiteController::toggleWidget
 * @see app/Http/Controllers/Admin/SiteController.php:237
 * @route '/admin/sites/{site}/toggle-widget'
 */
toggleWidget.url = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return toggleWidget.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteController::toggleWidget
 * @see app/Http/Controllers/Admin/SiteController.php:237
 * @route '/admin/sites/{site}/toggle-widget'
 */
toggleWidget.patch = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleWidget.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Admin\SiteController::verify
 * @see app/Http/Controllers/Admin/SiteController.php:250
 * @route '/admin/sites/{site}/verify'
 */
export const verify = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(args, options),
    method: 'post',
})

verify.definition = {
    methods: ["post"],
    url: '/admin/sites/{site}/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SiteController::verify
 * @see app/Http/Controllers/Admin/SiteController.php:250
 * @route '/admin/sites/{site}/verify'
 */
verify.url = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return verify.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteController::verify
 * @see app/Http/Controllers/Admin/SiteController.php:250
 * @route '/admin/sites/{site}/verify'
 */
verify.post = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SiteController::resendVerification
 * @see app/Http/Controllers/Admin/SiteController.php:264
 * @route '/admin/sites/{site}/resend-verification'
 */
export const resendVerification = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resendVerification.url(args, options),
    method: 'post',
})

resendVerification.definition = {
    methods: ["post"],
    url: '/admin/sites/{site}/resend-verification',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SiteController::resendVerification
 * @see app/Http/Controllers/Admin/SiteController.php:264
 * @route '/admin/sites/{site}/resend-verification'
 */
resendVerification.url = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return resendVerification.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteController::resendVerification
 * @see app/Http/Controllers/Admin/SiteController.php:264
 * @route '/admin/sites/{site}/resend-verification'
 */
resendVerification.post = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resendVerification.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SiteController::embedCode
 * @see app/Http/Controllers/Admin/SiteController.php:282
 * @route '/admin/sites/{site}/embed-code'
 */
export const embedCode = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: embedCode.url(args, options),
    method: 'get',
})

embedCode.definition = {
    methods: ["get","head"],
    url: '/admin/sites/{site}/embed-code',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SiteController::embedCode
 * @see app/Http/Controllers/Admin/SiteController.php:282
 * @route '/admin/sites/{site}/embed-code'
 */
embedCode.url = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return embedCode.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteController::embedCode
 * @see app/Http/Controllers/Admin/SiteController.php:282
 * @route '/admin/sites/{site}/embed-code'
 */
embedCode.get = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: embedCode.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SiteController::embedCode
 * @see app/Http/Controllers/Admin/SiteController.php:282
 * @route '/admin/sites/{site}/embed-code'
 */
embedCode.head = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: embedCode.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SiteController::analytics
 * @see app/Http/Controllers/Admin/SiteController.php:304
 * @route '/admin/sites/{site}/analytics'
 */
export const analytics = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(args, options),
    method: 'get',
})

analytics.definition = {
    methods: ["get","head"],
    url: '/admin/sites/{site}/analytics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SiteController::analytics
 * @see app/Http/Controllers/Admin/SiteController.php:304
 * @route '/admin/sites/{site}/analytics'
 */
analytics.url = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { site: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { site: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    site: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        site: typeof args.site === 'object'
                ? args.site.id
                : args.site,
                }

    return analytics.definition.url
            .replace('{site}', parsedArgs.site.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SiteController::analytics
 * @see app/Http/Controllers/Admin/SiteController.php:304
 * @route '/admin/sites/{site}/analytics'
 */
analytics.get = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: analytics.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SiteController::analytics
 * @see app/Http/Controllers/Admin/SiteController.php:304
 * @route '/admin/sites/{site}/analytics'
 */
analytics.head = (args: { site: string | number | { id: string | number } } | [site: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: analytics.url(args, options),
    method: 'head',
})
const SiteController = { index, create, store, show, edit, update, destroy, toggleStatus, toggleWidget, verify, resendVerification, embedCode, analytics }

export default SiteController
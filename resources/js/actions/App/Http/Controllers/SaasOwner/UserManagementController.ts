import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::index
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:26
 * @route '/saas-owner/users'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/saas-owner/users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::index
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:26
 * @route '/saas-owner/users'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::index
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:26
 * @route '/saas-owner/users'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::index
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:26
 * @route '/saas-owner/users'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::show
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:108
 * @route '/saas-owner/users/{user}'
 */
export const show = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/saas-owner/users/{user}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::show
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:108
 * @route '/saas-owner/users/{user}'
 */
show.url = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return show.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::show
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:108
 * @route '/saas-owner/users/{user}'
 */
show.get = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::show
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:108
 * @route '/saas-owner/users/{user}'
 */
show.head = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::edit
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:156
 * @route '/saas-owner/users/{user}/edit'
 */
export const edit = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/saas-owner/users/{user}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::edit
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:156
 * @route '/saas-owner/users/{user}/edit'
 */
edit.url = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return edit.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::edit
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:156
 * @route '/saas-owner/users/{user}/edit'
 */
edit.get = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::edit
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:156
 * @route '/saas-owner/users/{user}/edit'
 */
edit.head = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::update
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:166
 * @route '/saas-owner/users/{user}'
 */
export const update = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/saas-owner/users/{user}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::update
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:166
 * @route '/saas-owner/users/{user}'
 */
update.url = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return update.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::update
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:166
 * @route '/saas-owner/users/{user}'
 */
update.put = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::resetPassword
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:201
 * @route '/saas-owner/users/{user}/reset-password'
 */
export const resetPassword = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPassword.url(args, options),
    method: 'post',
})

resetPassword.definition = {
    methods: ["post"],
    url: '/saas-owner/users/{user}/reset-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::resetPassword
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:201
 * @route '/saas-owner/users/{user}/reset-password'
 */
resetPassword.url = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return resetPassword.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::resetPassword
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:201
 * @route '/saas-owner/users/{user}/reset-password'
 */
resetPassword.post = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPassword.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::toggleActive
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:244
 * @route '/saas-owner/users/{user}/toggle-active'
 */
export const toggleActive = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
})

toggleActive.definition = {
    methods: ["post"],
    url: '/saas-owner/users/{user}/toggle-active',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::toggleActive
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:244
 * @route '/saas-owner/users/{user}/toggle-active'
 */
toggleActive.url = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return toggleActive.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::toggleActive
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:244
 * @route '/saas-owner/users/{user}/toggle-active'
 */
toggleActive.post = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleActive.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::destroy
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:274
 * @route '/saas-owner/users/{user}'
 */
export const destroy = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/saas-owner/users/{user}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::destroy
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:274
 * @route '/saas-owner/users/{user}'
 */
destroy.url = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { user: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    user: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        user: typeof args.user === 'object'
                ? args.user.id
                : args.user,
                }

    return destroy.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::destroy
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:274
 * @route '/saas-owner/users/{user}'
 */
destroy.delete = (args: { user: string | { id: string } } | [user: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::exportMethod
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:303
 * @route '/saas-owner/users/export/csv'
 */
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/saas-owner/users/export/csv',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::exportMethod
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:303
 * @route '/saas-owner/users/export/csv'
 */
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::exportMethod
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:303
 * @route '/saas-owner/users/export/csv'
 */
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SaasOwner\UserManagementController::exportMethod
 * @see app/Http/Controllers/SaasOwner/UserManagementController.php:303
 * @route '/saas-owner/users/export/csv'
 */
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})
const UserManagementController = { index, show, edit, update, resetPassword, toggleActive, destroy, exportMethod, export: exportMethod }

export default UserManagementController